import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BOQDivList, OriginalBoqModel, PackageList, RESDivList, RESPackageList, RESTypeList, SearchInput, SheetDescList } from '../assign-package/assign-package.model';
import { AssignPackageService } from '../assign-package/assign-package.service';
import { SupplierPackagesList } from '../package-supplier/package-supplier.model';
import { FieldType } from '../_models';
import { AssignSuppliertBoq, AssignSuppliertRes, boqItem, ConditionsReply, PackageSuppliersPrice, ressourceItem, RevisionDetails, SupplierBOQ, SupplierPercent, SupplierResrouces, TblSuppComCondReply, TblSuppTechCondReply, TblTechCond } from './package-comparison.model';
import { PackageComparisonService } from './package-comparison.service';

declare var $: any;
@Component({
  selector: 'app-package-comparison',
  templateUrl: './package-comparison.component.html',
  styleUrls: ['./package-comparison.component.css']
})
export class PackageComparisonComponent implements OnInit {
  PackageId: number = 0;
  packageSuppliersPrice: PackageSuppliersPrice[] = [];
  columns : string[] = ["Resource Name", "Resource Unit", "Resource Qty"];
  revisionDetails: RevisionDetails[] = [];
  comparisonObject: any[] = [];
  comparisonObjectColumns: any[] = [];
  totalPackageSuppliersPrice: any[] = [];
  SupplierPackagesList: SupplierPackagesList[] = [];
  supplierPercent: SupplierPercent[] = [];
  supplierResourcePercent : SupplierPercent[] = [];
  supplierResrouces : SupplierResrouces[] = [];
  supplierBOQ : SupplierBOQ[] = [];
  show: boolean = false;
  isShown: boolean = false; // hidden by default
  SearchInput = new SearchInput();
  BOQDivList: BOQDivList[] = [];
  selectedBOQDivList : BOQDivList[] = []; RESDivList: RESDivList[] = [];
  selectedRESDivList : RESDivList[] = [];
  RESTypeList: RESTypeList[] = [];
  selectedRESTypeList : RESTypeList[] = [];
  PackageList: PackageList[] = [];
  selectedPackages: PackageList[];
  selectedFilterPackages : PackageList[];
  RESPackageList: RESPackageList[] = [];
  selectedFilterResPackages : RESPackageList[] = [];
  SheetDescList: SheetDescList[] = [];
  selectedSheetDescList : SheetDescList[] = [];
  RevisionDetailsBoqItems : OriginalBoqModel[] = [];
  byBoq : number = 0;
  fieldTypes = FieldType;
  selectedResources : number[] = [];
  selectedBoqItems : string[] = [];
  searching : boolean = false;
  isAssigningSupplierRessource : boolean = false;
  isAssigningSupplierList : boolean = false;
  techConditions : TblTechCond[] = [];
  techConditionsReplies : any[][] = [];
  comConditionsReplies : any[][] = [];

  constructor(private router: Router, private packageComparisonService: PackageComparisonService, 
    private spinner: NgxSpinnerService, private toastr: ToastrService, private assignPackageService : AssignPackageService) {
    if (this.router.getCurrentNavigation().extras.state != undefined) {
      this.PackageId = this.router.getCurrentNavigation().extras.state.packageId;
    } else {
      this.router.navigateByUrl("/package-list");
    }
  }

  ngOnInit(): void {
    this.GetBOQDivList();
    this.GetSheetDescList();
    this.GetRESDivList();
    this.GetRESTypeList();
    this.GetPackageSuppliersPrice();
    this.GetSupplierPackagesList();
    //this.getTechConditions();
  }

  /*getTechConditionsReply()
  {
     this.packageComparisonService.getTechConditionsReply().subscribe(data=>{
        this.techConditionsReplies = data;
     });
  }*/

  toggleShow() {
    this.isShown = !this.isShown;
  }

  GetRESDivList() {
    this.assignPackageService.GetRESDivList().subscribe((data) => {
      if (data) {
        this.RESDivList = data;
        this.selectedRESDivList = data;
      }
    });
  }

  GetRESTypeList() {
    this.assignPackageService.GetRESTypeList().subscribe((data) => {
      if (data) {
        this.RESTypeList = data;
        this.selectedRESTypeList = data;
      }
    });
  }

  GetSheetDescList() {
    this.assignPackageService.GetSheetDescList().subscribe((data) => {
      if (data) {
        this.SheetDescList = data;
        this.selectedSheetDescList = data;
      }
    });
  }

  GetPackageSuppliersPrice() {
    //this.spinner.show();
    this.searching = true;
    this.packageComparisonService.GetPackageSuppliersPrice(this.PackageId, this.SearchInput).subscribe((data) => {
      this.searching = false;
      if (data) {
        
        this.RevisionDetailsBoqItems = [];
        this.packageSuppliersPrice = data;
        let isByBoq = this.packageSuppliersPrice[0].byBoq;
        if(isByBoq == 1)
        {
          this.columns = ["Item Description", "Item Unit", "Item Qty"];
        }
        let count = 0;
        let newObj: any[] = [];

        this.packageSuppliersPrice.forEach((element, index) => {
          this.columns.push(element.supplierName + ' (' + moment(element.lastRevisionDate).format('DD-MM-YYYY') + ')');
          count++;
          
          if (count > 1) {
            element.revisionDetails.forEach(revision => {
              //console.log(revision.price);
              var record : any;
              if(isByBoq == 0)
                  record = this.comparisonObject.find((x: { [x: string]: number; }) => x["resourceID"] == revision.resourceID);
              else
                  record = this.comparisonObject.find((x: { [x: string]: string; }) => x["itemO"] == revision.itemO);
              if (record) {
                let newColumn = "price" + count;
                let missedPriceCol = "missedPrice" + count;
                record[newColumn] = revision.price;
                record[missedPriceCol] = revision.missedPrice;
              }

              

            });
          } else {
            this.comparisonObject = element.revisionDetails;
            
          }

         
         
        
        
        });
        
        //console.log(newObj);
        if (newObj.length > 0) {
          this.comparisonObject = newObj;
        }
        if(this.comparisonObject[0] != undefined)
        {
          for (let key of Object.keys(this.comparisonObject[0])) {
            //console.log(key);
            if(isByBoq == 0)
            {
            if (key != "perc" && key != "resourceID" && key != "descriptionO" && key != "rowNumber"  
            && key != "itemO" && key != "sectionO" && key != "unitO" && key != "qtyO" && 
            !key.includes("missedPrice") && key != "boqScope" && key != "boqPackage" && key != "boqDiv"
            &&  key != "boqUprice" && key != "boqQty" && key != "boqUnitMesure" && key != "boqCtg"
            &&  key != "boqSeq" && key != "obSheetDesc" && key != "scope" && key != "unitRate" && key != "priceOrigCur") {
              this.comparisonObjectColumns.push(key);
             }
            }
            else
            {
              if (key != "perc" && key != "resourceID" && key != "rowNumber"  
              && key != "itemO" && key != "sectionO" && key != "resDescription" && key != "resourceUnit" && key != "resourceQty" &&
              !key.includes("missedPrice") && key != "boqScope" && key != "boqPackage" && key != "boqDiv"
              &&  key != "boqUprice" && key != "boqQty" && key != "boqUnitMesure" && key != "boqCtg"
              &&  key != "boqSeq" && key != "obSheetDesc" && key != "scope" && key != "unitRate" && key != "priceOrigCur") {
                this.comparisonObjectColumns.push(key);
               }
            }
          }
        }
        
        let lowest = this.packageSuppliersPrice[0].totalprice;

        this.packageSuppliersPrice.forEach(element => {
          let record: any = element;
          if (element.totalprice < lowest) {
            lowest = element.totalprice;
            record["lowest"] = 1;
            this.totalPackageSuppliersPrice.push(record);
          } else {
            record["lowest"] = 0;
            this.totalPackageSuppliersPrice.push(record);
          }
        });

        
        
        

        //this.spinner.hide();
      } else {
        //this.spinner.hide();
      }
      

      this.comparisonObject.forEach(obj => {
            
        //get Boq items
        let item : OriginalBoqModel = {
          sectionO : '',
          descriptionO : obj.descriptionO,
          itemO : obj.itemO,
          qtyO : 0,
          rowNumber : 0,
          scope : 0,
          unitO : '',
          unitRate : 0
       };
       this.RevisionDetailsBoqItems.push(item);
       
       
      });
      //remove duplication
      this.RevisionDetailsBoqItems.forEach((el, index)=>{
        const uniqueValuesSet = new Set();
        const filteredArr = this.RevisionDetailsBoqItems.filter((obj) => {
          // check if name property value is already in the set
          const isPresentInSet = uniqueValuesSet.has(obj.itemO);
        
          // add name property value to Set
          uniqueValuesSet.add(obj.itemO);
        
          // return the negated value of
          // isPresentInSet variable
          return !isPresentInSet;
        });
        this.RevisionDetailsBoqItems = filteredArr;
      });
      //console.log(this.comparisonObject);
    });

   //console.log(this.RevisionDetailsBoqItems);
    
  }

  isPriceUpdated(item : any, col : string)
  {
    if(col.includes('price'))
    {
        let subCol = col.replace('price', '');
        let val : any;
        if(subCol == '')
          val = item['missedPrice'];
        else
          val = item['missedPrice' + subCol];
        
        return (val == '1');
    }
      return false;
  }

  getPercByResource(revisionDetails : RevisionDetails[], resourceID : number, itemO : string)
  {
    return (revisionDetails.length > 0 ? revisionDetails.find(x=>x.resourceID === resourceID && x.itemO === itemO).perc : 0);
  }

  getPercByItem(revisionDetails : RevisionDetails[], itemO : string)
  {
    return (revisionDetails.length > 0 ? revisionDetails.find(x=>x.itemO === itemO).perc : 0);
  }

  GetSupplierPackagesList() {
    this.techConditionsReplies = [];
    this.packageComparisonService.GetSupplierPackagesList(this.PackageId).subscribe((data) => {
      if (data) {
        this.SupplierPackagesList = data;
        this.byBoq = this.SupplierPackagesList[0].psByBoq;

        this.SupplierPackagesList.forEach((item, index)=>
          {
              let psId = item.psId;
              this.techConditionsReplies.push([]);
              this.comConditionsReplies.push([]);
              this.packageComparisonService.getTechConditionsReply(psId).subscribe((response : ConditionsReply[])=>{
                    
                    this.techConditionsReplies[index].push(response);
                  
              });

              this.packageComparisonService.getComConditionsReply(psId).subscribe((response : ConditionsReply[])=>{
                    
                this.comConditionsReplies[index].push(response);
              
              });
          });
          
      }
    });
    
    
    
  }

  checkIfItemExistsInResources(comparisonObject : any[], itemO : string)
  {
      
      let arr = comparisonObject.filter(element=>element.itemO == itemO);
      
      return arr.length;
  }

  getResourcesPerItem(comparisonObject : any[], itemO : string)
  {
    
      return comparisonObject.filter(element=>element.itemO === itemO);
  }

  AssignPackageSuppliers() 
  {
      let table = document.getElementsByClassName("table-comparison")[0] as HTMLTableElement;
      
      let firstRow = table.rows[0];
    
      let firstRowFirstCell = firstRow.cells[0];
      let firstCheckbox = firstRowFirstCell.firstElementChild as HTMLInputElement;
      if(this.byBoq == 0)
      {
        
        let ressourceItems : ressourceItem[] = [];
        
        this.RevisionDetailsBoqItems.forEach((boq : any, i : number)=>{
          let boqRow = table.rows[i + 1];
  
          if(this.checkIfItemExistsInResources(this.comparisonObject, boq.itemO))
          {
            let resources = this.getResourcesPerItem(this.comparisonObject, boq.itemO);
            resources.forEach((item : any, index : number) => {
                /**skip the table header */
                let subTable = boqRow.cells[1].lastElementChild.firstElementChild as HTMLTableElement;
                let row =  subTable.rows[index + 1];
                let chkBox = row.cells[0].firstChild as HTMLInputElement;
                if(chkBox.checked)
                {
                  ressourceItems.push({resId : item.resourceID});
                }
            });
          }
        });
      
      this.supplierPercent = [];

      let total = 0;
      for (let index = 0; index < this.SupplierPackagesList.length; index++) 
      {
        var input = document.getElementById("valueInput" + index) as HTMLInputElement;
        this.supplierPercent.push({ supID: this.SupplierPackagesList[index].psSuppId, percent: Number(input.value) });
        total += Number(input.value);
      }

      if (total != 100) 
      {
        this.toastr.error("Total Inputs Should be equal to 100");
        this.supplierPercent = [];
      } 
      else 
      {
       
        let assignSuppliertRes : AssignSuppliertRes = {supplierPercentList : this.supplierPercent, supplierResItemList : ressourceItems};
        this.isAssigningSupplierList = true;
        this.packageComparisonService.AssignSupplierListRessourceList(this.PackageId, assignSuppliertRes).subscribe((data) => {
          this.isAssigningSupplierList = false;
          if (data) {
            this.supplierPercent = [];
            this.toastr.success("Assigned Successfully !!");
            $("#assignPackageModal").modal('hide');
            this.comparisonObjectColumns = [];
            this.totalPackageSuppliersPrice = [];
            this.columns = ["Resource Name", "Resource Unit", "Resource Qty"];
            this.GetPackageSuppliersPrice();
            firstCheckbox.checked = false;
          }
        });
      }
    }
    else
    {
        let boqItems : boqItem[] = [];
        this.comparisonObject.forEach((item : any, index : number) => {
          /**skip the table header */
          let row =  table.rows[index + 1];
          let chkBox = row.cells[0].firstChild as HTMLInputElement;
          if(chkBox.checked)
          {
            boqItems.push({boqItemID : item.itemO});
          }
      });

      this.supplierPercent = [];

      let total = 0;
      for (let index = 0; index < this.SupplierPackagesList.length; index++) 
      {
        var input = document.getElementById("valueInput" + index) as HTMLInputElement;
        this.supplierPercent.push({ supID: this.SupplierPackagesList[index].psSuppId, percent: Number(input.value) });
        total += Number(input.value);
      }

      if (total != 100) 
      {
        this.toastr.error("Total Inputs Should be equal to 100");
        this.supplierPercent = [];
      } 
      else 
      {
        let assignSuppliertBoq : AssignSuppliertBoq = {supplierPercentList : this.supplierPercent, supplierBoqItemList : boqItems};
        this.isAssigningSupplierList = true;
        this.packageComparisonService.AssignSupplierListBoqList(this.PackageId, assignSuppliertBoq).subscribe((data) => {
          this.isAssigningSupplierList = false;
          if (data) {
            this.supplierPercent = [];
            this.toastr.success("Assigned Successfully");
            $("#assignPackageModal").modal('hide');
            this.comparisonObjectColumns = [];
            this.totalPackageSuppliersPrice = [];
            this.columns = ["Item Description", "Item Unit", "Item Qty"];
            this.GetPackageSuppliersPrice();
            firstCheckbox.checked = false;
          }
        });
      }
    }
  }

  CloseAssignModal() {
    for (let index = 0; index < this.SupplierPackagesList.length; index++) {
      var input = document.getElementById("valueInput" + index) as HTMLInputElement;
      input.value = null;
    }
    this.supplierPercent = [];
    $("#assignPackageModal").modal('hide');
  }

  OpenAssignModal() {
    //console.log(this.SupplierPackagesList);
    for (let index = 0; index < this.SupplierPackagesList.length; index++) {
      var input = document.getElementById("valueInput" + index) as HTMLInputElement;
      input.value = null;
    }
    $("#assignPackageModal").modal('show');
  }

  OpenAssignInputs() {
    this.show = true;
  }

  Cancel(){
    this.show = false;
  }

  Save(){
    
    //this.show = false;
     var table = document.getElementById("myTable") as HTMLTableElement;
     this.supplierResrouces = [];
     for (let i in table.rows) {
        let row = table.rows[i];
        //iterate through rows
    //    //rows would be accessed using the "row" variable assigned in the for loop
        //console.log("row",row)
        for (let j in row.cells) {
          let col = row.cells[j];
          if(parseInt(i) > 0 && parseInt(i) < (table.rows.length - 2))
          {
            let td = col as HTMLTableCellElement;
            if(parseInt(j) == 0)
            {
              //console.log(td.innerHTML);
            }
            
             
             
          }
          if(j == '6')
          {
            if(col.hasChildNodes)
            {
              for (let k in col.childNodes)
              {
                let p = col.childNodes[k];
                 if(p.hasChildNodes){

                    if(col.childNodes[k].childNodes[2] != undefined)
                    {
                        let input = col.childNodes[k].childNodes[2] as HTMLInputElement;
                        //let totalPerc = parseFloat()
                        //console.log(input.value);
                    }
                 }
              }
            }
          }
            
          //      //iterate through columns
          //columns would be accessed using the "col" variable assigned in the for loop
       }  
    }

  }

  saveNew(){
    if(this.byBoq == 0)
    {
    this.supplierResrouces = [];
    this.supplierResourcePercent = [];
    let table = document.getElementsByClassName("table-comparison")[0] as HTMLTableElement;
    let firstRow = table.rows[0];
   
    let firstRowFirstCell = firstRow.cells[0];
    let firstCheckbox = firstRowFirstCell.firstElementChild as HTMLInputElement;
    
    let percIsValid = true;
    this.RevisionDetailsBoqItems.forEach((boq : any, i : any)=>{
    /**skip the table header */
    let boqRow = table.rows[i + 1];
    
    if(this.checkIfItemExistsInResources(this.comparisonObject, boq.itemO))
    {
        let resources = this.getResourcesPerItem(this.comparisonObject, boq.itemO);
        resources.forEach((item : any, index : any) => {
        this.supplierResourcePercent = [];
        let resourceId = item.resourceID;
      
        let totalPerc = 0;
        
        /**skip the table header */
        let subTable = boqRow.cells[1].lastElementChild.firstElementChild as HTMLTableElement;
        let row =  subTable.rows[index + 1];
        let chkBox = row.cells[0].firstChild as HTMLInputElement;
        /*get the last column which contains the supplier percentage inputs */
        if(chkBox.checked)
        {
        let col = row.cells[row.cells.length - 1];
        
        if(col.hasChildNodes)
        {
          
          for (let k in col.childNodes)
          {
              let p = col.childNodes[k];
              if(p.hasChildNodes)
              {
                if(col.childNodes[k].childNodes[2] != undefined)
                {
                    let input = col.childNodes[k].childNodes[2] as HTMLInputElement;
                    totalPerc += Number(input.value);
                
                    const newSupplierPerc : SupplierPercent = {
                      supID : Number(input.id.split('-')[1]),
                      percent : Number(input.value)
                  };

                  this.supplierResourcePercent.push(newSupplierPerc);
                  
                }
            }
          }

          if(totalPerc > 100 || totalPerc < 100)
          { 
            percIsValid = false;
            row.style.borderColor = "red";
          }
          else
          {    
            row.style.borderColor = "";
          }

          const newSupplierResource : SupplierResrouces = {
            resourceID : Number(resourceId),
            supplierPercents : this.supplierResourcePercent

          };
          this.supplierResrouces.push(newSupplierResource);

          }
        }
        });
      }
    });

    if (!percIsValid) 
    {
        this.toastr.error("Total percentage for each resource should be equal to 100");
        this.supplierResrouces = [];
        this.supplierResourcePercent = [];
        percIsValid = true;
    } 
    else {
        this.isAssigningSupplierRessource = true;
        this.packageComparisonService.AssignSupplierRessource(this.PackageId, this.supplierResrouces).subscribe((data) => {
        this.isAssigningSupplierRessource = false;
        if (data) {
        this.supplierResrouces = [];
        this.supplierResourcePercent = [];
        this.toastr.success("Assigned Successfully !!");
        this.comparisonObjectColumns = [];
        this.totalPackageSuppliersPrice = [];
        this.columns = ["Resource Name", "Resource Unit", "Resource Qty"];
        this.GetPackageSuppliersPrice();
        this.Cancel();
        firstCheckbox.checked = false;
        }
      });
    }
    }
    else
    {
      this.saveNewByBoq();
    }

  }

  saveNewByBoq()
  {
    this.supplierBOQ = [];
    this.supplierResourcePercent = [];
    let table = document.getElementsByClassName("table-comparison")[0] as HTMLTableElement;
    let firstRow = table.rows[0];
   
    let firstRowFirstCell = firstRow.cells[0];
    let firstCheckbox = firstRowFirstCell.firstElementChild as HTMLInputElement;
    let percIsValid = true;

    this.comparisonObject.forEach((item : any, index : any) => {
      this.supplierResourcePercent = [];
      let itemO = item.itemO;
      let totalPerc = 0;
      /*skip table header rows */
      let row =  table.rows[index + 1];
      let chkBox = row.cells[0].firstChild as HTMLInputElement;
      /*get the last column which contains the supplier percentage inputs */
      if(chkBox.checked)
      {
          let col = row.cells[row.cells.length - 1];
          if(col.hasChildNodes)
        {
          
          for (let k in col.childNodes)
          {
              let p = col.childNodes[k];
              if(p.hasChildNodes)
              {
                if(col.childNodes[k].childNodes[2] != undefined)
                {
                    let input = col.childNodes[k].childNodes[2] as HTMLInputElement;
                    totalPerc += Number(input.value);
                
                    const newSupplierPerc : SupplierPercent = {
                      supID : Number(input.id.split('-')[1]),
                      percent : Number(input.value)
                  };

                  this.supplierResourcePercent.push(newSupplierPerc);
                  
                }
            }
          }

          if(totalPerc > 100 || totalPerc < 100)
          { 
            percIsValid = false;
            row.style.borderColor = "red";
          }
          else
          {    
            row.style.borderColor = "";
          }

            const newSupplierBOQ : SupplierBOQ = {
            boqItemID : itemO,
            supplierPercents : this.supplierResourcePercent

          };
          this.supplierBOQ.push(newSupplierBOQ);

          }
      }
    });

    if (!percIsValid) 
    {
        this.toastr.error("Total percentage for each BOQ Item should be equal to 100");
        this.supplierBOQ = [];
        this.supplierResourcePercent = [];
        percIsValid = true;
    } 
    else {
        this.isAssigningSupplierRessource = true;
        this.packageComparisonService.AssignSupplierBOQ(this.PackageId, this.supplierBOQ).subscribe((data) => {
        this.isAssigningSupplierRessource = false;
        if (data) {
        this.supplierBOQ = [];
        this.supplierResourcePercent = [];
        this.toastr.success("Assigned Successfully");
        this.comparisonObjectColumns = [];
        this.totalPackageSuppliersPrice = [];
        this.columns = ["Item Description", "Item Unit", "Item Qty"];
        this.GetPackageSuppliersPrice();
        this.Cancel();
        firstCheckbox.checked = false;
        }
      });
    }

  }

  getTechConditions()
  {
      this.packageComparisonService.getTechConditions(Number(this.PackageId)).subscribe(data=>{
          this.techConditions = data;
          console.log(this.techConditions);
      });
  }

  filterBOQDiv(event: KeyboardEvent)
  {
    const txt = event.target as HTMLInputElement;
    
    let result: BOQDivList[] = [];
    for(let a of this.BOQDivList){
      if(a.sectionO.toLowerCase().indexOf(txt.value.toLowerCase()) > -1){
        result.push(a)
      }
    }
    this.selectedBOQDivList = result;
  }

  filterRESDiv(event: KeyboardEvent)
  {
    const txt = event.target as HTMLInputElement;
    
    let result: RESDivList[] = [];
    for(let a of this.RESDivList){
      if(a.boqDiv.toLowerCase().indexOf(txt.value.toLowerCase()) > -1){
        result.push(a)
      }
    }
    this.selectedRESDivList = result;
  }

  filterSheetDesc(event: KeyboardEvent)
  {
    const txt = event.target as HTMLInputElement;
    
    let result: SheetDescList[] = [];
    for(let a of this.SheetDescList){
      if(a.obSheetDesc.toLowerCase().indexOf(txt.value.toLowerCase()) > -1){
        result.push(a)
      }
    }
    this.selectedSheetDescList = result;
  }

  filterSearchRESType(event: KeyboardEvent)
  {
    const txt = event.target as HTMLInputElement;
    
    let result: RESTypeList[] = [];
    for(let a of this.RESTypeList){
      if(a.boqCtg.toLowerCase().indexOf(txt.value.toLowerCase()) > -1){
        result.push(a)
      }
    }
    this.selectedRESTypeList = result;
  }

  filterSearchPackages(event: KeyboardEvent)
  {
    const txt = event.target as HTMLInputElement;
    
    let result: PackageList[] = [];
    for(let a of this.PackageList){
      if(a.pkgeName.toLowerCase().indexOf(txt.value.toLowerCase()) > -1){
        result.push(a)
      }
    }
    this.selectedFilterPackages = result;
  }

  filterSearchRESPackage(event: KeyboardEvent)
  {
    const txt = event.target as HTMLInputElement;
    
    let result: RESPackageList[] = [];
    for(let a of this.RESPackageList){
      if(a.boqPackage.toLowerCase().indexOf(txt.value.toLowerCase()) > -1){
        result.push(a)
      }
    }
    this.selectedFilterResPackages = result;
  }

  GetBOQDivList() {
    this.assignPackageService.GetBOQDivList().subscribe((data) => {
      if (data) {
        this.BOQDivList = data;
        this.selectedBOQDivList = data;
      }
    });
  }


  onSearch(){
    this.totalPackageSuppliersPrice = [];
    this.columns = ["Resource Name", "Resource Unit", "Resource Qty"];
    this.comparisonObject = [];
    this.comparisonObjectColumns = [];
    this.GetPackageSuppliersPrice();
  }

  selectAllItemsByBoq(target : any)
  {
    let checkbox = target as HTMLInputElement;
    let cell = checkbox.parentElement as HTMLTableCellElement;
    let row = cell.parentElement as HTMLTableRowElement;
    let table = row.parentElement.parentElement as HTMLTableElement;
    
    let rows = table.rows;
    
    for(let i = 1; i< rows.length - 3; i++)
    {
      rows[i].style.backgroundColor = (checkbox.checked? '#f1f1f1' : '');
      let firstCell = rows[i].cells[0];
      let subCheckbox = firstCell.firstElementChild as HTMLInputElement;
      let hidden = firstCell.lastElementChild as HTMLInputElement;
      subCheckbox.checked = checkbox.checked;
      this.selectBoqItem(subCheckbox, hidden.value, target);
     

    }

    if(!checkbox.checked)
      this.Cancel();
  }

  getParentTargetByBoqItem(target : any)
  {
    let checkbox = target as HTMLInputElement;
    let cell = checkbox.parentElement as HTMLTableCellElement;
    let row = cell.parentElement as HTMLTableRowElement;
    let table = row.parentElement.parentElement as HTMLTableElement;
    let row0 = table.rows[0];
    let parentCheckbox = row0.firstElementChild.firstElementChild as HTMLInputElement;
    return parentCheckbox;   
  }

  selectBoqItem(target : any, itemO : string, headerTarget : any)
  {
    let checkbox = target as HTMLInputElement;
    let cell = checkbox.parentElement as HTMLTableCellElement;
    let row = cell.parentElement as HTMLTableRowElement;
    row.style.backgroundColor = (checkbox.checked? '#f1f1f1' : '');
    if(checkbox.checked)
    {
      if(this.selectedBoqItems.indexOf(itemO) == -1)
      {
        this.selectedBoqItems.push(itemO);
      }
    }
    else
    {
        this.selectedBoqItems.splice(this.selectedBoqItems.indexOf(itemO), 1);
    }

    if(this.selectedBoqItems.length == 0)
    {
        this.Cancel();
        let headerCheckbox = headerTarget as HTMLInputElement;
        headerCheckbox.checked = false;
    }
  }

  selectItemByResource(target : any, parentTarget : any)
  {
      let checkbox = target as HTMLInputElement;
      let cell = checkbox.parentElement as HTMLTableCellElement;
      let row = cell.parentElement as HTMLTableRowElement;
      let div = row.cells[1].lastElementChild as HTMLDivElement;
      let table = div.firstElementChild as HTMLTableElement;
      let rows = table.rows;
      //row.style.backgroundColor = (checkbox.checked? '#f1f1f1' : '');
      for(let i = 1; i< rows.length; i++)
      {
          rows[i].style.backgroundColor = (checkbox.checked? '#f1f1f1' : '');
          let firstCell = rows[i].cells[0];
          let subCheckbox = firstCell.firstElementChild as HTMLInputElement;
          let hidden = firstCell.lastElementChild as HTMLInputElement;
          subCheckbox.checked = checkbox.checked;
          this.selectResource(subCheckbox, Number(hidden.value), checkbox, null);
      }

      
      if(this.selectedResources.length == 0)
      {
          this.Cancel();
          let parentCheckbox = parentTarget as HTMLInputElement;
          parentCheckbox.checked = false;
      }
      
  }

  getParentItemTargetByResource(target : any)
  {
    let checkbox = target as HTMLInputElement;
    let cell = checkbox.parentElement as HTMLTableCellElement;
    let row = cell.parentElement as HTMLTableRowElement;
    let table = row.parentElement.parentElement as HTMLTableElement;
    let cellParent = table.parentElement.parentElement as HTMLTableCellElement;
    let rowParent = cellParent.parentElement as HTMLTableRowElement;
    let checkboxParent = rowParent.cells[0].firstElementChild as HTMLInputElement;
    return checkboxParent;

  }

  selectAllItemsByResource(target : any)
  {
    let checkbox = target as HTMLInputElement;
    let cell = checkbox.parentElement as HTMLTableCellElement;
    let row = cell.parentElement as HTMLTableRowElement;
   
    let table = row.parentElement.parentElement as HTMLTableElement;
    
    let rows = table.rows;
    for(let i = 1; i< rows.length - 3; i++)
    {
        let subRow = rows[i];
        let letSubCell = subRow.cells[0];
        let subCheckbox = letSubCell.firstElementChild as HTMLInputElement;
        subCheckbox.checked = checkbox.checked;
        this.selectItemByResource(subCheckbox, target);
    }

    if(!checkbox.checked)
    {
      this.Cancel();
      this.selectedResources = [];
    }
  }

  getParentTargetByResource(target : any)
  {
    let checkbox = target as HTMLInputElement;
    let cell = checkbox.parentElement as HTMLTableCellElement;
    let row = cell.parentElement as HTMLTableRowElement;
    let table = row.parentElement.parentElement as HTMLTableElement;
    let row0 = table.rows[0];
    let parentCheckbox = row0.firstElementChild.firstElementChild as HTMLInputElement;
    return parentCheckbox;
  }

  selectResource(target : any, resourceID : number, parentTarget : any, itemO : string)
  {
    
    let checkbox = target as HTMLInputElement;
    let cell = checkbox.parentElement as HTMLTableCellElement;
    let row = cell.parentElement as HTMLTableRowElement;
    row.style.backgroundColor = (checkbox.checked? '#f1f1f1' : '');
    if(checkbox.checked)
    {
        if(this.selectedResources.indexOf(resourceID) == -1)
        {
          this.selectedResources.push(resourceID);
        }
    }
    else
    {
        this.selectedResources.splice(this.selectedResources.indexOf(resourceID), 1);
    }
    
    let parentCheckbox = parentTarget as HTMLInputElement;
    if(this.selectedResources.length == 0)
    {
        this.Cancel();
        
        let parentOfParentCheckbox = this.getParentTargetByBoqItem(parentCheckbox) as HTMLInputElement;
        parentOfParentCheckbox.checked = false;
    }

    if(itemO != null && !this.existsItemResources(itemO))
    {
      parentCheckbox.checked = false;
    }
  }

  existsItemResources(itemO : string)
  {
    let exists = false;
    let arr = this.comparisonObject.filter(element=>element.itemO === itemO);
    arr.forEach(co=>{
      if(this.selectedResources.indexOf(Number(co.resourceID)) > -1)
      {
        exists = true;
        return;
      }
    });
    return exists;
  }

  isResourceSelected(resourceID : number)
  {
     return (this.selectedResources.indexOf(resourceID) > -1);
  }

  isBoqItemSelected(itemO : string)
  {
     return (this.selectedBoqItems.indexOf(itemO) > -1);
  }


  clearAllSelections()
  {
    this.selectedResources = [];
    this.selectedBoqItems = [];
  }
}
