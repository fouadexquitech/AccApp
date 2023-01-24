import { Component, ElementRef, OnInit, OnDestroy, QueryList, ViewChildren, ViewChild, AfterViewInit, ɵpatchComponentDefWithScope } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AssignBoqList, AssignOriginalBoqList, AssignPackages, BOQDivList,BOQLevelList, BoqModel, OriginalBoqModel, PackageList, RESDivList, RESPackageList, RESTypeList, SearchInput, SheetDescList } from './assign-package.model';
import { AssignPackageService } from './assign-package.service';
import { Subject } from 'rxjs';
import { DataTableDirective} from 'angular-datatables';
import {environment} from '../../environments/environment';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
declare var $: any;

@Component({
  selector: 'app-assign-package',
  templateUrl: './assign-package.component.html',
  styleUrls: ['./assign-package.component.css']
})
export class AssignPackageComponent implements OnDestroy, OnInit, AfterViewInit {

  isShown: boolean = false; // hidden by default
  isAssignShown: boolean = false; // hidden by default
  isExportShown: boolean = false; // hidden by default
  BOQDivList: BOQDivList[] = [];
  public selectedBOQDivList : BOQDivList[] = [];
  BOQLevelList: BOQLevelList[] = [];
  public selectedBOQLevel2List : BOQLevelList[] = [];
  RESDivList: RESDivList[] = [];
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
  OriginalBoqList: OriginalBoqModel[] = [];
  BoqList: BoqModel[] = [];
  displayedBoqList : BoqModel[] = [];
  SelectedOriginalBoqList: AssignOriginalBoqList[] = [];
  SelectedBoqList: AssignBoqList[] = [];
  CurrentRowIndex: number = 0;
  SelectedBoqQty: number = 0;
  SearchInput = new SearchInput();
  assignPackages = new AssignPackages();
  SelectedPackage: number = 0;
  SelectedOriginalBoqRow = new OriginalBoqModel();
  SelectedBoqRow = new BoqModel();
  FinalUnitPrice: number = 0;
  FinalTotalPrice : number = 0;
  public dtOptions: DataTables.Settings = {};
  public dtTrigger: Subject<any> = new Subject<any>();
  public select2Options : Select2.Options = {};
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;
  public isAssigning : boolean = false;
  public isSearching : boolean = false;
  @ViewChildren("checkboxes") checkboxes!: QueryList<ElementRef>;
  mode : string = 'add';
  EditBoqQtyModalLabel : string = '';
  formEdit: FormGroup;
  submitted : boolean = false;
  updating : boolean = false;
  currentOrigBoq : OriginalBoqModel;
  modalReference : any;
  modalOptions:NgbModalOptions;
  closeResult: string;


  constructor(private assignPackageService: AssignPackageService, 
    private modalService: NgbModal,private spinner: NgxSpinnerService , 
    private toastr: ToastrService,
    private router : Router,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.select2Options = {
      multiple : true
    };

    this.dtOptions = {
      //pagingType: 'full_numbers',
      //pageLength: 10,
      paging : false,
      info : false,
      searching : false,
      destroy : true,
      scrollY: "300px",
      scrollCollapse: true,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        let checkbox = row.firstChild.firstChild as HTMLInputElement;
        let rowNumberCell = row.childNodes[1] as HTMLTableCellElement;
        let rowNumber = Number(rowNumberCell.innerHTML);
        if(checkbox)
        {
            if(checkbox.type == 'checkbox')
            { 
              checkbox.checked = false;
               this.SelectedOriginalBoqList.forEach(function (item) {
                  if(item.rowNumber === rowNumber)
                  {
                    checkbox.checked = true;
                  }
                });
            }
        }
      }
    };

    this.GetBOQDivList();
    this.GetBOQLevel2List();
    this.GetRESDivList();
    this.GetRESTypeList();
    this.GetPackageList();
    this.GetRESPackageList();
    this.GetSheetDescList();
    this.GetOriginalBoqList(this.SearchInput);
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
    });
  }

  ngAfterViewInit() {
    this.dtTrigger.next();
  }
  toggleShow() {
    this.isShown = !this.isShown;
  }

  toggleAssignShow() {
    this.isAssignShown = !this.isAssignShown;
  }

  toggleExportShow() {
    this.isExportShown = !this.isExportShown;
  }

  GetBOQDivList() {
    this.assignPackageService.GetBOQDivList().subscribe((data) => {
      if (data) {
        this.BOQDivList = data;
        this.selectedBOQDivList = data;
        console.log(data)
      }
    });
  }

  GetBOQLevel2List() {
    this.assignPackageService.GetBOQLevel2List().subscribe((data) => {
      if (data) {
        this.BOQLevelList = data;
        this.selectedBOQLevel2List = data;
        console.log(data)
      }
    });
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

  GetPackageList() {
    this.assignPackageService.GetPackageList().subscribe((data) => {
      if (data) {
        this.PackageList = data;
        this.selectedPackages = this.PackageList;
        this.selectedFilterPackages = data;
      }
    });
  }

  GetRESPackageList() {
    this.assignPackageService.GetRESPackageList().subscribe((data) => {
      if (data) {
        this.RESPackageList = data;
        this.selectedFilterResPackages = data;
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

  GetOriginalBoqList(input: SearchInput) {
    //this.spinner.show();
    this.isSearching = true;
    this.assignPackageService.GetOriginalBoqList(input).subscribe((data) => {
      this.isSearching = false;
      this.toggleShow();
      if (data) {
        this.OriginalBoqList = data;
        //this.spinner.hide();
        this.rerender();
      }
    });
  }

  GetBoqList(itemO: string, input: SearchInput) {
    this.assignPackageService.GetBoqList(itemO, input).subscribe((data) => {
      if (data) {
        let lst = this.SelectedBoqList;
        let pkg = this.SelectedPackage;
        this.BoqList = data;
        this.BoqList.forEach(function(element){
          element.isSelected = true;
          if(!lst.includes(element, 0))
          {
            lst.push({ boqSeq: element.boqSeq, boqScope : pkg, boqResSeq : element.boqResSeq, boqItem : element.boqItem });
          }
        });
        
        //this.FinalUnitPrice = 0;
      
        /*this.BoqList.forEach(element => {
          this.FinalUnitPrice += this.SelectedBoqQty * element.boqUprice;
        });*/

        //this.manageChildren(true);
        this.editDisplayedBoqList(this.BoqList, true);
      }
    });
  }

  waitForElm(selector : any) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

  manageChildren(check : boolean)
  {
      let lst = this.BoqList;
      this.waitForElm('.boqTable').then((elm) => {
      let boqTable = elm as HTMLTableElement;
      if(boqTable)
      {
        console.log(boqTable.rows.length);
        for(let index = 1; index < boqTable.rows.length; index++)
        {
          
          let row = boqTable.rows[index] as HTMLTableRowElement;
          let checkbox = row.firstChild.firstChild as HTMLInputElement;
          if(checkbox)
          {
              checkbox.checked = check;
              let boqRow = this.BoqList[index - 1];
              if(check)
              {
                this.SelectedBoqList.push({ boqSeq: boqRow.boqSeq, boqScope: this.SelectedPackage, boqResSeq : boqRow.boqResSeq, boqItem : boqRow.boqItem });
              }
              else
              {
                const newIndex = this.SelectedBoqList.findIndex(x => x.boqSeq === boqRow.boqSeq);
                this.SelectedBoqList.splice(newIndex, 1);
              }
          }
        }
        
      }
  });
  }

  OnOriginalBoqChecked(evt: any, index: number) {
    this.SelectedOriginalBoqRow = this.OriginalBoqList[index];
    if (evt.target.checked) {
      this.SelectedOriginalBoqList.push({ rowNumber: this.SelectedOriginalBoqRow.rowNumber, scope: this.SelectedPackage });
    } else {
      const newIndex = this.SelectedOriginalBoqList.findIndex(x => x.rowNumber === this.SelectedOriginalBoqRow.rowNumber);
      if (newIndex > -1) {
        this.SelectedOriginalBoqList.splice(newIndex, 1);
      }
    }
  }

  OnBoqChecked(evt: any, index: number) {
    
    this.SelectedBoqRow = this.displayedBoqList[index];
    
    if (!evt.target.checked)
    {
      this.FinalTotalPrice -= this.SelectedBoqRow.boqUprice * this.SelectedBoqRow.boqQty;
      this.FinalUnitPrice -= this.SelectedBoqRow.totalUnitPrice;
      this.SelectedBoqList = this.SelectedBoqList.filter(x=>x.boqResSeq != this.SelectedBoqRow.boqResSeq);

      this.displayedBoqList.splice(index, 1);
      this.checkOriginalBoq();
    }
  }

  checkOriginalBoq()
  {
      this.OriginalBoqList.forEach((item, index)=>{
      let arr = this.SelectedBoqList.filter(x=>x.boqItem === item.itemO);
          
          if(arr.length == 0)
          {   
            this.SelectedOriginalBoqList = this.SelectedOriginalBoqList.filter(x=>x.rowNumber != item.rowNumber);
            this.removeSelectedOriginalBoq(index);   
          }   
      });

      //console.log(this.SelectedOriginalBoqList);
  }

  removeSelectedOriginalBoq(index : number)
  {
   
    let originalBOQTable = document.getElementById('originalBOQTable') as HTMLTableElement;
    //check the selected row
    if(originalBOQTable)
    {
      let row = originalBOQTable.rows[index + 1] as HTMLTableRowElement;
      let checkbox = row.firstChild.firstChild as HTMLInputElement;
          
      if(checkbox)
      {
          if(checkbox.type == 'checkbox')
          { 
            checkbox.checked = false;
          }
      }
    }
  }

  selectRow(event: any, index: any) {

    this.CurrentRowIndex = index;
    this.SelectedBoqQty = this.OriginalBoqList[index]["qtyO"];
    let rowNumber = this.OriginalBoqList[index]["rowNumber"];
    let itemO = this.OriginalBoqList[index]["itemO"];
    let originalBOQTable = document.getElementById('originalBOQTable') as HTMLTableElement;
    //check the selected row
    if(originalBOQTable)
    {
      let row = originalBOQTable.rows[index + 1] as HTMLTableRowElement;
      let checkbox = row.firstChild.firstChild as HTMLInputElement;
      let rowNumberCell = row.childNodes[1] as HTMLTableCellElement;
      let rowNumber = Number(rowNumberCell.innerHTML);
     
      if(checkbox)
      {
          if(checkbox.type == 'checkbox')
          { 
              checkbox.checked = !checkbox.checked;
              this.SelectedOriginalBoqRow = this.OriginalBoqList[index];
              if(checkbox.checked)
              {
                this.SelectedOriginalBoqList.push({ rowNumber: this.SelectedOriginalBoqRow.rowNumber, scope: this.SelectedPackage });
                this.GetBoqList(this.OriginalBoqList[index]["itemO"], this.SearchInput);
              }
               else 
              {
                const newIndex = this.SelectedOriginalBoqList.findIndex(x => x.rowNumber === this.SelectedOriginalBoqRow.rowNumber);
                if (newIndex > -1) {
                  this.SelectedOriginalBoqList.splice(newIndex, 1);

                  //uncheck all children
                  let selectedBoqArr = this.SelectedBoqList;
                                 
                  this.assignPackageService.GetBoqList(itemO, this.SearchInput).subscribe((data) => {
                    if (data) {
                      this.BoqList = data;
                      let selectedBoqArr = this.SelectedBoqList;
                     
                      this.BoqList.forEach(function(el : any){
                   
                        el.isSelected = false;
                        const subIndex = selectedBoqArr.findIndex(x => x.boqSeq === el.boqSeq);
                        
                        selectedBoqArr.splice(subIndex, 1);
                    });

                    this.editDisplayedBoqList(this.BoqList, false);
                    }
                  });                 
                }
              }           
          }
      }
    }

    //console.log(this.SelectedBoqList);
  
  }

  

  editDisplayedBoqList(BoqList : BoqModel[], add : boolean)
  {
    BoqList.forEach(boq=>{
        let boqItem = this.OriginalBoqList.find(x=>x.itemO == boq.boqItem);
        boq.totalUnitPrice = boqItem.unitRate;
        let item = this.displayedBoqList.find(a=>a.boqResSeq == boq.boqResSeq);
        
        if(add)
        {
          this.FinalTotalPrice += (boq.boqQty * boq.boqUprice);
          this.FinalUnitPrice += (boq.totalUnitPrice);
          if(item)
          {
            item.boqQty += boq.boqQty;   
            item.totalUnitPrice += boq.totalUnitPrice;
          }
          else
          {
            this.displayedBoqList.push(boq);
          }       
        }
        else
        {
            this.FinalTotalPrice -= (boq.boqQty * boq.boqUprice);
            this.FinalUnitPrice -= (boq.totalUnitPrice);
            if(item)
            {   
                if((item.boqQty - boq.boqQty) > 0)
                {
                  item.boqQty -= boq.boqQty;
                  item.totalUnitPrice -= boq.totalUnitPrice;
                }
                else
                {
                  this.displayedBoqList.splice(this.displayedBoqList.indexOf(item), 1)
                }
            }
        }
    });
  }

  clearAllSelections()
  {
    this.SelectedOriginalBoqList = [];
    this.SelectedBoqList = [];
    this.BoqList = [];
    this.displayedBoqList = [];
    this.FinalUnitPrice = 0;
    this.FinalTotalPrice = 0;
    let originalBOQTable = document.getElementById('originalBOQTable') as HTMLTableElement;
    if(originalBOQTable)
      {
          for(let index = 0; index < originalBOQTable.rows.length; index ++)
          {
            let row = originalBOQTable.rows[index] as HTMLTableRowElement;
            let rowCheckbox = row.firstChild.firstChild as HTMLInputElement;
            let rowNumberCell = row.childNodes[1] as HTMLTableCellElement;
            let rowNumber = Number(rowNumberCell.innerHTML);
           
            if(rowCheckbox)
            {
              rowCheckbox.checked = false;
            }
          }
      }
  }

 
  checkAllOriginalBoq(event : any) {
    this.SelectedOriginalBoqList = [];
    this.SelectedBoqList = [];
    this.BoqList = [];
    this.displayedBoqList = [];
      const checkbox = event.target as HTMLInputElement;
      let originalBOQTable = document.getElementById('originalBOQTable') as HTMLTableElement;
      if(originalBOQTable)
      {
          for(let index = 1; index < originalBOQTable.rows.length; index ++)
          {
            let row = originalBOQTable.rows[index] as HTMLTableRowElement;
            let rowCheckbox = row.firstChild.firstChild as HTMLInputElement;
            let rowNumberCell = row.childNodes[1] as HTMLTableCellElement;
            let rowNumber = Number(rowNumberCell.innerHTML);
           
            if(rowCheckbox)
            {
                rowCheckbox.checked = checkbox.checked;
                let currentBoqRow = this.OriginalBoqList[index - 1];
                if(checkbox.checked)
                {
                  this.SelectedOriginalBoqList.push({ rowNumber: currentBoqRow.rowNumber, scope: this.SelectedPackage });               
                }
            }
          }

          if(checkbox.checked)
          {
              /* select All BOQ List*/
              this.assignPackageService.GetAllBoqList(this.SearchInput).subscribe((data) => {
                if (data) {
                  
                  let selectedBoqArr = this.SelectedBoqList;
                  let selectedPackage = this.SelectedPackage;
                  let boqArr : BoqModel[] = data;
                  
                  boqArr.forEach(function(element : BoqModel){
                    selectedBoqArr.push({ boqSeq: element.boqSeq, boqScope: selectedPackage, boqResSeq : element.boqResSeq, boqItem : element.boqItem });                
                  });
                  
                  this.editDisplayedBoqList(this.BoqList, false);
                  //console.log(boqArr.length);            
                }
              });
          }
      }
      //console.log(this.SelectedBoqList);
  }

  AssignPackages() {
    this.isAssigning = true;
    this.assignPackages.assignOriginalBoqList = this.SelectedOriginalBoqList;
    this.assignPackages.assignBoqList = this.SelectedBoqList;
    this.assignPackageService.AssignPackage(this.assignPackages).subscribe((data) => {
      if (data) {
        this.SelectedBoqList = [];
        this.SelectedOriginalBoqList = [];
        this.BoqList = [];
        this.displayedBoqList = [];
        this.isAssigning = false;
        this.toastr.success("Package assigned")
        this.uncheckAll();
        //this.SelectedPackage = 0;
        this.FinalUnitPrice = 0;
        this.FinalTotalPrice = 0;
        this.router.navigate(['/package-supplier', this.SelectedPackage]);
        //this.GetOriginalBoqList(this.SearchInput);
      }
    });
  }

  onSearch() {
    this.BoqList = [];
    this.GetOriginalBoqList(this.SearchInput);
   
  }

  onPackageSelected(newObj : any) {
   
    if (this.SelectedOriginalBoqList.length > 0) {
      this.SelectedOriginalBoqList.forEach(element => {
        element.scope = this.SelectedPackage;
      });
    }

    if (this.SelectedBoqList.length > 0) {
      this.SelectedBoqList.forEach(element => {
        element.boqScope = this.SelectedPackage;
      });
    }
  }

  onPackageMatSelected(event: any)
  {
    let id = event.value;
    if (this.SelectedOriginalBoqList.length > 0) {
      this.SelectedOriginalBoqList.forEach(element => {
        element.scope = id;
      });
    }

    if (this.SelectedBoqList.length > 0) {
      this.SelectedBoqList.forEach(element => {
        element.boqScope = id;
      });
    }
  }

  uncheckAll() {
    this.checkboxes.forEach((element) => {
      element.nativeElement.checked = false;
    });
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  filterPackages(event: KeyboardEvent) { 
    const txt = event.target as HTMLInputElement;
    
    let result: PackageList[] = [];
    for(let a of this.PackageList){
      if(a.pkgeName.toLowerCase().indexOf(txt.value.toLowerCase()) > -1){
        result.push(a)
      }
    }
    this.selectedPackages = result;
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
  
  filterBOQLevel(event: KeyboardEvent)
  {
    const txt = event.target as HTMLInputElement;
    
    let result: BOQLevelList[] = [];
    for(let a of this.BOQLevelList){
      if(a.level.toLowerCase().indexOf(txt.value.toLowerCase()) > -1){
        result.push(a)
      }
    }
    this.selectedBOQLevel2List = result;
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

 
  ExportExcelBoq(){
  //this.spinner.show();
  //this.isValidatingExcel = true;
    
  //let flexSwitchCheckDefault = document.getElementById("flexSwitchCheckDefault") as HTMLInputElement;
  //if(flexSwitchCheckDefault)
  //{
  //  if(flexSwitchCheckDefault.type == 'checkbox' && flexSwitchCheckDefault.checked)
  //   {
  //       localStorage.setItem('assignByBoqOnly', '1');
  //    }      
  //  }
  this.assignPackages.assignOriginalBoqList = this.SelectedOriginalBoqList;
  this.assignPackages.assignBoqList = this.SelectedBoqList;
  //this.assignPackageService.AssignPackage(this.assignPackages).subscribe((data) => {

    this.assignPackageService.ExportBoqExcel(this.assignPackages).subscribe((data) => {
      if (data) {
        let a = document.createElement('a');
        a.id = 'downloader';
        a.target = '_blank'; 
        a.style.visibility = "hidden";
        document.body.appendChild(a);
        a.href = environment.baseApiUrl +'api/SupplierPackages/DownloadFile?filename=' + data;
        a.click();     
      }
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

  
    //convenience getter for easy access to form fields
    get f() { return this.formEdit.controls; }


  editOriginalBoqQty(content : any, item : OriginalBoqModel)
  {
    this.mode = 'edit';
    this.SelectedOriginalBoqRow = item;
    this.EditBoqQtyModalLabel = 'Edit Original Boq Qty';

    this.formEdit = this.formBuilder.group({
      // boq: [item.itemO, Validators.required],
      QtyScope: [item.scopeQtyO, [Validators.required]]     
    });
    this.currentOrigBoq = item;
    this.modalReference = this.modalService.open(content, this.modalOptions);
    this.modalReference.result.then((result : any) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason : any) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  


  onEditSubmit()
  {
    this.submitted = true;
      // stop here if form is invalid
    if (this.formEdit.invalid) { return;}

    this.updating = true;
    this.currentOrigBoq.scopeQtyO = this.f.scopeQtyO.value;

    this.assignPackageService.updateOriginalBoqQty(this.currentOrigBoq).subscribe(response=>{
      this.updating = false;
        if(response)
        {
          this.toastr.success('Updated successfuly');
          this.onSearch();
          this.modalReference.close();
        }
        else
        {
          this.toastr.error('An error occured');
        }
    });
  }

  
}
