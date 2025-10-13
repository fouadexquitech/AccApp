import { Component, ElementRef, OnInit, OnDestroy, QueryList, ViewChildren, ViewChild, AfterViewInit, ɵpatchComponentDefWithScope } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { AssignBoqList, AssignOriginalBoqList, AssignPackages, BOQDivList,BOQLevelList, BoqModel, OriginalBoqModel, PackageList, RESDivList, RESPackageList, RessourceList, RESTypeList, SearchInput, SheetDescList,AddNewBoqRessourceModel } from './assign-package.model';
import { AssignPackageService } from './assign-package.service';
import { DataTableDirective} from 'angular-datatables';
import {environment} from '../../environments/environment';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs/operators';
// AH28032023
import { LoginService } from '../login/login.service';
import { User } from '../_models';
import { PackageSupplierService } from '../package-supplier/package-supplier.service';
import { BoqListTableComponent } from '../boq-list-table/boq-list-table.component';
import { AssignPackageFilterComponent } from '../assign-package-filter/assign-package-filter.component';

// AH28032023.
declare var $: any;

@Component({
  
  selector: 'app-assign-package',
  templateUrl: './assign-package.component.html',
  styleUrls: ['./assign-package.component.css'],
})

export class AssignPackageComponent implements OnDestroy, OnInit, AfterViewInit {
  @ViewChild('assignPackageFilter') assignPackageFilter : AssignPackageFilterComponent;
  @ViewChild('editRessourcesModal') editRessourcesModal : any;
  @ViewChild('editUnitPriceResModal') editUnitPriceResModal : any;
  @ViewChild('boqListTable') boqListTable : BoqListTableComponent;
  isShown: boolean = false; // hidden by default
  isAssignShown: boolean = false; // hidden by default
  isExportShown: boolean = false; // hidden by default
  BOQDivList: BOQDivList[] = [];
  public selectedBOQDivList : BOQDivList[] = [];
  BOQLevelList: BOQLevelList[] = [];
  public selectedBOQLevel2List : BOQLevelList[] = [];
  public selectedBOQLevel3List : BOQLevelList[] = [];
  public selectedBOQLevel4List : BOQLevelList[] = [];
  RESDivList: RESDivList[] = [];
  selectedRESDivList : RESDivList[] = [];
  RESTypeList: RESTypeList[] = [];
  selectedRESTypeList : RESTypeList[] = [];

  PackageList: PackageList[] = [];
  selectedPackages: PackageList[];
  selectedFilterPackages : PackageList[];

  ressourceList: RessourceList[] = [];
  selectedRessources: RessourceList[];
  selectedFilterRessources : RessourceList[];

  RESPackageList: RESPackageList[] = [];
  selectedFilterResPackages : RESPackageList[] = [];
  SheetDescList: SheetDescList[] = [];
  selectedSheetDescList : SheetDescList[] = [];
  OriginalBoqList: OriginalBoqModel[] = [];
  BoqList: BoqModel[] = [];
  displayedResList : BoqModel[] = [];
  SelectedOriginalBoqList: AssignOriginalBoqList[] = [];
  SelectedBoqList: AssignBoqList[] = [];
  CurrentRowIndex: number = 0;
  SelectedBoqQty: number = 0;
  SearchInput = new SearchInput();
  assignPackages = new AssignPackages();
  SelectedPackage: number = 0;
  SelectedOriginalBoqRow = new OriginalBoqModel();
  FinalUnitPrice: number = 0;
  FinalTotalPrice : number = 0;
  SelectedBoqRow = new BoqModel();
  public dtOptions: DataTables.Settings = {};
  public dtOptions2 : DataTables.Settings = {};
  // public dtTrigger: Subject<any> = new Subject<any>();
  public select2Options : Select2.Options = {};
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  public isAssigning : boolean = false;
  public isSearching : boolean = false;
  @ViewChildren("checkboxes") checkboxes!: QueryList<ElementRef>;
  checkboxesAll : boolean = false;
  mode : string = 'add';
  EditBoqQtyModalLabel : string = '';
  formEdit: FormGroup;
  formEditUnitPriceRes: FormGroup;
  form: FormGroup;
  formTrade:FormGroup;
  submitted : boolean = false;
  updating : boolean = false;
  currentOrigBoq : OriginalBoqModel;
  currentBoqRes : BoqModel;
  modalReference : any;
  modalOptions:NgbModalOptions;
  closeResult: string;
  isValidatingExcel : boolean = false;
  PackageName = "";
  FilePath = "";
  assignByBoqOnly : string="1";
  public user : User;
  loading : boolean = false;
  // AH28032023
  @ViewChild('inputText') textInput: any; 
  @ViewChild('inputText1') textInput1: any; 
  isExportExcel:boolean=false;
  isExportExcelDry:boolean=false;
  isExportExcelDryBoq:boolean=false;
  isExportExcelNotAssigned:boolean=false;
  isExportExcelVerif:boolean=false;
  // addResType:string="";
// AH28032023
  public boqPackagesData: Object[] = [
    { id: 0, desc: 'All Items' },
    { id: 1, desc: 'With Assigned Packages' },
    { id: 5, desc: 'Without Assigned Packages' }
];

  public dtTrigger: Subject<any> = new Subject<any>();

  boqsList : any[] = [];
  selectedBoqsV2 : any[] = [];
  selectedBoqsResV2 : any[] = [];
  boqSeqs : any[] = [];

  resourcesSelected : boolean = false;

  boqFinalTotal : number = 0;

  constructor(private assignPackageService: AssignPackageService, 
    private modalService: NgbModal,private spinner: NgxSpinnerService , 
    private toastr: ToastrService,
    private router : Router,
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private packageSupplierService: PackageSupplierService, 
    )
     {this.loginService.user.subscribe(x => this.user = x); }

     openFilterDrawer(){
        this.assignPackageFilter.openDrawer();
     }


    
// AH28032023
   clearAllSearch()
     {
      this.assignPackageFilter.clearFilter();
      //  this.textInput.nativeElement.value = '';
      //  this.textInput1.nativeElement.value = '';
       this.SearchInput.itemO = null;
       this.SearchInput.bOQDesc = null;
       this.SearchInput.bOQItem = null;
       this.SearchInput.fromRow='';
       this.SearchInput.toRow='';
       this.SearchInput.obTradeDesc='';
       this.SearchInput.rESDesc='';
       this.SearchInput.bOQDiv= [];
       this.SearchInput.boqLevel2= [];
       this.SearchInput.boqLevel3= [];
       this.SearchInput.boqLevel4= [];
       this.SearchInput.sheetDesc= '';
       this.SearchInput.isItemsAssigned= 0;
       this.SearchInput.package= 0;
       this.SearchInput.rESDiv= [];
       this.SearchInput.rESType= [];
       this.SearchInput.boqResourceSeq= [];
       this.SearchInput.rESPackage= '';
       this.SearchInput.isRessourcesAssigned= 0;

       this.clearTable();
       this.displayedResList = [];
       this.checkboxesAll = false;
       this.boqListTable?.setData(this.displayedResList);
       this.boqListTable?.setFinalTotalPrice(0);
     }

     clearFilter(event : boolean)
     {
        if(event)
        {
            this.clearAllSearch();
        }
     }

     clearTable(): void {
      this.dtElements.toArray()[0].dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.clear().draw(); // Add this  line to clear all rows..
        dtInstance.destroy();      
        // dtTrigger la reconstruye
        this.OriginalBoqList = [];
        this.boqFinalTotal = 0;
        this.dtTrigger.next();      
      });
    }

    clearSelRes(){
      this.SearchInput.boqResourceSeq= [];
    }
// AH28032023

  ngOnInit(): void 
{
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

    this.getBoqResourceRecords();
    this.formTrade = this.formBuilder.group({
      tradeDesc: ['', Validators.required]
  });

    this.select2Options = {
      multiple : true
    };

    // for EnablePaging 
    this.dtOptions = {
      pagingType: 'full_numbers',
      lengthMenu: [
        [10, 25, 50, 100, 300, 500],
        [10, 25, 50, 100, 300, 500],
      ],
      pageLength: 100,
      paging : true,
      searching : false,
      destroy : true,
      scrollY: "300px",
      scrollCollapse: true,
      columnDefs: [
        { targets: [0], orderable: false},
      ],
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        //console.log(row);
      }
    };

    // this.dtOptions = {
    //   //pagingType: 'full_numbers',
    //   //pageLength: 10,
    //   paging : false,
    //   info : false,
    //   searching : false,
    //   destroy : true,
    //   scrollY: "300px",
    //   scrollCollapse: true,
    //   rowCallback: (row: Node, data: any[] | Object, index: number) => {
    //     let checkbox = row.firstChild.firstChild as HTMLInputElement;
    //     let rowNumberCell = row.childNodes[1] as HTMLTableCellElement;
    //     let rowNumber = Number(rowNumberCell.innerHTML);
    //     if(checkbox)
    //     {
    //         if(checkbox.type == 'checkbox')
    //         { 
    //           checkbox.checked = false;
    //            this.SelectedOriginalBoqList.forEach(function (item) {
    //               if(item.rowNumber === rowNumber)
    //               {
    //                 checkbox.checked = true;
    //               }
    //             });
    //         }
    //     }
    //   }
    // };
    
    // this.ConnectToDB(this.user.usrLoggedConnString);
    let body : any = {
      level2 : this.SearchInput.boqLevel2,
      level3 : this.SearchInput.boqLevel3,
      level4 : this.SearchInput.boqLevel4,
      resType: this.SearchInput.rESType,
      boqDiv: this.SearchInput.bOQDiv
    };


    this.GetBOQDivList(body);
    // this.GetBOQLevel2List(body);
    // this.GetBOQLevel3List(body);
    // this.GetBOQLevel4List(body);
    // this.GetRESDivList();
    // this.GetRESTypeList(body);
    this.GetPackageList();
    // this.GetRESPackageList();
    // this.GetSheetDescList();
    // this.GetOriginalBoqList(this.SearchInput);
    // this.GetRessourcesList(body);
    // this.GetRessourcesListByLevels();
  }

  
  rerender(): void {
    this.dtElements.toArray()[0].dtInstance.then((dtInstance: DataTables.Api) => {
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

  // AH28032023
  ConnectToDB(connString: string) {
    this.assignPackageService.ConnectToDB(connString).subscribe((data) => {
    });
  }
// AH28032023.

  GetBOQDivList(body : any) {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

    this.assignPackageService.GetBOQDivList(body,CostConn).subscribe((data) => {
      if (data) {
        this.BOQDivList = data;
        this.selectedBOQDivList = data;
        //console.log(data)
      }
    });
  }

  GetBOQLevel2List(body : any) {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    this.assignPackageService.GetBOQLevel2List(body,CostConn).subscribe((data) => {
      if (data) {
        this.BOQLevelList = data;
        this.selectedBOQLevel2List = data;
        //console.log(data)
      }
    });
  }

  GetBOQLevel3List(body : any) {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    this.assignPackageService.GetBOQLevel3List(body,CostConn).subscribe((data) => {
      if (data) {
        this.BOQLevelList = data;
        this.selectedBOQLevel3List = data;
        //console.log(data)
      }
    });
  }

  GetBOQLevel4List(body : any) {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    this.assignPackageService.GetBOQLevel4List(body,CostConn).subscribe((data) => {
      if (data) {
        this.BOQLevelList = data;
        this.selectedBOQLevel4List = data;
        //console.log(data)
      }
    });
  }

  GetRESDivList() {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    this.assignPackageService.GetRESDivList(CostConn).subscribe((data) => {
      if (data) {
        this.RESDivList = data;
        this.selectedRESDivList = data;
      }
    });
  }

  GetRESTypeList(body : any) {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    this.assignPackageService.GetRESTypeList(body,CostConn).subscribe((data) => {
      if (data) {
        this.RESTypeList = data;
        this.selectedRESTypeList = data;
      }
    });
  }

  GetPackageList() {
//Get all packages
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    this.assignPackageService.GetPackageList(false,CostConn).subscribe((data) => {
      if (data) {
        this.PackageList = data;
        this.selectedPackages = this.PackageList;
      }
    });

//get only used packages
    // this.assignPackageService.GetPackageList(true).subscribe((data) => {
    //   if (data) {
    //     this.selectedFilterPackages = data;
    //   }
    // });
  }

  GetRessourcesList(body : any) {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    this.assignPackageService.GetRessourcesList(body,CostConn).subscribe((data) => {
      if (data) {
        this.ressourceList = data;
        this.selectedRessources = this.ressourceList;
        this.selectedFilterRessources = data;
      }
    });
  }

  L2_AfterUpdate(){
    let body : any = {
      level2 : this.SearchInput.boqLevel2,
      level3 : this.SearchInput.boqLevel3,
      level4 : this.SearchInput.boqLevel4,
      resType: this.SearchInput.rESType
    };

    this.GetBOQLevel3List(body);
    this.GetBOQLevel4List(body);
    this.GetRESTypeList(body);
    this.GetRessourcesList(body) ;
  }

  L3_AfterUpdate()
  {
    let body : any = {
      level2 : this.SearchInput.boqLevel2,
      level3 : this.SearchInput.boqLevel3,
      level4 : this.SearchInput.boqLevel4,
      resType: this.SearchInput.rESType
    };

    this.GetBOQLevel2List(body);
    this.GetBOQLevel4List(body);
    this.GetRESTypeList(body);
    this.GetRessourcesList(body) ;
  }

  L4_AfterUpdate()
  {
    let body : any = {
      level2 : this.SearchInput.boqLevel2,
      level3 : this.SearchInput.boqLevel3,
      level4 : this.SearchInput.boqLevel4,
      resType: this.SearchInput.rESType
    };

    this.GetBOQLevel2List(body);
    this.GetBOQLevel3List(body);
    this.GetRESTypeList(body);
    this.GetRessourcesList(body) ;
  }

  ResType_AfterUpdate(){
    let body : any = {
      level2 : this.SearchInput.boqLevel2,
      level3 : this.SearchInput.boqLevel3,
      level4 : this.SearchInput.boqLevel4,
      resType: this.SearchInput.rESType
    };

    this.GetBOQLevel2List(body);
    this.GetBOQLevel3List(body);
    this.GetBOQLevel4List(body);
    this.GetRessourcesList(body) ;
  }

  Ressources_AfterUpdate(){
    let body : any = {
      level2 : this.SearchInput.boqLevel2,
      level3 : this.SearchInput.boqLevel3,
      level4 : this.SearchInput.boqLevel4,
      resType: this.SearchInput.rESType
    };

    this.GetBOQLevel2List(body);
    this.GetBOQLevel3List(body);
    this.GetBOQLevel4List(body);
    this.GetRESTypeList(body);
  }

  GetRESPackageList() {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    this.assignPackageService.GetRESPackageList(CostConn).subscribe((data) => {
      if (data) {
        this.RESPackageList = data;
        this.selectedFilterResPackages = data;
      }
    });
  }

  GetSheetDescList() {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    this.assignPackageService.GetSheetDescList(CostConn).subscribe((data) => {
      if (data) {
        this.SheetDescList = data;
        this.selectedSheetDescList = data;
      }
    });
  }

  GetOriginalBoqList(input: SearchInput) {
    //AH31122024  clear BOQ Ressources table
    this.boqListTable?.setData([]);
    this.boqListTable?.setFinalTotalPrice(0);
    //AH31122024

    //AH082025
    this.SelectedOriginalBoqList= [];
    ///AH082025

    this.OriginalBoqList = [];
    this.displayedResList = [];
    this.boqFinalTotal = 0;
    //this.spinner.show();
    this.loading = true;
    this.isSearching = true;
    
    let costDB=this.user.usrLoggedCostDB;
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

    this.assignPackageService.GetOriginalBoqList(input,costDB,CostConn)
    .pipe(finalize(()=>{
      this.isSearching = false;
    }))
    .subscribe((data) => {
      this.toggleShow();
      this.loading = false;
      if (data) {
        this.OriginalBoqList = data;
        
        this.OriginalBoqList.forEach(item=>{
          let _item = this.SelectedOriginalBoqList.find(x=>x.rowNumber === item.rowNumber);
          this.boqFinalTotal += item.unitRateO * item.qtyO;
          // if(_item)
          // {
          //   item.isSelected = true;
          // }
        });
        //this.spinner.hide();
        // this.dtTrigger.next();
        this.rerender();

        this.checkboxesAll = this.SelectedOriginalBoqList.length == this.OriginalBoqList.length;
      }
    });
  }

  GetBoqList(itemO: string, input: SearchInput) {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

    this.assignPackageService.GetBoqList(itemO, input,CostConn).subscribe((data) => {
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
        //this.reloadBoqResources();
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
        //console.log(boqTable.rows.length);
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
      this.SelectedOriginalBoqList.push({ rowNumber: this.SelectedOriginalBoqRow.rowNumber, scope: this.SelectedPackage,tradeDesc: null,itemO:this.SelectedOriginalBoqRow.itemO });
    } else {
      const newIndex = this.SelectedOriginalBoqList.findIndex(x => x.rowNumber === this.SelectedOriginalBoqRow.rowNumber);
      if (newIndex > -1) {
        this.SelectedOriginalBoqList.splice(newIndex, 1);
      }
    }
  }

  OnBoqChecked(evt: any, index: number) {
    this.checkboxesAll = false;
    this.SelectedBoqRow = this.displayedResList[index];
    
    if (!evt.target.checked)
    {
      this.FinalTotalPrice -= this.SelectedBoqRow.boqUprice * this.SelectedBoqRow.boqScopeQty;
      this.FinalUnitPrice -= this.SelectedBoqRow.totalUnitPrice;
      this.SelectedBoqList = this.SelectedBoqList.filter(x=>x.boqSeq != this.SelectedBoqRow.boqSeq);

      // this.displayedResList.splice(index, 1);
      this.checkOriginalBoq();
    }
  }

  openQtyEditModal(event : any)
  {
    this.mode = 'edit';
    this.SelectedBoqRow = event.boqItem;

    if(this.SelectedBoqRow.boqInsertedFromVendan==1)
      this.EditBoqQtyModalLabel = 'Edit Unit Price';
    else
      this.EditBoqQtyModalLabel = 'Edit Boq Qty';

    this.formEdit = this.formBuilder.group({
      // boq: [item.itemO, Validators.required],
      QtyScope: [event.boqItem.boqScopeQty, [Validators.required]] ,
      billQtyO :     [event.boqItem.boqBillQty] 
    });
    this.currentBoqRes = event.boqItem;
    this.modalReference = this.modalService.open(this.editRessourcesModal, this.modalOptions);
    this.modalReference.result.then((result : any) => {
      if(!result)
      {
      }
      this.closeResult = `Closed with: ${result}`;
    }, (reason : any) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  openUnitPriceEditModal(event : any)
  {
    console.log(100);
    this.mode = 'edit';
    this.SelectedBoqRow = event.boqItem;
    this.EditBoqQtyModalLabel = 'Edit Boq Unit Price';
 
    this.formEditUnitPriceRes = this.formBuilder.group({
      resUnitPrice: [event.boqItem.boqUprice, [Validators.required]] ,
    });
    this.currentBoqRes = event.boqItem;
    this.modalReference = this.modalService.open(this.editUnitPriceResModal, this.modalOptions);
    this.modalReference.result.then((result : any) => {
      if(!result)
      {
      }
      this.closeResult = `Closed with: ${result}`;
    }, (reason : any) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  onSelectBoqOnTable(event : any)
  {
    this.SelectedBoqRow = event.boqItem;
    
    if (!this.SelectedBoqRow.isSelected)
    {
      this.FinalTotalPrice -= this.SelectedBoqRow.boqUprice * this.SelectedBoqRow.boqScopeQty;
      this.FinalUnitPrice -= this.SelectedBoqRow.totalUnitPrice;
      let index = this.SelectedBoqList.findIndex(x=>x.boqSeq === this.SelectedBoqRow.boqSeq);
      this.SelectedBoqList.splice(index,1);
    }
    else
    {
      this.FinalTotalPrice += this.SelectedBoqRow.boqUprice * this.SelectedBoqRow.boqScopeQty;
      this.FinalUnitPrice += this.SelectedBoqRow.totalUnitPrice;
      this.SelectedBoqList.push(this.SelectedBoqRow);
    }
    //this.checkOriginalBoq();

    console.log(this.SelectedBoqList);
  }

  onSelectAllBoqOnTable(event : any)
  {
    this.SelectedBoqList = event.boqItems;
    console.log(this.SelectedBoqList)
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

selectRow(event: any, i: any) {
//AH23122024
if (event.target.nodeName != 'TD')
return;
///AH23122024

    let currentPageIndex = +document.getElementsByClassName('paginate_button current')[0].innerHTML - 1;
    let currentPageSizeSelect = document.getElementsByName('originalBOQTable_length')[0] as HTMLSelectElement;
    let currentPageSize = +currentPageSizeSelect.value;
    let index = i - (currentPageIndex * currentPageSize);

    this.CurrentRowIndex = index;
    this.SelectedBoqQty = this.OriginalBoqList[i]["qtyO"];
    let rowNumber = this.OriginalBoqList[i]["rowNumber"];
    
    let itemO = this.OriginalBoqList[i]["itemO"];
    let originalBOQTable = document.getElementById('originalBOQTable') as HTMLTableElement;

    console.log("PageIndex:"+currentPageIndex,"PageSize:"+currentPageSize,"idx:"+index,"i:"+i,"rowNo:"+rowNumber,"itemO:"+ itemO);
    // console.log(this.OriginalBoqList);

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
              this.OriginalBoqList[i].isSelected = checkbox.checked;
              this.SelectedOriginalBoqRow = this.OriginalBoqList[index];
              //this.reloadBoqResources();
              if(checkbox.checked)
              {
                this.selectedBoqsV2.push(itemO);
                this.selectedBoqsResV2.push(itemO);
                
                this.SelectedOriginalBoqList.push({ rowNumber: this.SelectedOriginalBoqRow.rowNumber, scope: this.SelectedPackage,tradeDesc: null ,itemO:this.SelectedOriginalBoqRow.itemO});
                //AH042025
                // this.GetBoqList(this.OriginalBoqList[index]["itemO"], this.SearchInput);
                this.GetBoqList(itemO, this.SearchInput);
                ///AH042025
              }
               else 
              {
                const iiindex = this.selectedBoqsV2.findIndex(x=>x == itemO);
                const iiResIndex = this.selectedBoqsResV2.findIndex(x=>x == itemO);
                const newIndex = this.SelectedOriginalBoqList.findIndex(x => x.rowNumber === this.SelectedOriginalBoqRow.rowNumber);
                
                if (newIndex > -1) {
                  this.SelectedOriginalBoqList.splice(newIndex, 1);
                  this.selectedBoqsV2.splice(iiindex, 1);
                  this.selectedBoqsResV2.splice(iiResIndex, 1);
                  //uncheck all children
                  let selectedBoqArr = this.SelectedBoqList;
                  
                  let CostConn=this.user.usrLoggedConnString;
                  this.loginService.CheckConnection(CostConn).subscribe((data) => { });

                  this.assignPackageService.GetBoqList(itemO, this.SearchInput,CostConn).subscribe((data) => {
                    if (data) {
                      this.BoqList = data;
                      let selectedBoqArr = this.SelectedBoqList;                     
                      this.BoqList.forEach(function(el : any){
                   
                        el.isSelected = false;
                        const subIndex = selectedBoqArr.findIndex(x => x.boqSeq === el.boqSeq);
                        
                        selectedBoqArr.splice(subIndex, 1);
                    });

                    
                    this.editDisplayedBoqList(this.BoqList, false);
                    //this.reloadBoqResources();
                    }
                  });                 
                }
              }           
          }
      }
    }
    if(this.SelectedOriginalBoqList.length != this.OriginalBoqList.length || this.SelectedOriginalBoqList.length == 0)
    {
        this.checkboxesAll = false;
    }
    else
    {
      this.checkboxesAll = true;
    }
    //console.log(this.SelectedBoqList);
    
  }

  reloadBoqResources() {
    this.dtElements.toArray()[1].dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload(undefined, false);
    });
  }

  getBoqResourceRecords()
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

    const that = this;
    
    this.dtOptions2 = {
      pagingType: 'full_numbers',
      responsive : true,
      order : [[ 0, 'asc' ]],
      lengthMenu: [
        [10, 25, 50, 100],
        [10, 25, 50, 100]
      ],
      ordering : false,
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching : false,
      ajax: (dataTablesParameters: any, callback) => {
        
        dataTablesParameters.boqIds = this.selectedBoqsV2.join();
        dataTablesParameters.selectedBoqIds = this.selectedBoqsResV2.join();

        this.assignPackageService.getBoqResourceRecords(dataTablesParameters,CostConn).subscribe(resp => {
            that.boqsList = resp.data;
            this.resourcesSelected = that.boqsList.length > 0;
            // Calling the DT trigger to manually render the table
            this.FinalTotalPrice = resp.finalTotalPrice;
            this.FinalUnitPrice = resp.finalUnitPrice;
            this.boqSeqs = resp.boqSeqs;
            
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: []
            });
          });
      },
      // columns: [
      //   { data : null},
      //   { title : 'BOQ', data: 'boqItem', name : 'boqItem'},
      //   { title : 'Type', data: 'boqCtg', name : 'boqCtg'},
      //   { title : 'Resource Description', data: 'resDescription', name : 'resDescription'},
      //   { title : 'Unit', data: 'boqUnitMesure', name : 'boqUnitMesure'},
      //   { title : 'boqBillQty', data: 'boqBillQty', name : 'boqBillQty'},
      //   { title : 'boqQty', data: 'boqQty', name : 'boqQty'},
      //   { title : 'boqScopeQty', data: 'boqScopeQty', name : 'boqScopeQty'},
      // ]
    };
  }

  boqResChange(item : any, event : any)
  {
     let checked = event.target.checked;

     if(checked)
     {
          this.selectedBoqsResV2.push(item.itemO);
     }
     else
     {
       let index = this.selectedBoqsResV2.indexOf(item.itemO);
    
       this.selectedBoqsResV2.splice(index, 1);
     }
     //this.reloadBoqResources();
  }

  editDisplayedBoqList(BoqList : BoqModel[], add : boolean)
  {
      BoqList.forEach(boq=>{
        let boqItem = this.OriginalBoqList.find(x=>x.itemO == boq.boqItem);
        boq.totalUnitPrice = boqItem?.unitRateO;
        let item = this.displayedResList.find(a=>a.boqSeq == boq.boqSeq);
        
        if(add)
        {
          this.FinalTotalPrice += (boq.boqScopeQty * boq.boqUprice);
          this.FinalUnitPrice += (boq.totalUnitPrice);
          //AH14092023
          // if(item)
          // {
          //   item.boqQty += boq.boqQty;   
          //   item.boqBillQty+=boq.boqBillQty;
          //   item.boqScopeQty+=boq.boqScopeQty;
          //   item.totalUnitPrice += boq.totalUnitPrice;
          // }
          // else
          // {
          //AH14092023
            boq.isSelected = true;
            this.displayedResList.push(boq);
          //AH14092023
          // }  
           //AH14092023     
        }
        else
        {
            this.FinalTotalPrice -= (boq.boqScopeQty * boq.boqUprice);
            this.FinalUnitPrice -= (boq.totalUnitPrice);
             //AH14092023
            // if(item)
            // {   
                // if((item.boqQty - boq.boqQty) > 0)
                // {
                //   item.boqQty -= boq.boqQty;
                //   item.boqBillQty-=boq.boqBillQty;
                //   item.boqScopeQty-=boq.boqScopeQty;
                //   item.totalUnitPrice -= boq.totalUnitPrice;
                // }
                // else
                // {
                 //AH14092023  
                  this.displayedResList.splice(this.displayedResList.indexOf(item), 1)
                //AH14092023  
                // }              
            // }
             //AH14092023
        }
    });

    this.boqListTable?.setData(this.displayedResList);
    this.boqListTable?.setFinalTotalPrice(this.FinalTotalPrice);
  }

  clearAllSelections()
  {
    this.checkboxesAll = false;
    this.SelectedOriginalBoqList = [];
    this.SelectedBoqList = [];
    this.BoqList = [];
    this.displayedResList = [];
    this.selectedBoqsV2 = [];
    this.selectedBoqsResV2 = [];
    //this.reloadBoqResources();
    this.editDisplayedBoqList([], false);
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
  

  checkAllOriginalBoq2(event : any) {
    let that = this;
    this.selectedBoqsV2 = [];
    this.selectedBoqsResV2 = [];
    this.SelectedOriginalBoqList = [];
    this.SelectedBoqList = [];
    this.BoqList = [];
    this.displayedResList = [];
    const checkbox = event.target as HTMLInputElement;

    this.OriginalBoqList.forEach(el=>{
        el.isSelected = checkbox.checked;
   
        if(checkbox.checked)
        {
          this.SelectedOriginalBoqList.push({ rowNumber: el.rowNumber, scope: this.SelectedPackage, tradeDesc: null ,itemO:el.itemO });
        }
    });

    this.displayedResList = [];
    this.FinalTotalPrice = 0;
    this.FinalUnitPrice = 0;
    
    if(checkbox.checked)
    {
        /*select All BOQ List*/
        let CostConn=this.user.usrLoggedConnString;
        this.loginService.CheckConnection(CostConn).subscribe((data) => { });

        this.assignPackageService.GetAllBoqList(this.SearchInput,CostConn).subscribe((data) => {
          if (data) {
            
            let selectedBoqArr = this.SelectedBoqList;
            let selectedPackage = this.SelectedPackage;
            let boqArr : BoqModel[] = data;
            
            boqArr.forEach(function(element : BoqModel){
              selectedBoqArr.push({ boqSeq: element.boqSeq, boqScope: selectedPackage, boqResSeq : element.boqResSeq, boqItem : element.boqItem });  
              that.selectedBoqsV2.push(element.boqItem);
              that.selectedBoqsResV2.push(element.boqItem);           
            });
            
            //fouadddddddddddddddddddddddddddd
            //this.getBoqResourceRecords();          
            //this.boqListTable?.setData(boqArr);
            this.editDisplayedBoqList(boqArr, true);
            
            //this.reloadBoqResources();
            //console.log(boqArr.length);            
          }
        });
    }
    else
    {
      this.boqListTable?.setData([]);
      this.boqListTable?.setFinalTotalPrice(0);
      //this.reloadBoqResources();
    }
  }

  // checkAllOriginalBoq(event : any) {
  //   this.SelectedOriginalBoqList = [];
  //   this.SelectedBoqList = [];
  //   this.BoqList = [];
  //   this.displayedResList = [];
  //   const checkbox = event.target as HTMLInputElement;
  //   let originalBOQTable = document.getElementById('originalBOQTable') as HTMLTableElement;

  //     if(originalBOQTable)
  //     {
  //         for(let index = 1; index < originalBOQTable.rows.length; index ++)
  //         {
  //           let row = originalBOQTable.rows[index] as HTMLTableRowElement;
  //           let rowCheckbox = row.firstChild.firstChild as HTMLInputElement;
  //           let rowNumberCell = row.childNodes[1] as HTMLTableCellElement;
  //           let rowNumber = Number(rowNumberCell.innerHTML);
           
  //           if(rowCheckbox)
  //           {
  //               rowCheckbox.checked = checkbox.checked;
  //               let currentBoqRow = this.OriginalBoqList[index - 1];
  //               if(checkbox.checked)
  //               {
  //                 this.SelectedOriginalBoqList.push({ rowNumber: currentBoqRow.rowNumber, scope: this.SelectedPackage, tradeDesc: null });               
  //               }
  //           }
  //         }
  //         this.displayedResList = [];
  //         this.FinalTotalPrice = 0;
  //         this.FinalUnitPrice = 0;
  //         if(checkbox.checked)
  //         {
  //             /* select All BOQ List*/
  //             this.assignPackageService.GetAllBoqList(this.SearchInput).subscribe((data) => {
  //               if (data) {
                  
  //                 let selectedBoqArr = this.SelectedBoqList;
  //                 let selectedPackage = this.SelectedPackage;
  //                 let boqArr : BoqModel[] = data;
                  
  //                 boqArr.forEach(function(element : BoqModel){
  //                   selectedBoqArr.push({ boqSeq: element.boqSeq, boqScope: selectedPackage, boqResSeq : element.boqResSeq, boqItem : element.boqItem });                
  //                 });
                  
  //                 this.editDisplayedBoqList(boqArr, true);
  //                 //console.log(boqArr.length);            
  //               }
  //             });
  //         }
  //     }
  //     console.log(this.SelectedOriginalBoqList);
  // }

AssignPackages() {
    this.isAssigning = true;
///AH06022025  
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
  ///AH06022025  
    this.assignPackages.assignOriginalBoqList = this.SelectedOriginalBoqList;
    this.assignPackages.assignBoqList = this.SelectedBoqList;
    
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

    this.assignPackageService.AssignPackage(this.assignPackages,CostConn).pipe(finalize(()=>{
      this.isAssigning = false;
    }))
    .subscribe((data) => {
      if (data) {
        this.SelectedBoqList = [];
        this.SelectedOriginalBoqList = [];
        this.BoqList = [];
        this.clearTable();
        this.displayedResList = [];
        this.isAssigning = false;
        this.toastr.success("Package assigned")
        this.uncheckAll();
        //this.SelectedPackage = 0;
//AH13092023        
        // this.FinalUnitPrice = 0;
        // this.FinalTotalPrice = 0;
        // this.router.navigate(['/package-supplier', this.SelectedPackage]);
//AH13092023
        this.GetOriginalBoqList(this.SearchInput);
        this.selectedBoqsV2 = [];
        this.selectedBoqsResV2 = [];
        this.boqsList = [];
        this.boqSeqs = [];
        this.resourcesSelected = false;
        this.boqListTable.setData([]);
      }
    });
  }

//AH03042023
TestSendMail(){
  this.packageSupplierService.TestSendMail().subscribe((data) => {
  });
}

validateExcelBeforeAssign(){
    //this.spinner.show();
    this.isValidatingExcel = true;
    
    let flexSwitchCheckDefault = document.getElementById("flexSwitchCheckDefault") as HTMLInputElement;
    if(flexSwitchCheckDefault)
    {
      if(flexSwitchCheckDefault.type == 'checkbox' && flexSwitchCheckDefault.checked)
          localStorage.setItem('assignByBoqOnly', '1');
      else     
          localStorage.setItem('assignByBoqOnly', '0');
    }
    
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

    this.packageSupplierService.validateExcelBeforeAssign(this.SelectedPackage, Number(localStorage.getItem('assignByBoqOnly')),CostConn).subscribe((data) => {
      this.isValidatingExcel = false;
      if (data) {
        // this.spinner.hide();
        this.toastr.success("Validated !!")
        this.GetPackageById(Number(this.SelectedPackage));

        let a = document.createElement('a');
        a.id = 'downloader';
        a.target = '_blank'; 
        a.style.visibility = "hidden";
        document.body.appendChild(a);
        a.href = environment.baseApiUrl +'api/SupplierPackages/DownloadFile?filename=' + data;
        a.click();
        // this.router.navigate(['/package-supplier', this.SelectedPackage]);
      }
    });
  }

  GetPackageById(IdPkge: number) {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

    this.packageSupplierService.GetPackageById(IdPkge).subscribe((data) => {
      if (data) {
        this.PackageName = data.packageName;
        this.FilePath = data.filePath;
     
      }
    });
  }

  flexSwitchCheckDefaultChange(event : any)
  {
      let checkbox = event.target as HTMLInputElement;
      if(checkbox.type == 'checkbox')
      {
          let val = checkbox.checked? '1' : '0';
          localStorage.setItem('assignByBoqOnly', val)
      }
  }
//AH03042023.

  onSearch() {
    this.OriginalBoqList = [];
    this.clearTable();
    this.displayedResList = [];
    this.SelectedOriginalBoqList = [];
    this.BoqList = [];
    this.boqsList = [];
    this.resourcesSelected = false;
    this.checkboxesAll = false;

//AH05052025.
    this.SelectedBoqList = [];
    this.selectedBoqsV2 = [];
    this.selectedBoqsResV2 = [];
    this.editDisplayedBoqList([], false);
    this.FinalUnitPrice = 0;
    this.FinalTotalPrice = 0;
///AH05052025.

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
    console.log(txt.value.toLowerCase());

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

  filterSearchRessources(event: KeyboardEvent)
  {
    const txt = event.target as HTMLInputElement;
    
    let result: RessourceList[] = [];
    for(let a of this.ressourceList){
      if(a.resDesc.toLowerCase().indexOf(txt.value.toLowerCase()) > -1){
        result.push(a)
      }
    }
    this.selectedFilterRessources = result;
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

  filterBOQLevel3(event: KeyboardEvent)
  {
    const txt = event.target as HTMLInputElement;

    let result: BOQLevelList[] = [];
    for(let a of this.BOQLevelList){
      if(a.level.toLowerCase().indexOf(txt.value.toLowerCase()) > -1){
        result.push(a)
      }
    }
    this.selectedBOQLevel3List = result;
  }

  filterBOQLevel4(event: KeyboardEvent)
  {
    const txt = event.target as HTMLInputElement;
    
    let result: BOQLevelList[] = [];
    for(let a of this.BOQLevelList){
      if(a.level.toLowerCase().indexOf(txt.value.toLowerCase()) > -1){
        result.push(a)
      }
    }
    this.selectedBOQLevel4List = result;
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
  let costDB=this.user.usrLoggedCostDB;
  this.assignPackages.assignOriginalBoqList = this.SelectedOriginalBoqList;
  this.assignPackages.assignBoqList = this.SelectedBoqList;
  this.isExportExcel=true;
  //this.assignPackageService.AssignPackage(this.assignPackages).subscribe((data) => {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

    this.assignPackageService.ExportBoqExcel(this.SearchInput,costDB,CostConn).subscribe((data) => {
      this.isExportExcel=false;
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

  ExportExcelVerification(){
    this.isExportExcelVerif=true;
    let costDB=this.user.usrLoggedCostDB;
    let userName=this.user.usrId;
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
  
    this.assignPackageService.ExportExcelVerification(this.SearchInput,costDB,userName,CostConn).subscribe((data) => {
    
      if (data) {
          this.isExportExcelVerif=false;
          let a = document.createElement('a');
          a.id = 'downloader';
          a.target = '_blank'; 
          a.style.visibility = "hidden";
          document.body.appendChild(a);
          a.href = environment.baseApiUrl +'api/SupplierPackages/DownloadFile?filename=' + data;
          a.click();     
        }
        this.isExportExcelVerif=false;
        console.log(this.isExportExcelVerif);
      });
    }

  ExportNotAssigned(){
    let costDB=this.user.usrLoggedCostDB;
    this.assignPackages.assignOriginalBoqList = this.SelectedOriginalBoqList;
    this.assignPackages.assignBoqList = this.SelectedBoqList;
    //this.assignPackageService.AssignPackage(this.assignPackages).subscribe((data) => {
    this.isExportExcelNotAssigned=true;

    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

      this.assignPackageService.ExportNotAssigned(costDB,CostConn).subscribe((data) => {
        this.isExportExcelNotAssigned=false;
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
  
    ExportExcelPackagesCost(withBoq:number){
      let costDB=this.user.usrLoggedCostDB;
      
      if (withBoq==1)
        this.isExportExcelDryBoq=true;
      else
        this.isExportExcelDry=true;
  
        let CostConn=this.user.usrLoggedConnString;
        this.loginService.CheckConnection(CostConn).subscribe((data) => { });

        this.assignPackageService.ExportExcelPackagesCost(withBoq,costDB,this.SearchInput,CostConn)
        .pipe(finalize(() =>{
          if (withBoq==1)
            this.isExportExcelDryBoq=false;
          else
            this.isExportExcelDry=false;
        }))
        .subscribe((data) => {
          
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
    get ff() { return this.formEditUnitPriceRes.controls; }

  editOriginalBoqQty(content : any, item : OriginalBoqModel)
  {
    this.mode = 'edit';
    this.SelectedOriginalBoqRow = item;
    this.EditBoqQtyModalLabel = 'Edit Original Boq Qty';

    this.formEdit = this.formBuilder.group({
      // boq: [item.itemO, Validators.required],
      QtyScope: [item.scopeQtyO, [Validators.required]] ,
      billQtyO :     [item.qtyO] 
    });
    this.currentOrigBoq = item;
    this.modalReference = this.modalService.open(content, this.modalOptions);
    this.modalReference.result.then((result : any) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason : any) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  
  editBoqResQty(content : any, item : BoqModel)
  {
    this.mode = 'edit';
    this.SelectedBoqRow = item;
    this.EditBoqQtyModalLabel = 'Edit Boq Qty';

    this.formEdit = this.formBuilder.group({
      // boq: [item.itemO, Validators.required],
      QtyScope: [item.boqScopeQty, [Validators.required]] ,
      billQtyO :     [item.boqBillQty] 
    });
    this.currentBoqRes = item;
    this.modalReference = this.modalService.open(content, this.modalOptions);
    this.modalReference.result.then((result : any) => {
      if(!result)
      {
          //this.reloadBoqResources();
      }
      this.closeResult = `Closed with: ${result}`;
    }, (reason : any) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  recalculateFinalTotals()
  {
    this.FinalTotalPrice = 0;
    
    this.displayedResList.forEach(el=>{
      
      if(el.isSelected)
      {
        
        this.FinalTotalPrice += el.boqUprice * el.boqScopeQty;
      }
    });
    this.boqListTable.setFinalTotalPrice(this.FinalTotalPrice);
  }

  AddResModalOpen() {
    const firstBoqDiv = this.BoqList[0].boqDiv;
    
    // Set dropdown value using native DOM
    const selectElement = document.getElementById("addResDiv") as HTMLSelectElement;
    if (selectElement) {
      selectElement.value = firstBoqDiv;
    }

    $("#addResModal").modal('show')
  }


  AddResModalClose() {
    $("#addResModal").modal('hide');
    var labelInput = document.getElementById("labelInput") as HTMLInputElement;
    var valueInput = document.getElementById("valueInput") as HTMLInputElement;
    var valueType = document.getElementById("valueType") as HTMLSelectElement;
    labelInput.value = null;
    valueInput.value = null;
    valueType.selectedIndex = 0;
  }

  AddRessource() {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    
    let newRes = new BoqModel();
    newRes.boqDiv = (document.getElementById("addResDiv") as HTMLInputElement).value;
    newRes.boqCtg = (document.getElementById("addResType") as HTMLInputElement).value;
    newRes.resDescription = (document.getElementById("addResDesc") as HTMLInputElement).value;
    newRes.boqQty = Number((document.getElementById("addResQty") as HTMLInputElement).value);
    newRes.boqBillQty = Number((document.getElementById("addResQty") as HTMLInputElement).value);
    newRes.boqScopeQty = Number((document.getElementById("addResQty") as HTMLInputElement).value);
    newRes.boqUnitMesure = (document.getElementById("addResUnit") as HTMLInputElement).value;
    newRes.boqUprice = Number((document.getElementById("addResUnitRate") as HTMLSelectElement).value);
    newRes.boqUpriceDisc =Number(( document.getElementById("addDiscountedResUnitRate") as HTMLSelectElement).value);
    
    let userName=this.user.usrId;
    console.log(userName);
    console.log(newRes);
    if (newRes.resDescription !="" && newRes.boqCtg !="" && newRes.boqQty > 0 && newRes.boqUnitMesure !="" && newRes.boqUprice >0 && newRes.boqUpriceDisc>0) 
    { 
      let addNewBoqRessourceModel = new AddNewBoqRessourceModel();
      this.assignPackages.assignOriginalBoqList=this.SelectedOriginalBoqList;
      addNewBoqRessourceModel.boqList=this.assignPackages;
      addNewBoqRessourceModel.newRessource=newRes;

      this.assignPackageService.AddNewBoqRessource(addNewBoqRessourceModel, CostConn, userName).subscribe((data) => {
        if (data) 
        {
          this.toastr.success("A new Ressource has been added !");
          this.GetOriginalBoqList(this.SearchInput);
        }
        else
          this.toastr.error("You have no Permission !");

        this.AddResModalClose();
      });
      
    } 
    else 
    {
      this.toastr.error("Please Fill All Fields !")
    }
  }

  onEditUnitPriceResSubmit() {
    this.submitted = true;
    if (this.formEditUnitPriceRes.invalid) { return; }

    this.updating = true;
    this.currentBoqRes.boqUprice = this.ff.resUnitPrice.value;

    let CostConn = this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

    this.assignPackageService.updateBoqRes(this.currentBoqRes, CostConn,2).subscribe(response => {
      this.updating = false;
      if (response) {
        this.toastr.success('Updated successfuly');
        //this.onSearch();
        this.recalculateFinalTotals();
        this.modalReference.close();
      }
      else {
        this.toastr.error('An error occured');
      }
    });

  }

  onEditSubmit(origBoq: boolean) {
    this.submitted = true;
    // stop here if form is invalid
    if (this.formEdit.invalid) { return; }

    this.updating = true;

    if (origBoq) {
      this.currentOrigBoq.scopeQtyO = this.f.QtyScope.value;

      let CostConn=this.user.usrLoggedConnString;
      this.loginService.CheckConnection(CostConn).subscribe((data) => { });

      this.assignPackageService.updateOriginalBoqQty(this.currentOrigBoq,CostConn).subscribe(response => {
        this.updating = false;
        if (response) {
          this.toastr.success('Updated successfuly');
          //this.onSearch();
          this.recalculateFinalTotals();
          this.modalReference.close();
        }
        else {
          this.toastr.error('An error occured');
        }
      });
    }
    else {
      this.currentBoqRes.boqScopeQty = this.f.QtyScope.value;

      let CostConn=this.user.usrLoggedConnString;
      this.loginService.CheckConnection(CostConn).subscribe((data) => { });

      this.assignPackageService.updateBoqRes(this.currentBoqRes,CostConn,1).subscribe(response => {
        this.updating = false;
        if (response) {
          this.toastr.success('Updated successfuly');
          //this.onSearch();
          this.recalculateFinalTotals();
          this.modalReference.close();
        }
        else {
          this.toastr.error('An error occured');
        }
      });
    }
  }

  // convenience getter for easy access to form fields
  get fn() { return this.formTrade.controls; }

  updateBoqTradeDescription() {
    this.isAssigning = true;
    //this.assignPackages.assignOriginalBoqList = this.OriginalBoqList;
    //this.assignPackages.assignBoqList = null;
    let desc=this.fn.tradeDesc.value;

    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    
    this.assignPackageService.updateBoqTradeDesc(this.OriginalBoqList,desc,CostConn).subscribe((data) => {
      if (data) {
       // this.SelectedBoqList = [];
       // this.SelectedOriginalBoqList = [];
       // this.BoqList = [];
      //  this.displayedResList = [];
        this.isAssigning = false;
        this.toastr.success("Trade Description Updated")
        //this.uncheckAll();
        //this.SelectedPackage = 0;
        //this.FinalUnitPrice = 0;
        //this.FinalTotalPrice = 0;
        //this.router.navigate(['/package-supplier', this.SelectedPackage]);
        this.GetOriginalBoqList(this.SearchInput);
      }
    });
  }

  updateComment(item: any) {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    // console.log(item.itemO)
    this.assignPackageService.updateComment(item.itemO, item.obTradeDesc,CostConn).subscribe({
      next: () => console.log('Comment updated successfully'),
      error: (err) => console.error('Failed to update comment:', err)
    });
  }

  searchFromDrawer(event : SearchInput)
  {
    this.SearchInput = event;
    this.onSearch();
  }

}
