import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { OriginalBoqModel } from '../assign-package/assign-package.model';
import { LevelModel,RevisionDetailsList, SupplierPackagesList, SupplierPackagesRevList } from '../package-supplier/package-supplier.model';
import { PackageSupplierService } from '../package-supplier/package-supplier.service';
import { RevisionDetailsService } from './revision-details.service';
import { escapeRegExp } from 'lodash-es';
import { LoginService } from '../login/login.service';
import { User } from '../_models';

@Component({
  selector: 'app-revision-details',
  templateUrl: './revision-details.component.html',
  styleUrls: ['./revision-details.component.css']
})
export class RevisionDetailsComponent implements OnInit, OnDestroy {
  params : any;
  Revision : SupplierPackagesRevList | null;
  psByBoq : number = 0;
  RevisionDetailsList : RevisionDetailsList[] = [];
//AH01022024
  LevelModelList : LevelModel[] = [];
  CurrentLevelList : LevelModel[] = [];
//AH01022024
  RevisionDetailsBoqItems : OriginalBoqModel[] = [];
  supplierPackage : SupplierPackagesList;
  saving : boolean = false;
  packageId : number;
  packageName : string;
  modalScrollDistance = 2;
  modalScrollThrottle = 50;
  sum = 4;
  public user : User;

  constructor(
    private router: Router, 
    private packageSupplierService : PackageSupplierService,
    private route: ActivatedRoute,
    private revisionDetailsService : RevisionDetailsService, 
    private toastr: ToastrService,
    private loginService: LoginService,) {
    /*if (this.router.getCurrentNavigation().extras.state != undefined) {
      let RevisionId = this.router.getCurrentNavigation().extras.state.revisionId;
      let psId = this.router.getCurrentNavigation().extras.state.psId;
      this.psByBoq = this.router.getCurrentNavigation().extras.state.psByBoq;
      this.packageId = this.router.getCurrentNavigation().extras.state.packageId;

      this.packageSupplierService.GetSupplierPackagesSingleRevision(RevisionId).subscribe(data=>{
          this.Revision = data;
          
          this.GetRevisionDetails(this.Revision.prRevId);
         
      });
      this.getPackageSupplier(psId);
    } else {
      this.router.navigateByUrl("/package-list");
    }*/
    this.loginService.user.subscribe(x => this.user = x);
   }

  ngOnInit(): void {
    this.params = this.route.params.subscribe(params => {
      let RevisionId = Number(params['revisionId']);
      let psId = Number(params['psId']);
      this.psByBoq = Number(params['psByBoq']);
      this.packageId = Number(params['packageId']);
      this.packageName = params['packageName'];
      let CostConn=this.user.usrLoggedConnString;
      this.loginService.CheckConnection(CostConn).subscribe((data) => { });

      this.packageSupplierService.GetSupplierPackagesSingleRevision(RevisionId).subscribe(data=>{
        this.Revision = data;
        
        this.GetRevisionDetails(this.Revision.prRevId);
        
        });
        this.getPackageSupplier(psId);
   });
  }

  ngOnDestroy() : void 
  {
      this.params.unsubscribe();
  }

  goBack()
  {
      this.router.navigate(['/package-supplier', this.packageId]);
  }

  getPackageSupplier(prPackSuppId : number)
  { 
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    this.packageSupplierService.GetSupplierPackage(prPackSuppId).subscribe(data=>{
      this.supplierPackage = data;
  });
  }

  UpdateRevisionPricesByBoq(revId : number,  tableId : string)
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

    this.saving = true;
    let revisionDetails : RevisionDetailsList[] = [];
    let table = document.getElementById(tableId) as HTMLTableElement;
    let rows = table.rows;
    for(let i = 1; i < rows.length - 1; i++)
    {
      let row = rows[i];
      let cell = row.cells[2];
      let rdResourceSeq = cell.childNodes[0] as HTMLInputElement;
      let rdBoqItem = cell.childNodes[1] as HTMLInputElement;
      let rdPrice = cell.childNodes[2] as HTMLInputElement;

      let cel3 = row.cells[3];
      let discount = cel3.childNodes[0] as HTMLInputElement;

      let cel6 = row.cells[6];
      let missedPriceReason = cel6.childNodes[0] as HTMLInputElement;

      if(rdResourceSeq.type == 'hidden' && rdBoqItem.type == 'hidden' && rdPrice.type == 'number')
            {
               //console.log(rdResourceSeq.value);
               let revD : RevisionDetailsList = {
                  rdBoqItem : rdBoqItem.value,
                  rdBoqItemDescription : '',
                  rdItemDescription : '',
                  rdQty:0,
                  rdQuotationQty:0,
                  rdMissedPrice : 1,
                  rdPrice : Number(rdPrice.value),
                  rdResourceSeq : Number(rdResourceSeq.value),
                  rdRevisionId : revId,
                  rdMissedPriceReason:String(missedPriceReason.value),
                  rdDiscount : Number(discount.value),
                  rdPriceAfterDiscount : 0,
                  rdTotalPrice : 0,
                  rdAddedItem : 0,
                  rdAddedItemOn : null,

                  IsAlternative : false,
                  IsNew :  false,
                  NewItemId : 0,
                  NewItemResourceId :  0,
                  ParentItemO : "",
                  ParentResourceId : 0,

                  L1:"",
                  L2:"",
                  L3:"",
                  L4:"",
                  L5:"",
                  L6:"",
                  C1:"",
                  C2:"",
                  C3:"",
                  C4:"",
                  C5:"",
                  C6:"",
                  levelName:"",
                  unit:"",
                  comments:"",

                  rdUnitRate:0, 
                  rdTotalBudget:0,
                  exchangeRate:1,
                  rdOriginalPrice:0,
                  TotalSupplierPrice:0,
                  currency:"",
                  insertedBy:"",
                  insertedDate:null,
                  isAlternative : false,
                  isNew : false
               };

               revisionDetails.push(revD);
            }
    }

    this.revisionDetailsService.UpdateRevisionDetailsPriceByBoq(revisionDetails).subscribe(data=>
      {
        this.saving = false;
        if(data)
        {
          this.toastr.success("Prices updated successfuly");
          this.GetRevisionDetails(this.Revision.prRevId);
        }
      });
  }

  UpdateRevisionPrices(revId : number, tableId : string)
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

      this.saving = true;
      let revisionDetails : RevisionDetailsList[] = [];
      let table = document.getElementById(tableId) as HTMLTableElement;
      //console.log(table);
      let rows = table.rows;
      for(let i = 1; i < rows.length - 1; i++)
      {
        let row = rows[i];
        let cell = row.cells[1];
        let table2 = cell.firstElementChild as HTMLTableElement;
        let rows2 = table2.rows;
        //console.log(rows2);
        for(let j = 0; j < rows2.length; j++)
        {
            let row2 = rows2[j];
            let cell2 = row2.cells[1];
            let rdResourceSeq = cell2.firstElementChild as HTMLInputElement;
            let rdPrice = cell2.lastElementChild as HTMLInputElement;
            let missedPriceReason = cell2.childNodes[2] as HTMLInputElement;
            let discount = row.cells[2].childNodes[0] as HTMLInputElement;

            if(rdResourceSeq.type == 'hidden' && rdPrice.type == 'number')
            {
               //console.log(rdResourceSeq.value);
               let revD : RevisionDetailsList = {
                  rdBoqItem : '0',
                  rdBoqItemDescription : '',
                  rdItemDescription : '',
                  rdQty:0,
                  rdQuotationQty:0,
                  rdMissedPrice : 1,
                  rdPrice : Number(rdPrice.value),
                  rdResourceSeq : Number(rdResourceSeq.value),
                  rdRevisionId : revId,
                  rdMissedPriceReason:String(missedPriceReason),
                  rdDiscount : Number(discount.value),
                  rdPriceAfterDiscount : 0,
                  rdTotalPrice : 0,
                  rdAddedItem : 0,
                  rdAddedItemOn : null,

                  IsAlternative : false,
                  IsNew :  false,
                  NewItemId : 0,
                  NewItemResourceId :  0,
                  ParentItemO : "",
                  ParentResourceId : 0,
                  
                  L1:"",
                  L2:"",
                  L3:"",
                  L4:"",
                  L5:"",
                  L6:"",
                  C1:"",
                  C2:"",
                  C3:"",
                  C4:"",
                  C5:"",
                  C6:"",
                  levelName:"",
                  unit:"",
                  comments:"",

                  rdUnitRate:0, 
                  rdTotalBudget:0,
                  exchangeRate:1,
                  rdOriginalPrice:0,
                  TotalSupplierPrice:0,
                  currency:"",
                  insertedBy:"",
                  insertedDate:null,
                  isAlternative : false,
                  isNew : false
               };
               revisionDetails.push(revD);
            }  
        }
      }

      this.revisionDetailsService.UpdateRevisionDetailsPrice(revisionDetails).subscribe(data=>
        {
          this.saving = false;
          if(data)
          {
            this.toastr.success("Prices updated successfuly");
            this.GetRevisionDetails(this.Revision.prRevId);
          }
        });
  }

  searchRevDetails()
  {
    this.GetRevisionDetails(this.Revision.prRevId);
  }

  checkIfItemExistsInResources(arrRevDetails : RevisionDetailsList[], itemO : string)
  {    

      let arr = arrRevDetails.filter(element=>element.rdBoqItem == itemO);  
      
      return arr.length;
  }

  getResourcesPerItem(arrRevDetails : RevisionDetailsList[], itemO : string)
  {
      return arrRevDetails.filter(element=>element.rdBoqItem === itemO);
  }

  GetRevisionDetails(prRevId : number)
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    
    let filterItemDesc = document.getElementById('filterItemDesc') as HTMLInputElement;
    let filterResource = document.getElementById('filterResource') as HTMLInputElement;
      this.packageSupplierService.GetRevisionDetails(prRevId, filterItemDesc.value, filterResource.value,CostConn).subscribe(data=>{
          if(data)
          {
            this.RevisionDetailsBoqItems = [];
            //AH01022024
            // this.RevisionDetailsList = data;
            this.LevelModelList= data;         
            //this.RevisionDetailsList.forEach(rev=>{
            this.LevelModelList.forEach(LevelModel=>
            {
              //AH01022024
              if (LevelModel.items.length>0){
              LevelModel.items.forEach(rev=>
              {
                let item : OriginalBoqModel = 
                {
                  sectionO : '',
                  descriptionO : rev.rdBoqItemDescription,
                  itemO : rev.rdBoqItem,
                  qtyO : 0,
                  rowNumber : 0,
                  scopeO : 0,
                  unitO : '',
                  unitRateO : 0,
                  assignedPackage:'',
                  scopeQtyO:0,
                  billQtyO:0,
                  obTradeDesc:'',
                  isSelected : false,
                  boqStatus:'',
                  l2:'',
                  l3:'',
                  l4:'',
                  c1:'',
                  c2:'',
                  c3:'',
                  c4:''
                };
                //const found = this.RevisionDetailsBoqItems.find(elem => elem.itemO === rev.rdBoqItem);
                //console.log(found); 
                //if(found == undefined)
                this.RevisionDetailsBoqItems.push(item);
                
              }
              
            );

          }
            
          });

          
            //remove duplication
           
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

          for (let i = 0; i < this.sum; ++i) {
            this.CurrentLevelList.push(this.LevelModelList[i]);
          }
          }
      });
  }

  getSplittedLevelName(levelName : any)
  {
     let arr : any[] = levelName.split('|');
     let str = "";
     arr.forEach(element => {
      str += "<br>" + element;
     });
     return this.replaceAll(str, '~', " : ");
  }

  replaceAll(str : string, find : string, replace : string) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
  }

  onScroll(){
    console.log("scrolled!!");

     //add another "sum" items
     const start = this.sum;
     this.sum += 4;
     for (let i = start; i < this.sum; ++i) {
        if((this.LevelModelList.length - 1) >= i)
        {
            this.CurrentLevelList.push(this.LevelModelList[i]);
        }
     }
  }

}
