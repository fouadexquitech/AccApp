import { Component, ElementRef, OnInit, OnDestroy, QueryList, ViewChildren, ViewChild, AfterViewInit, ɵpatchComponentDefWithScope } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { AssignBoqList, AssignOriginalBoqList, AssignPackages, BOQDivList,BOQLevelList, BoqModel, OriginalBoqModel, PackageList, RESDivList, RESPackageList, RessourceList, RESTypeList, SearchInput, SheetDescList } from './assign-package.model';
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
// AH28032023.
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
  displayedBoqList : BoqModel[] = [];
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
  // public dtTrigger: Subject<any> = new Subject<any>();
  public select2Options : Select2.Options = {};
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;
  public isAssigning : boolean = false;
  public isSearching : boolean = false;
  @ViewChildren("checkboxes") checkboxes!: QueryList<ElementRef>;
  checkboxesAll : boolean = false;
  mode : string = 'add';
  EditBoqQtyModalLabel : string = '';
  formEdit: FormGroup;
  submitted : boolean = false;
  updating : boolean = false;
  currentOrigBoq : OriginalBoqModel;
  currentBoqRes : BoqModel;
  modalReference : any;
  modalOptions:NgbModalOptions;
  closeResult: string;
  form: FormGroup;
  formTrade:FormGroup;
  public isValidatingExcel : boolean = false;
  PackageName = "";
  FilePath = "";
  assignByBoqOnly : string;
  public user : User;
  loading : boolean = false;
  // AH28032023
  @ViewChild('inputText') textInput: any; 
  @ViewChild('inputText1') textInput1: any; 
// AH28032023
  public boqPackagesData: Object[] = [
    { id: 0, desc: 'All Items' },
    { id: 1, desc: 'With Assigned Packages' },
    { id: 2, desc: 'Without Assigned Packages' }
];

  public dtTrigger: Subject<any> = new Subject<any>();

  constructor(private assignPackageService: AssignPackageService, 
    private modalService: NgbModal,private spinner: NgxSpinnerService , 
    private toastr: ToastrService,
    private router : Router,
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private packageSupplierService: PackageSupplierService, 
    )
     {this.loginService.user.subscribe(x => this.user = x); }

// AH28032023
   clearAllSearch()
     {
       this.textInput.nativeElement.value = '';
       this.textInput1.nativeElement.value = '';
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

       this.OriginalBoqList = [];
       this.displayedBoqList = [];
     }
// AH28032023
     
  ngOnInit(): void {
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
    this.GetBOQDivList();
    this.GetBOQLevel2List();
    this.GetBOQLevel3List();
    this.GetBOQLevel4List();
    this.GetRESDivList();
    this.GetRESTypeList();
    this.GetPackageList();
    this.GetRESPackageList();
    this.GetSheetDescList();
    this.GetOriginalBoqList(this.SearchInput);
    // this.GetRessourcesList();
    this.GetRessourcesListByLevels();
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

  // AH28032023
  ConnectToDB(connString: string) {
    this.assignPackageService.ConnectToDB(connString).subscribe((data) => {
      
    });
  }
// AH28032023.

  GetBOQDivList() {
    this.assignPackageService.GetBOQDivList().subscribe((data) => {
      if (data) {
        this.BOQDivList = data;
        this.selectedBOQDivList = data;
        //console.log(data)
      }
    });
  }

  GetBOQLevel2List() {
    this.assignPackageService.GetBOQLevel2List().subscribe((data) => {
      if (data) {
        this.BOQLevelList = data;
        this.selectedBOQLevel2List = data;
        //console.log(data)
      }
    });
  }

  GetBOQLevel3List() {
    this.assignPackageService.GetBOQLevel3List().subscribe((data) => {
      if (data) {
        this.BOQLevelList = data;
        this.selectedBOQLevel3List = data;
        //console.log(data)
      }
    });
  }

  GetBOQLevel4List() {
    this.assignPackageService.GetBOQLevel4List().subscribe((data) => {
      if (data) {
        this.BOQLevelList = data;
        this.selectedBOQLevel4List = data;
        //console.log(data)
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

  GetRessourcesList() {
    this.assignPackageService.GetRessourcesList().subscribe((data) => {
      if (data) {
        this.ressourceList = data;
        this.selectedRessources = this.ressourceList;
        this.selectedFilterRessources = data;
      }
    });
  }

  GetRessourcesListByLevels() {
    let body : any = {
      level2 : this.SearchInput.boqLevel2,
      level3 : this.SearchInput.boqLevel3,
      level4 : this.SearchInput.boqLevel4
    };

    this.assignPackageService.GetRessourcesListByLevels(body).subscribe((data) => {
      if (data) {
        this.ressourceList = data;
        this.selectedRessources = this.ressourceList;
        this.selectedFilterRessources = data;
      }
    });

    this.assignPackageService.GetBOQLevel3ListByLevel2(body).subscribe((data) => {
      if (data) {
        this.BOQLevelList = data;
        this.selectedBOQLevel3List = data;
      }
    });
    
    this.assignPackageService.GetBOQLevel4ListByLevel3(body).subscribe((data) => {
      if (data) {
        this.BOQLevelList = data;
        this.selectedBOQLevel4List = data;
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
    this.OriginalBoqList = [];
    this.displayedBoqList = [];
    
    //this.spinner.show();
    this.loading = true;
    this.isSearching = true;
    this.assignPackageService.GetOriginalBoqList(input)
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
          if(_item)
          {
            item.isSelected = true;
          }
        });
        //this.spinner.hide();
        // this.dtTrigger.next();
        this.rerender();

        this.checkboxesAll = this.SelectedOriginalBoqList.length == this.OriginalBoqList.length;
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
      this.SelectedOriginalBoqList.push({ rowNumber: this.SelectedOriginalBoqRow.rowNumber, scope: this.SelectedPackage,tradeDesc: null });
    } else {
      const newIndex = this.SelectedOriginalBoqList.findIndex(x => x.rowNumber === this.SelectedOriginalBoqRow.rowNumber);
      if (newIndex > -1) {
        this.SelectedOriginalBoqList.splice(newIndex, 1);
      }
    }
  }

  OnBoqChecked(evt: any, index: number) {
    this.checkboxesAll = false;
    this.SelectedBoqRow = this.displayedBoqList[index];
    
    if (!evt.target.checked)
    {
      this.FinalTotalPrice -= this.SelectedBoqRow.boqUprice * this.SelectedBoqRow.boqQty;
      this.FinalUnitPrice -= this.SelectedBoqRow.totalUnitPrice;
      this.SelectedBoqList = this.SelectedBoqList.filter(x=>x.boqSeq != this.SelectedBoqRow.boqSeq);

      // this.displayedBoqList.splice(index, 1);
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

  
  selectRow(event: any, i: any) {
    let currentPageIndex = +document.getElementsByClassName('paginate_button current')[0].innerHTML - 1;
    let currentPageSizeSelect = document.getElementsByName('originalBOQTable_length')[0] as HTMLSelectElement;
    let currentPageSize = +currentPageSizeSelect.value;
    let index = i - (currentPageIndex * currentPageSize);
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
              this.OriginalBoqList[i].isSelected = checkbox.checked;
              this.SelectedOriginalBoqRow = this.OriginalBoqList[index];
              if(checkbox.checked)
              {
                this.SelectedOriginalBoqList.push({ rowNumber: this.SelectedOriginalBoqRow.rowNumber, scope: this.SelectedPackage,tradeDesc: null });
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

  

  editDisplayedBoqList(BoqList : BoqModel[], add : boolean)
  {
     BoqList.forEach(boq=>{
        let boqItem = this.OriginalBoqList.find(x=>x.itemO == boq.boqItem);
        boq.totalUnitPrice = boqItem?.unitRate;
        let item = this.displayedBoqList.find(a=>a.boqSeq == boq.boqSeq);
        
        if(add)
        {
          this.FinalTotalPrice += (boq.boqQty * boq.boqUprice);
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
            this.displayedBoqList.push(boq);
          //AH14092023
          // }  
           //AH14092023     
        }
        else
        {
            this.FinalTotalPrice -= (boq.boqQty * boq.boqUprice);
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
                  this.displayedBoqList.splice(this.displayedBoqList.indexOf(item), 1)
                //AH14092023  
                // }              
            // }
             //AH14092023
        }
    });

  }

  clearAllSelections()
  {
    this.checkboxesAll = false;
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

  checkAllOriginalBoq2(event : any) {
    this.SelectedOriginalBoqList = [];
    this.SelectedBoqList = [];
    this.BoqList = [];
    this.displayedBoqList = [];
    const checkbox = event.target as HTMLInputElement;

    this.OriginalBoqList.forEach(el=>{
        el.isSelected = checkbox.checked;
        if(checkbox.checked)
        {
          this.SelectedOriginalBoqList.push({ rowNumber: el.rowNumber, scope: this.SelectedPackage, tradeDesc: null });
        }
    });

    this.displayedBoqList = [];
    this.FinalTotalPrice = 0;
    this.FinalUnitPrice = 0;

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
            
            this.editDisplayedBoqList(boqArr, true);
            //console.log(boqArr.length);            
          }
        });
    }

  }


  // checkAllOriginalBoq(event : any) {
  //   this.SelectedOriginalBoqList = [];
  //   this.SelectedBoqList = [];
  //   this.BoqList = [];
  //   this.displayedBoqList = [];
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
  //         this.displayedBoqList = [];
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
//AH13092023        
        // this.FinalUnitPrice = 0;
        // this.FinalTotalPrice = 0;
        // this.router.navigate(['/package-supplier', this.SelectedPackage]);
//AH13092023
        this.GetOriginalBoqList(this.SearchInput);
      }
    });
  }

//AH03042023
  validateExcelBeforeAssign(){
    //this.spinner.show();
    this.isValidatingExcel = true;
    
    let flexSwitchCheckDefault = document.getElementById("flexSwitchCheckDefault") as HTMLInputElement;
    if(flexSwitchCheckDefault)
    {
      if(flexSwitchCheckDefault.type == 'checkbox' && flexSwitchCheckDefault.checked)
      {
          localStorage.setItem('assignByBoqOnly', '1');
      }      
    }
    
    this.packageSupplierService.validateExcelBeforeAssign(this.SelectedPackage, Number(localStorage.getItem('assignByBoqOnly'))).subscribe((data) => {
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
        this.isValidatingExcel = false;
        this.router.navigate(['/package-supplier', this.SelectedPackage]);
      }
    });
  }

  GetPackageById(IdPkge: number) {
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
    this.displayedBoqList = [];

    this.BoqList = [];
    this.checkboxesAll = false;
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

  ExportExcelPackagesCost(){
      this.assignPackageService.ExportExcelPackagesCost().subscribe((data) => {
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
      this.closeResult = `Closed with: ${result}`;
    }, (reason : any) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  onEditSubmit(origBoq: boolean) {
    this.submitted = true;
    // stop here if form is invalid
    if (this.formEdit.invalid) { return; }

    this.updating = true;

    if (origBoq) {
      this.currentOrigBoq.scopeQtyO = this.f.QtyScope.value;

      this.assignPackageService.updateOriginalBoqQty(this.currentOrigBoq).subscribe(response => {
        this.updating = false;
        if (response) {
          this.toastr.success('Updated successfuly');
          this.onSearch();
          this.modalReference.close();
        }
        else {
          this.toastr.error('An error occured');
        }
      });
    }
    else {

      this.currentBoqRes.boqScopeQty = this.f.QtyScope.value;

      this.assignPackageService.updateBoqResQty(this.currentBoqRes).subscribe(response => {
        this.updating = false;
        if (response) {
          this.toastr.success('Updated successfuly');
          this.onSearch();
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

    this.assignPackageService.updateBoqTradeDesc(this.OriginalBoqList,desc).subscribe((data) => {
      if (data) {
       // this.SelectedBoqList = [];
       // this.SelectedOriginalBoqList = [];
       // this.BoqList = [];
      //  this.displayedBoqList = [];
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

}
