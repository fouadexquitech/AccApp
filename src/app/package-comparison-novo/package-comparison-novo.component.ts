import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { BOQDivList, RESDivList, RESTypeList, SearchInput, SheetDescList } from '../assign-package/assign-package.model';
import { AssignPackageService } from '../assign-package/assign-package.service';
import { AssignSupplierGroup, AssignSuppliertBoq, AssignSuppliertRes, boqItem, DisplayCondition, Group, PackageSuppliersPrice, ressourceItem, RevisionDetails, SupplierBOQ, SupplierGroups, SupplierPercent, SupplierQty, SupplierResrouces, TopManagement, TopManagementAttachement, TopManagementTemplate } from '../package-comparison/package-comparison.model';
import { PackageComparisonService } from '../package-comparison/package-comparison.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { GroupingBoq, GroupingBoqGroup, GroupingLevelModel, GroupingPackageSupplierPrice, GroupingResource } from '../package-groups/package-groups.model';
import { SupplierList, SupplierPackagesList } from '../package-supplier/package-supplier.model';
import { FieldType, Language, User } from '../_models';
import {environment} from '../../environments/environment';
import { PackageSupplierService } from '../package-supplier/package-supplier.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../login/login.service';
import { escapeRegExp } from 'lodash-es';
declare var $: any;
@Component({
  selector: 'app-package-comparison-novo',
  templateUrl: './package-comparison-novo.component.html',
  styleUrls: ['./package-comparison-novo.component.css']
})


export class PackageComparisonNovoComponent implements OnInit {
  packageId : number = 0;
  packageName : string = '';
  SearchInput : SearchInput = new SearchInput();
  byBoq : boolean = false;
  packSuppId: number = 0;
  isShown : boolean = false;
  show : boolean = false;
  toggleClass : string = 'fa-solid fa-toggle-off';
  selectedBOQDivList : any[] = []; 
  RESDivList: RESDivList[] = [];
  BOQDivList: BOQDivList[] = [];
  supplierResourcePercent : SupplierPercent[] = [];
  supplierResourceQty : SupplierQty[] = [];
  supplierBoqPercent : SupplierPercent[] = [];
  supplierBoqQty: SupplierQty[] = [];
  supplierGroupPercent : SupplierPercent[] = [];
  supplierGroupQty : SupplierQty[] = [];
  supplierPercent: SupplierPercent[] = [];
  supplierQty: SupplierPercent[] = [];
  supplierResrouces : SupplierResrouces[] = [];
  supplierBoq : SupplierBOQ[] = [];
  supplierGroups : SupplierGroups[] = [];
  SheetDescList: SheetDescList[] = [];
  SupplierPackagesList: SupplierPackagesList[] = [];
  selectedSheetDescList : any[] = [];
  selectedRESDivList : any[] = [];
  selectedRESTypeList : any[] = [];
  RESTypeList: RESTypeList[] = [];
  searching : boolean = false;
  packageSuppliersPrices: PackageSuppliersPrice[] = [];
  comparisonList : GroupingBoq[] = [];
  groupingBoqGroupList : GroupingBoqGroup[] = [];
  fieldTypes = FieldType;
  selectedResources : number[] = [];
  selectedBoqItems : string[] = [];
  selectedGroups : number[] = [];
  columns : string[] = ["Resource", "Unit", "Qty", "U. price", "T. Price"];
  columnsByBoq : string[] = ["Boq Item", "Unit", "Qty", "U. price", "T. Price"];
  isAssigningSupplierRessource : boolean = false;
  isAssigningSupplierBoq : boolean = false;
  isAssigningSupplierList : boolean = false;
  isAssigningSupplierGroup : boolean = false;
  byGroup : boolean = false;
  techConditionsReplies : DisplayCondition[] = [];
  comConditionsReplies : DisplayCondition[] = [];
  topManagementList : TopManagement[] = [];
  selectedTopManagementList : TopManagement[] = [];
  htmlContent : string = "";
  sendingEmail : boolean = false;
  generatingFile : boolean = false;
  topManagementAttachement :  File | null;
  emailTemplate : string = "";
  languages = Language.languages;

//AH25022024
  public user : User;
  costDB: string = "";
  LevelModelList : GroupingLevelModel[] = [];
  CurrentLevelList : GroupingLevelModel[] = [];
  modalScrollDistance = 2;
  modalScrollThrottle = 50;
  sum = 4;
//AH25022024

  editorConfig: AngularEditorConfig = {
    editable: true,
      spellcheck: true,
      height: '15rem',
      minHeight: '15rem',
      maxHeight: '15rem',
      width: 'auto',
      minWidth: '0',
      translate: 'yes',
      enableToolbar: true,
      showToolbar: true,
      placeholder: 'Enter text here...',
      defaultParagraphSeparator: '',
      defaultFontName: '',
      defaultFontSize: '',
      fonts: [
        {class: 'calibri', name: 'Calibri'},
      ],
      customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
    
    uploadWithCredentials: false,
    sanitize: true,
    toolbarPosition: 'top',
    toolbarHiddenButtons: [
      ['italic']
    ]
};

formEmailTemplate! : FormGroup;
formEmailSubmitted : boolean = false;
topManagementAttachements : TopManagementAttachement[] = [];
listCC : string[] = [];
maxAttachements : number = 5;
supplierList : SupplierList[] = [];
selectedSupplier : SupplierList = null;
generatingContract : boolean = false;
  
constructor(private router: Router, 
  private packageComparisonService: PackageComparisonService,
  private assignPackageService : AssignPackageService,
  private packageSupplierService : PackageSupplierService,
  private toastr : ToastrService,
  private formBuilder : FormBuilder,
  private loginService : LoginService) 
  { 
      if (this.router.getCurrentNavigation().extras.state != undefined) 
      {
        this.packageId= this.router.getCurrentNavigation().extras.state.packageId;
        this.packageName = this.router.getCurrentNavigation().extras.state.packageName;
        this.byBoq = this.router.getCurrentNavigation().extras.state.byBoq;
        //AH25022024
        this.packSuppId=this.router.getCurrentNavigation().extras.state.packSuppId;
        //AH25022024
      } 
      else 
      {
        this.router.navigateByUrl("/package-list");
      }
//AH25022024
      {this.loginService.user.subscribe(x => this.user = x); }
      this.costDB=this.user.usrLoggedCostDB;
//AH25022024
  }

  ngOnInit(): void {
    let body : any = {
      level2 : this.SearchInput.boqLevel2,
      level3 : this.SearchInput.boqLevel3,
      level4 : this.SearchInput.boqLevel4,
      resType: this.SearchInput.rESType,
      boqDiv: this.SearchInput.bOQDiv
    };

    this.GetRESDivList();
    this.GetBOQDivList(body);
    this.GetSheetDescList();
    this.GetRESTypeList(body);
    this.GetSupplierPackagesList();
    this.onSearch();
    this.getTechCondReplies();
    this.getComCondReplies();
    this.GetSupplierList();
  }

  //AH25022024
  FilterRegularItems ( items : GroupingBoq []){
    let itm =items.filter(p => p.isNewItem==false && p.isAlternative==false);
    return itm;
  }
  
  FilterNewItems ( items : GroupingBoq []){
    let itm =items.filter(p => p.isNewItem==true);
    return itm;
  }

  FilterAlternativeItems ( items : GroupingBoq []){
    let itm =items.filter(p => p.isAlternative==true);
    return itm;
  }

  FilterRegularRessource ( items : GroupingResource []){
    let itm =items.filter(p => p.isNewItem==false && p.isAlternative==false);
    return itm;
  }
  
  FilterNewRessource ( items : GroupingResource []){
    let itm =items.filter(p => p.isNewItem==true);
    return itm;
  }

  FilterAlternativeRessource ( items : GroupingResource []){
    let itm =items.filter(p => p.isAlternative==true);
    return itm;
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
//AH25022024

  isResourceSelected(boqSeq : number)
  {
    return false;
  }

  GetSupplierList() {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    this.packageSupplierService.GetSupplierList(this.packageId).subscribe((data) => {
      if (data) {
        this.supplierList = data;
      }
    });
  }

  getPercByResource(revisionDetails : RevisionDetails[], resourceID : number, itemO : string)
  {
    return (revisionDetails.length > 0 ? revisionDetails.find(x=>x.resourceID === resourceID && x.itemO === itemO).perc : 0);
  }

  GetSupplierPackagesList() {
    //this.techConditionsReplies = [];
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    this.packageComparisonService.GetSupplierPackagesList(this.packageId).subscribe((data) => {
      if (data) 
      {
        this.SupplierPackagesList = data;
        //this.byBoq = this.SupplierPackagesList[0].psByBoq;
      }
    });
  }

  checkAllGroups(event : any)
  {
    this.selectedGroups = [];
    let checkbox = event.target as HTMLInputElement;
    this.groupingBoqGroupList.forEach(element => {
      element.isChecked = checkbox.checked;
      if(checkbox.checked)
      {
        this.selectedGroups.push(element.id);
      }
    });
  }

  checkGroup(event : any, group : GroupingBoqGroup)
  {
      let checkbox = event.target as HTMLInputElement;
      let checkAllGroups = document.getElementById("selectAllGroups") as HTMLInputElement;
      group.isChecked = checkbox.checked;
      if(checkbox.checked)
      {
        this.selectedGroups.push(group.id);
      }
      else
      {
         let index =  this.selectedGroups.indexOf(group.id);
         this.selectedGroups.splice(index, 1);
      }

      let allChecked = true;
      this.groupingBoqGroupList.forEach(element => {
        if(!element.isChecked)
        {
          allChecked = false;
          return;
        }
      });

      checkAllGroups.checked = allChecked;

  }

  setSupplierGroupPerc(event : any, item : GroupingBoqGroup, sup : GroupingPackageSupplierPrice)
  {
    let element = event.target as HTMLInputElement;
    this.groupingBoqGroupList.forEach((group : GroupingBoqGroup,i : number)=>{
         
        if(group.id === item.id)
        {
          this.searchSupPercByGroup(Number(element.value), item, sup);
            return;
        }
        
      });   
      
      
  }

  setSupplierGroupQty(event : any, item : GroupingBoqGroup, sup : GroupingPackageSupplierPrice)
  {
    let element = event.target as HTMLInputElement;
    this.groupingBoqGroupList.forEach((group : GroupingBoqGroup,i : number)=>{
         
        if(group.id === item.id)
        {
          this.searchSupQtyByGroup(Number(element.value), item, sup);
            return;
        }
      });   
  }

  showByGroup()
  {
      this.byGroup = !this.byGroup;
      this.getByGroup();
  }

  getByGroup()
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

    console.log(this.byBoq);
    if(this.byGroup && !this.byBoq)
      {
        this.packageComparisonService.getComparisonSheetResourcesByGroup(this.packageId, this.SearchInput).subscribe((data) => {
          if (data) {
            this.groupingBoqGroupList = data;
            //console.log(this.groupingBoqGroupList);
          }
        });
      }
      else if(this.byGroup && this.byBoq)
      {
        this.packageComparisonService.getComparisonSheetBoqByGroup(this.packageId, this.SearchInput).subscribe((data) => {
          if (data) 
          {
            this.groupingBoqGroupList = data;
            //console.log(this.groupingBoqGroupList);
          }
        });
      }
  }

  getTechCondReplies()
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
     this.packageComparisonService.getTechCondReplies(this.packageId,this.costDB).subscribe(data=>{
        this.techConditionsReplies = data;
     });
  }

  getComCondReplies()
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
     this.packageComparisonService.getComCondReplies(this.packageId,this.costDB).subscribe(data=>{
        this.comConditionsReplies = data;
     });
  }

  CloseAssignModal() {
    for (let index = 0; index < this.SupplierPackagesList.length; index++) {
      var input = document.getElementById("valueInput" + index) as HTMLInputElement;
      input.value = null;
    }
    this.supplierPercent = [];
    $("#assignPackageModal").modal('hide');
  }

  AssignPackageSuppliers()
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

    if(!this.byBoq && !this.byGroup)
    {
      let ressourceItems : ressourceItem[] = [];
//AH042024
    this.CurrentLevelList.forEach(level=>{
      level.items.forEach((boq : GroupingBoq, i : any)=>{
      // this.comparisonList.forEach((boq : GroupingBoq, i : any)=>{
//AH042024
        boq.groupingResources.forEach(resource=>{
            if(resource.isChecked)
            {
              ressourceItems.push({resId : resource.boqSeq});
            }
        });
      });
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
        this.packageComparisonService.AssignSupplierListRessourceList(this.packageId, true, assignSuppliertRes).subscribe((data) => {
          this.isAssigningSupplierList = false;
          if (data) {
            this.supplierPercent = [];
            this.toastr.success("Assigned Successfully");
            $("#assignPackageModal").modal('hide');
            
            let checkAll = document.getElementById("selectAllResourcesByItem") as HTMLInputElement;
            checkAll.checked = false;
            this.onSearch();
            this.selectedResources = [];
          }
        });
      }
    }
    else if(this.byBoq && !this.byGroup)
    {
      let boqItems : boqItem[] = [];

    //AH042024
    this.CurrentLevelList.forEach(level=>{
      level.items.forEach((boq : GroupingBoq, i : any)=>{
      // this.comparisonList.forEach((boq : GroupingBoq, i : any)=>{
    //AH042024
            if(boq.isChecked)
            {
              boqItems.push({boqItemID : boq.itemO, isNewItem : boq.isAlternative , isAlternative :boq.isAlternative});
            }
          }); 
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
        let assignSuppliertBoq: AssignSuppliertBoq = {supplierPercentList : this.supplierPercent, supplierBoqItemList : boqItems};
        this.isAssigningSupplierList = true;
        this.packageComparisonService.AssignSupplierListBoqList(this.packageId, true, assignSuppliertBoq).subscribe((data) => {
          this.isAssigningSupplierList = false;
          if (data) {
            this.supplierPercent = [];
            this.toastr.success("Assigned Successfully");
            $("#assignPackageModal").modal('hide');
            
            let checkAll = document.getElementById("selectAllBoqItem") as HTMLInputElement;
            checkAll.checked = false;
            this.onSearch();
            this.selectedBoqItems = [];
          }
        });
      }
    }
    else if(this.byGroup)
    {
      let groups : Group[] = [];

      this.groupingBoqGroupList.forEach((group : GroupingBoqGroup, i : any)=>{
       
            if(group.isChecked)
            {
              groups.push({id : group.id});
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
        let assignSupplierGroup: AssignSupplierGroup = {supplierPercentList : this.supplierPercent, supplierGroupList : groups};
        this.isAssigningSupplierList = true;
        this.packageComparisonService.AssignSupplierListGroupList(this.packageId, this.byBoq, true, assignSupplierGroup).subscribe((data) => {
          this.isAssigningSupplierList = false;
          if (data) {
            this.supplierPercent = [];
            this.toastr.success("Assigned Successfully");
            $("#assignPackageModal").modal('hide');
            
            let checkAll = document.getElementById("selectAllGroups") as HTMLInputElement;
            checkAll.checked = false;
            this.onSearch();
            this.getByGroup();
            this.selectedGroups = [];
          }
        });
      }
    }
  }


  OpenAssignModal() {
    //console.log(this.SupplierPackagesList);
    for (let index = 0; index < this.SupplierPackagesList.length; index++) {
      var input = document.getElementById("valueInput" + index) as HTMLInputElement;
      input.value = '0';
    }
    $("#assignPackageModal").modal('show');
  }

  OpenAssignInputs() {
    this.show = true;
  }

  CloseSendEmailModal()
  {
    $("#modalEmail").modal('hide');
  }

  get f()
  {
    return this.formEmailTemplate.controls;
  }

  openSendEmailModal()
  {
    this.formEmailSubmitted = false;
    this.topManagementAttachements = [];
    this.listCC = [];
    this.formEmailTemplate =  this.formBuilder.group(
      {
        selectedTopManagementList : [null, Validators.required],
        listCC :[[],[]],
        //language: [null, Validators.required],
        template: [null, Validators.required]
      }
      
    );

    this.topManagementAttachement = null;
    //this.emailTemplate = "";
    //this.getEmailTemplate();
    
    this.getManagementEmail();

    $("#modalEmail").modal('show');
    this.getEmailTemplate('0');
  }

  onLanguageChange(event : any)
  {
      let select = event.target as HTMLInputElement;
      let lang = select.value;
      if(lang)
      {
        this.getEmailTemplate(lang);
      }
      else
      {
        this.f.template.setValue('');
      }
  }

  getEmailTemplate(lang : string)
  {
    let CostConn=this.user.usrLoggedConnString;
    
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
      this.packageSupplierService.GetEmailTemplate(lang,this.packageId,"","").subscribe(data=>{
        this.f.template.setValue(data?.etContent);
      });
  }

  getManagementEmail()
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    this.selectedTopManagementList = [];
      this.packageComparisonService.getManagementEmail('').subscribe(data=>{
          this.topManagementList = data;
      });
  }
  

  generatePDF()
  {
    let data = document.getElementsByClassName("table-comparison")[0] as HTMLTableElement;
    this.generatingFile = true;
    html2canvas(data).then(canvas => {  
      // Few necessary setting options  
      this.generatingFile = false;
      let imgWidth = 208;   
      let pageHeight = 295;    
      let imgHeight = canvas.height * imgWidth / canvas.width;  
      let heightLeft = imgHeight;  

      const contentDataURL = canvas.toDataURL('image/gif')  
      let pdf = new jsPDF('p', 'mm', 'a4', true); // A4 size page of PDF  
      let position = 0;  
      pdf.addImage(contentDataURL, 'GIF', 0, position, imgWidth, imgHeight)  
      pdf.save(new Date().toLocaleDateString("en-UK") + '.pdf'); // Generated PDF   
    });  
  }

  generateExcel()
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    console.log(1)
      this.generatingFile = true;
      if(!this.byGroup)
      {
        if(!this.byBoq)
        {console.log(2)
            this.packageComparisonService.getComparisonSheet_Excel(this.packageId, this.SearchInput,this.packSuppId,this.costDB).subscribe(data=>{
              if (data) {
                console.log(22)
                //this.spinner.hide();
                this.generatingFile = false;
                
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
        else
        {
          console.log(3)
            this.packageComparisonService.GetComparisonSheetByBoq_Excel(this.packageId, this.SearchInput,this.packSuppId,this.costDB).subscribe(data=>{
              if (data) {
                console.log(4)
                //this.spinner.hide();
                this.generatingFile = false;
                
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
      }
      else
      {
        if(!this.byBoq)
        {
            this.packageComparisonService.getComparisonSheetResourcesByGroup_Excel(this.packageId, this.SearchInput,this.packSuppId,this.costDB).subscribe(data=>{
              if (data) {
                //this.spinner.hide();
                this.generatingFile = false;

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
        else
        {
          this.packageComparisonService.getComparisonSheetBoqByGroup_Excel(this.packageId, this.SearchInput,this.packSuppId,this.costDB).subscribe(data=>{
            if (data) {
              //this.spinner.hide();
              this.generatingFile = false;
              
              
      
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
      }
  }

  generateSupplierContract()
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

      if(!this.selectedSupplier)
      {
          this.toastr.error('Please select a supplier');
          return;
      }

      this.packageComparisonService.generateSuppliersContractsExcel(this.packageId, this.SearchInput,this.packSuppId,this.costDB).subscribe(res=>{
          if(res)
          {
            let a = document.createElement('a');
            a.id = 'downloader';
            a.target = '_blank'; 
            a.style.visibility = "hidden";
            document.body.appendChild(a);
            a.href = environment.baseApiUrl +'api/RevisionDetails/DownloadFile?filename=' + res;
            a.click();
          }
          else
          {
              this.toastr.error('Error Downloading File');
          }
      });
  }

  CloseContractModal()
  {
      $('#generateContractModal').modal('hide');
  }

  openGenerateContract()
  {    
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
      this.generatingContract = true;
      
      this.packageComparisonService.generateSuppliersContractsExcel(this.packageId, this.SearchInput,this.packSuppId,this.costDB).subscribe(res=>{
        this.generatingContract = false;
        if(res)
        {
          let a = document.createElement('a');
          a.id = 'downloader';
          a.target = '_blank'; 
          a.style.visibility = "hidden";
          document.body.appendChild(a);
          let arr : string[] = res;
          arr.forEach(path=>{
            a.href = environment.baseApiUrl +'api/RevisionDetails/DownloadFile?filename=' + path;
            a.click();
          });         
        }
        else
        {
            this.toastr.error('Error Downloading File');
        }
    });
  }

  sendEmail()
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
      this.formEmailSubmitted = true;
      
      if(this.formEmailTemplate.invalid)
      {
          this.toastr.error('Fields are required', '');
          return;
      }

      /*if(this.topManagementAttachements.length == 0)
      {
        this.toastr.error('Please add your attachement', '');
          return;
      }*/
      console.log(this.f.listCC.value);
      this.sendingEmail = true;
      let topManagementTemplate : TopManagementTemplate = { packageId : this.packageId, 
        topManagements : this.f.selectedTopManagementList?.value, 
        template : this.f.template?.value,
        listCC : this.f.listCC.value, userName : this.loginService.userValue?.usrId };
        
        let files : File[] = [];
        this.topManagementAttachements.forEach(file=>{
          files.push(file.file);
        });
        
        this.packageComparisonService.sendCompToManagement(topManagementTemplate, files).subscribe(data=>{
        this.sendingEmail = false;
          if(data)
          {
            this.toastr.success('Email sent successfully', '');
            this.CloseSendEmailModal();
          }
      });
  }

  removeAttachement(index : number)
  {
    this.topManagementAttachements.splice(index, 1);
  }

  addAttachement()
  {
      this.topManagementAttachements.push({id : 0, file : null});
  }

  onFileSelect(event : any, index : number)
  {
    if (event.target.files.length > 0) {

      const file = event.target.files[0];
      this.topManagementAttachements[index].file = file;
    }
    else
    {
      this.topManagementAttachements[index].file = null;
    }
  }

  saveByQty()
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

    if(!this.byBoq && !this.byGroup)
    {
    this.supplierResrouces = [];
    this.supplierResourceQty = [];    
    let oneResourceChecked = false;
    let qtyIsValid = true;
    this.comparisonList.forEach((boq : GroupingBoq, i : any)=>{
    
        let resources = boq.groupingResources;
        resources.forEach((resource : GroupingResource, index : any) => {
          if(resource.isChecked)
          {
            oneResourceChecked = true;
          let resourceId = resource.boqSeq;
          let totalQty = 0;
          let sups = resource.groupingPackageSuppliersPrices;
          resource.validPerc = true;
          this.supplierResourceQty = [];
          sups.forEach((sup, j)=>{
          if (sup.supplierName != "Ideal"){
            totalQty += sup.assignedQty;
          }
            this.supplierResourceQty.push({supID : sup.supplierId, qty : sup.assignedQty});        
          });
          
          //console.log(totalQty);

          //alert(totalPerc);
          if(totalQty != resource.qty)
          { 
              qtyIsValid = false;
              resource.validPerc = false;
          }
          
          const newSupplierResource : SupplierResrouces = {
            resourceID : resourceId,
            supplierPercents : [],
            supplierQtys : this.supplierResourceQty,
            isAlternative:false,
            isNewItem:false
          };
          this.supplierResrouces.push(newSupplierResource);
        }        
        });
      
    });

    if(oneResourceChecked)
    {
    if (!qtyIsValid) 
    {
        this.toastr.error("Sum of quantities should be less then or equals to the resource quantity");
        this.supplierResrouces = [];
        this.supplierResourceQty = [];
        qtyIsValid = true;
        
    } 
    else {
        this.isAssigningSupplierRessource = true;
        this.packageComparisonService.AssignSupplierRessource(this.packageId, false, this.supplierResrouces).subscribe((data) => {
        this.isAssigningSupplierRessource = false;
        if (data) {
        this.supplierResrouces = [];
        this.supplierResourceQty = [];
        this.selectedResources = [];
        this.toastr.success("Assigned Successfully");
        let checkAll = document.getElementById("selectAllResourcesByItem") as HTMLInputElement;
        checkAll.checked = false;
        this.onSearch();
        this.Cancel();
        
        }
      });
    }
  }
  else
  {
    this.toastr.warning("You must selected at least one resource");
  }
  }
    
    else if(this.byBoq && !this.byGroup)
    {
      //byBoq only
      this.supplierBoq = [];
      this.supplierBoqQty = [];    
      let oneItemChecked = false;
      let qtyIsValid = true;
//AH042024
      this.CurrentLevelList.forEach(level=>{
        level.items.forEach((boq : GroupingBoq, i : any)=>{
      // this.comparisonList.forEach((boq : GroupingBoq, i : any)=>{
//AH042024    
          if(boq.isChecked)
          {
            oneItemChecked = true;
            let itemO = boq.itemO;
            let isNew = boq.isNewItem;
            let isAlternative = boq.isAlternative;
            let totalQty = 0;
            let sups = boq.groupingPackageSuppliersPrices;
            boq.validPerc = true;
            this.supplierBoqQty = [];
            sups.forEach((sup, j)=>{
                if (sup.supplierName != "Ideal"){
                  totalQty += sup.assignedQty;
                }
                if(totalQty <= boq.quotationQty){
                  this.supplierBoqQty.push({supID : sup.supplierId, qty : sup.assignedQty});
                }
                console.log(1);
                console.log(totalQty);
                console.log(boq.quotationQty);

            });

          //alert(totalPerc);
          if(totalQty != boq.quotationQty)
          { 
              qtyIsValid = false;
              boq.validPerc = false;
          }
          
          const newSupplierBoq : SupplierBOQ = {
            boqItemID : itemO,
            supplierPercents : [],
            supplierQtys : this.supplierBoqQty,
            isAlternative:isAlternative,
            isNewItem:isNew
          };
          this.supplierBoq.push(newSupplierBoq);
        }
      });
    });

    if(oneItemChecked)
    {
    if (!qtyIsValid) 
    {
        this.toastr.error("Sum of quantities should be less then or equals to the item quantity");
        this.supplierBoq = [];
        this.supplierBoqQty = [];
        qtyIsValid = true;
    } 
    else {
        this.isAssigningSupplierBoq = true;
        this.packageComparisonService.AssignSupplierBOQ(this.packageId, false, this.supplierBoq).subscribe((data) => {
        this.isAssigningSupplierBoq = false;
        if (data) {
        this.supplierResrouces = [];
        this.supplierBoqQty= [];
        this.selectedBoqItems = [];
        this.toastr.success("Assigned Successfully");
        let checkAll = document.getElementById("selectAllBoqItem") as HTMLInputElement;
        checkAll.checked = false;
        this.onSearch();
        this.Cancel();
        }
      });
    }
  }
  else
  {
    this.toastr.warning("You must selected at least one item");
  }
    }
    else if(this.byGroup)
    { 
      Swal.fire({  
        title: 'You are about to overwrite the values!',  
        text: 'Are you sure you want to proceed? Please confirm',  
        icon: 'warning',  
        showCancelButton: true,  
        confirmButtonText: 'Proceed',  
        cancelButtonText: 'Cancel'  
      }).then((result) => {  
        if (result.value) 
        {   
          let oneGroupChecked = false;
          let qtyIsValid = true;
          this.supplierGroups = [];
          this.supplierGroupQty = [];
          this.groupingBoqGroupList.forEach((group : GroupingBoqGroup, i : number)=>{
              
              if(group.isChecked)
              {
                oneGroupChecked = true;
                let groupId = group.id;
                let totalQty = 0;
                let sups = group.groupingPackageSuppliersPrices;
               
                group.validPerc = true;
                this.supplierGroupQty = [];
                  sups.forEach((sup, j)=>{
                    totalQty += sup.assignedQty;
                    this.supplierGroupQty.push({supID : sup.supplierId, qty : sup.assignedQty});
                  });

                  const newSupplierGroups : SupplierGroups = {
                    groupId : groupId,
                    supplierPercents : [],
                    supplierQtys : this.supplierGroupQty
        
                  };
                  this.supplierGroups.push(newSupplierGroups);
              }
          });

          if(oneGroupChecked)
          {
            if (!qtyIsValid) 
            {
                this.toastr.error("Sum of quantities should be less then or equals to the group quantity");
                this.supplierGroups = [];
                this.supplierGroupQty = [];
                qtyIsValid = true;
              }
              else
              {
                this.isAssigningSupplierGroup = true;
                this.packageComparisonService.AssignSupplierGroup(this.packageId, this.byBoq, false, this.supplierGroups).subscribe((data) => {
                this.isAssigningSupplierGroup = false;
                if (data) {
                this.supplierGroups = [];
                this.supplierGroupQty= [];
                this.selectedGroups = [];
                this.toastr.success("Assigned Successfully");
                let checkAll = document.getElementById("selectAllGroups") as HTMLInputElement;
                checkAll.checked = false;
                this.onSearch();
                this.getByGroup();
                this.Cancel();
                }
              });
            }
          }
          else
          {
            this.toastr.warning("You must select at least one group");
          }
          

        } else if (result.dismiss === Swal.DismissReason.cancel) {  
           this.Cancel();
        }  
      }); 
    }
  }

  saveNew(){
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    
    if(!this.byBoq && !this.byGroup)
    {
    this.supplierResrouces = [];
    this.supplierResourcePercent = [];    
    let oneResourceChecked = false;
    let percIsValid = true;
    this.comparisonList.forEach((boq : GroupingBoq, i : any)=>{
    
        let resources = boq.groupingResources;
        resources.forEach((resource : GroupingResource, index : any) => {
          if(resource.isChecked)
          {
            oneResourceChecked = true;
          let resourceId = resource.boqSeq;
          let totalPerc = 0;
          let sups = resource.groupingPackageSuppliersPrices;
          resource.validPerc = true;
          this.supplierResourcePercent = [];
          sups.forEach((sup, j)=>{
            totalPerc += sup.assignedPercentage;
            this.supplierResourcePercent.push({supID : sup.supplierId, percent : sup.assignedPercentage});
          });
          
          //alert(totalPerc);
          if(totalPerc > 100 || totalPerc < 100)
          { 
              percIsValid = false;
              resource.validPerc = false;
              
          }
       
          
          const newSupplierResource : SupplierResrouces = {
            resourceID : resourceId,
            supplierPercents : this.supplierResourcePercent,
            supplierQtys : [],
            isAlternative:false,
            isNewItem:false

          };
          this.supplierResrouces.push(newSupplierResource);
        }
         
        });
      
    });

    if(oneResourceChecked)
    {
    if (!percIsValid) 
    {
        this.toastr.error("Total percentage for each resource should be equal to 100");
        this.supplierResrouces = [];
        this.supplierResourcePercent = [];
        percIsValid = true;
        
    } 
    else {
        this.isAssigningSupplierRessource = true;
        this.packageComparisonService.AssignSupplierRessource(this.packageId, true, this.supplierResrouces).subscribe((data) => {
        this.isAssigningSupplierRessource = false;
        if (data) {
        this.supplierResrouces = [];
        this.supplierResourcePercent = [];
        this.selectedResources = [];
        this.toastr.success("Assigned Successfully");
        let checkAll = document.getElementById("selectAllResourcesByItem") as HTMLInputElement;
        checkAll.checked = false;
        this.onSearch();
        this.Cancel();
        
        }
      });
    }
  }
  else
  {
    this.toastr.warning("You must selected at least one resource");
  }
  }
    
    else if(this.byBoq && !this.byGroup)
    {
      //byBoq only
      this.supplierBoq = [];
      this.supplierBoqPercent = [];    
      let oneItemChecked = false;
      let percIsValid = true;
      this.comparisonList.forEach((boq : GroupingBoq, i : any)=>{
             
          if(boq.isChecked)
          {
            oneItemChecked = true;
          let itemO = boq.itemO;
          let totalPerc = 0;
          let sups = boq.groupingPackageSuppliersPrices;
          boq.validPerc = true;
          this.supplierBoqPercent = [];
          sups.forEach((sup, j)=>{
            totalPerc += sup.assignedPercentage;
            this.supplierBoqPercent.push({supID : sup.supplierId, percent : sup.assignedPercentage});
          });
          
          //alert(totalPerc);
          if(totalPerc > 100 || totalPerc < 100)
          { 
              percIsValid = false;
              boq.validPerc = false;
              
          }
       
          
          const newSupplierBoq : SupplierBOQ = {
            boqItemID : itemO,
            supplierPercents : this.supplierBoqPercent,
            supplierQtys : [],
            isAlternative:false,
            isNewItem:false

          };
          this.supplierBoq.push(newSupplierBoq);
        }
         
        
      
    });
    if(oneItemChecked)
    {
    if (!percIsValid) 
    {
        this.toastr.error("Total percentage for each item should be equal to 100");
        this.supplierBoq = [];
        this.supplierBoqPercent = [];
        percIsValid = true;
        
    } 
    else {
        this.isAssigningSupplierBoq = true;
        this.packageComparisonService.AssignSupplierBOQ(this.packageId, true, this.supplierBoq).subscribe((data) => {
        this.isAssigningSupplierBoq = false;
        if (data) {
        this.supplierResrouces = [];
        this.supplierBoqPercent = [];
        this.selectedBoqItems = [];
        this.toastr.success("Assigned Successfully");
        let checkAll = document.getElementById("selectAllBoqItem") as HTMLInputElement;
        checkAll.checked = false;
        this.onSearch();
        this.Cancel();
        
        }
      });
    }
  }
  else
  {
    this.toastr.warning("You must selected at least one item");
  }
    }
    else if(this.byGroup)
    { 
      Swal.fire({  
        title: 'You are about to overwrite the values!',  
        text: 'Are you sure you want to proceed? Please confirm',  
        icon: 'warning',  
        showCancelButton: true,  
        confirmButtonText: 'Proceed',  
        cancelButtonText: 'Cancel'  
      }).then((result) => {  
        if (result.value) 
        {   
          let oneGroupChecked = false;
          let percIsValid = true;
          this.supplierGroups = [];
          this.supplierGroupPercent = [];
          this.groupingBoqGroupList.forEach((group : GroupingBoqGroup, i : number)=>{
              
              if(group.isChecked)
              {
                oneGroupChecked = true;
                let groupId = group.id;
                let totalPerc = 0;
                let sups = group.groupingPackageSuppliersPrices;
               
                group.validPerc = true;
                this.supplierGroupPercent = [];
                  sups.forEach((sup, j)=>{
                    totalPerc += sup.assignedPercentage;
                    this.supplierGroupPercent.push({supID : sup.supplierId, percent : sup.assignedPercentage});
                  });

                  if(totalPerc > 100 || totalPerc < 100)
                  { 
                      percIsValid = false;
                      group.validPerc = false;
                      
                  }
               
                  
                  const newSupplierGroups : SupplierGroups = {
                    groupId : groupId,
                    supplierPercents : this.supplierGroupPercent,
                    supplierQtys : []
        
                  };
                  this.supplierGroups.push(newSupplierGroups);
              }
          });

          if(oneGroupChecked)
          {
            if (!percIsValid) 
            {
                this.toastr.error("Total percentage for each group should be equal to 100");
                this.supplierGroups = [];
                this.supplierGroupPercent = [];
                percIsValid = true;
              }
              else
              {
                this.isAssigningSupplierGroup = true;
                this.packageComparisonService.AssignSupplierGroup(this.packageId, this.byBoq, true, this.supplierGroups).subscribe((data) => {
                this.isAssigningSupplierGroup = false;
                if (data) {
                this.supplierGroups = [];
                this.supplierGroupPercent = [];
                this.selectedGroups = [];
                this.toastr.success("Assigned Successfully");
                let checkAll = document.getElementById("selectAllGroups") as HTMLInputElement;
                checkAll.checked = false;
                this.onSearch();
                this.getByGroup();
                this.Cancel();
                }
              });
            }
          }
          else
          {
            this.toastr.warning("You must select at least one group");
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {  
           this.Cancel();
        }  
      }); 
    }

  }

  getTotalBudget()
  {
    let total = 0;
    if(!this.byBoq)
    {
        this.comparisonList.forEach(item=>{
            item.groupingResources.forEach(resource=>{
              total += resource.totalPrice;
            });
        });
    }
    else
    {
      this.comparisonList.forEach(item=>{
          total += item.totalPrice;   
    });
    }
    return total;
  }

  getTotalQuotation()
  {
    let totalQotation = 0;
    if(!this.byBoq)
    {
        this.comparisonList.forEach(item=>{
            item.groupingResources.forEach(resource=>{
              totalQotation += resource.quotationAmt;
            });
        });
    }
    else
    {
      this.comparisonList.forEach(item=>{
        totalQotation += item.quotationAmt;   
    });
    }
    // totalQotation=1;
    return totalQotation;
  }

  Cancel(){
    this.show = false;
  }

  setSupplierQty(event:any, resource : GroupingResource, sup : GroupingPackageSupplierPrice)
  {
    let element = event.target as HTMLInputElement;
    this.comparisonList.forEach((boq : GroupingBoq,i : number)=>{
          boq.groupingResources.forEach((res : GroupingResource, j : number)=>{
              if(res.boqSeq === resource.boqSeq)
              {
                this.searchSupQty(Number(element.value), resource, sup);
                  return;
              }
          });
      });
  }

  setSupplierPerc(event:any, resource : GroupingResource, sup : GroupingPackageSupplierPrice)
  {
    let element = event.target as HTMLInputElement;
    this.comparisonList.forEach((boq : GroupingBoq,i : number)=>{
          boq.groupingResources.forEach((res : GroupingResource, j : number)=>{
              if(res.boqSeq === resource.boqSeq)
              {
                this.searchSupPerc(Number(element.value), resource, sup);
                  return;
              }
          });
      });
  }

  setSupplierQtyByBoq(event:any, item : GroupingBoq, sup : GroupingPackageSupplierPrice)
  {
    let element = event.target as HTMLInputElement;

    //AH042024
    this.CurrentLevelList.forEach(level=>{
      level.items.forEach((boq : GroupingBoq,i : number)=>{
    //this.comparisonList.forEach((boq : GroupingBoq,i : number)=>{
    //AH042024
              if(boq.itemO === item.itemO)
              {
                this.searchSupQtyByBoq(Number(element.value), item, sup);
                  return;
              }
      });
    });
  }

  setSupplierPercByBoq(event:any, item : GroupingBoq, sup : GroupingPackageSupplierPrice)
  {
    let element = event.target as HTMLInputElement;
    this.comparisonList.forEach((boq : GroupingBoq,i : number)=>{
          
              if(boq.itemO === item.itemO)
              {
                this.searchSupPercByBoq(Number(element.value), item, sup);
                  return;
              }
      });
  }

  searchSupQty(val : number, resource : GroupingResource, sup : GroupingPackageSupplierPrice)
  {
    resource.groupingPackageSuppliersPrices.forEach(item => {
          if(item.supplierId === sup.supplierId)
          {
              item.assignedQty = val;
              return;
          }
      });
  }

  searchSupPerc(val : number, resource : GroupingResource, sup : GroupingPackageSupplierPrice)
  {
    resource.groupingPackageSuppliersPrices.forEach(item => {
          if(item.supplierId === sup.supplierId)
          {
              item.assignedPercentage = val;
              return;
          }
      });
  }

  searchSupPercByGroup(val : number, group : GroupingBoqGroup, sup : GroupingPackageSupplierPrice)
  {
    group.groupingPackageSuppliersPrices.forEach(item => {
          if(item.supplierId === sup.supplierId)
          {
              item.assignedPercentage = val;
              return;
          }
      });
      
  }

  searchSupQtyByGroup(val : number, group : GroupingBoqGroup, sup : GroupingPackageSupplierPrice)
  {
    group.groupingPackageSuppliersPrices.forEach(item => {
          if(item.supplierId === sup.supplierId)
          {
              item.assignedQty = val;
              return;
          }
      });  
  }

  searchSupPercByBoq(val : number, boq : GroupingBoq, sup : GroupingPackageSupplierPrice)
  {
    boq.groupingPackageSuppliersPrices.forEach(item => {
          if(item.supplierId === sup.supplierId)
          {
              item.assignedPercentage = val;
              return;
          }
      });
  }

  searchSupQtyByBoq(val : number, boq : GroupingBoq, sup : GroupingPackageSupplierPrice)
  {
    boq.groupingPackageSuppliersPrices.forEach(item => {
          if(item.supplierId === sup.supplierId)
          {
              item.assignedQty = val;
              return;
          }
      });
  }
  

  toggleShow()
  {
    this.isShown = !this.isShown;
    this.toggleClass = (this.isShown ? 'fa-solid fa-toggle-on' : 'fa-solid fa-toggle-off');
  }

  onSearch(){
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

    this.searching = true;
      if(!this.byBoq)
      {
        this.packageComparisonService.getComparisonSheet(this.packageId, this.SearchInput).subscribe(data=>{
        this.searching = false; 
        if(data)
        {
            //AH04042024
            // this.comparisonList = data;
            this.CurrentLevelList= data; 
            //AH04042024
            this.getSuppliersPrice();
             
        }
      });
    }
    else
    {
      this.packageComparisonService.getComparisonSheetByBoq(this.packageId, this.SearchInput).subscribe(data=>{
        this.searching = false; 
        if(data)
        {
            //console.log(data);
            //AH04042024
            // this.comparisonList = data;
            this.CurrentLevelList= data; 
            //AH04042024
            this.getSuppliersPrice();
        }
      });
    }
  }

  selectAllBoqItems(target:any)
  {
     this.selectedBoqItems = [];
      let checkbox = target as HTMLInputElement;
//AH09042024
      // this.comparisonList.forEach(item=>{
      this.CurrentLevelList.forEach(level=>{
        level.items.forEach(item=>{
//AH09042024
          item.isChecked = checkbox.checked;
          if(checkbox.checked)
          {
              this.selectedBoqItems.push(item.itemO);
              //this.show = true;//AH09042024
          }
          else
          {
              let index = this.selectedBoqItems.indexOf(item.itemO);
              this.selectedBoqItems.splice(index,1);
              //this.show = false;//AH09042024
          }
        }); 
      });
  }

  selectBoq(event : any, item : GroupingBoq)
  {
    let allCheckbox = document.getElementById('selectAllBoqItem') as HTMLInputElement;
    let checkbox = event.target as HTMLInputElement;
    item.isChecked = checkbox.checked;
    let allChecked : boolean = true;
    
    if(checkbox.checked)
    {
        this.selectedBoqItems.push(item.itemO);
       // this.show = true;//AH09042024
    }
    else
    {
        let index = this.selectedBoqItems.indexOf(item.itemO);
        this.selectedBoqItems.splice(index,1);
        //this.show = false;//AH09042024
    }

    let everythingChecked : boolean = true;
    //AH09042024
    // this.comparisonList.forEach(item=>{
    //     if(!item.isChecked)
    //     {
    //       everythingChecked = false;
    //       return;
    //     }
    // });

    this.CurrentLevelList.forEach(level=>{
      level.items.forEach(item=>{
      if(!item.isChecked)
      {
        everythingChecked = false;
        return;
      }
    });
  });
    //AH09042024
    allCheckbox.checked = everythingChecked;
  }

  getSuppliersPrice()
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

    this.packageComparisonService.GetPackageSuppliersPrice(this.packageId, this.SearchInput).subscribe((data) => {
        if(data)
        {
            this.packageSuppliersPrices = data;
        }
    });
  }

  GetRESDivList() {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    this.assignPackageService.GetRESDivList().subscribe((data) => {
      if (data) {
        this.RESDivList = data;
        this.selectedRESDivList = data;
      }
    });
  }

  GetBOQDivList(body:any) {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    this.assignPackageService.GetBOQDivList(body).subscribe((data) => {
      if (data) {
        this.BOQDivList = data;
      }
    });
  }

  GetSheetDescList() {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    this.assignPackageService.GetSheetDescList().subscribe((data) => {
      if (data) {
        this.SheetDescList = data;
        this.selectedSheetDescList = data;
      }
    });
  }

  GetRESTypeList(body : any) {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    this.assignPackageService.GetRESTypeList(body).subscribe((data) => {
      if (data) {
        this.RESTypeList = data;
        this.selectedRESTypeList = data;
      }
    });
  }

  onSelectAllSheetDesc()
  {
      this.selectedSheetDescList = [];
      this.SheetDescList.forEach(item=>{
        this.selectedSheetDescList.push(item.obSheetDesc);
      });
  }

  onSelectAllRESDiv()
  {
    this.selectedRESDivList = [];
      this.RESDivList.forEach(item=>{
        this.selectedRESDivList.push(item.boqDiv);
      });
  }

  onSelectAllBOQDiv()
  {
    this.selectedBOQDivList = [];
    this.BOQDivList.forEach(item=>{
      this.selectedBOQDivList.push(item.sectionO);
    });
     
  }

  onSelectAllRESType()
  {
    this.selectedRESTypeList = [];
      this.RESTypeList.forEach(item=>{
        this.selectedRESTypeList.push(item.boqCtg);
      });
  }

  selectAllItemsByResource(target : any)
  {
    this.selectedResources = [];
      let checkbox = target as HTMLInputElement;
      this.comparisonList.forEach(item=>{
        item.isChecked = checkbox.checked;
        item.groupingResources.forEach((resource, index)=>{
          resource.isChecked = checkbox.checked;
          if(checkbox.checked)
          {
              this.selectedResources.push(resource.boqSeq);
          }
          else
          {
              let index = this.selectedResources.indexOf(resource.boqSeq);
              this.selectedResources.splice(index,1);
          }
        });
      });

      //console.log(this.selectedResources);
  }

  selectResourcesByItem(event: any, item : GroupingBoq)
  {
    let allCheckbox = document.getElementById('selectAllResourcesByItem') as HTMLInputElement;
    let checkbox = event.target as HTMLInputElement;
    item.isChecked = checkbox.checked;
    item.groupingResources.forEach((resource, index)=>{
      resource.isChecked = checkbox.checked;
      if(checkbox.checked)
    {
        this.selectedResources.push(resource.boqSeq);
    }
    else
    {
        let index = this.selectedResources.indexOf(resource.boqSeq);
        this.selectedResources.splice(index,1);
    }
    });

    let allChecked : boolean = true;
    this.comparisonList.forEach(item=>{
      if(!item.isChecked)
      {
          allChecked = false;
          return;
      }
      
    });

    allCheckbox.checked = allChecked;
    //console.log(this.selectedResources);
  }


  selectResource(event : any, resource : GroupingResource, item : GroupingBoq)
  {
    let allCheckbox = document.getElementById('selectAllResourcesByItem') as HTMLInputElement;
    let checkbox = event.target as HTMLInputElement;
    resource.isChecked = checkbox.checked;
    let allChecked : boolean = true;
    item.groupingResources.forEach(res=>{
      if(!res.isChecked )
      {
        allChecked = false;
        return;
      }
    });

    item.isChecked = allChecked;
    
    if(checkbox.checked)
    {
        this.selectedResources.push(resource.boqSeq);
    }
    else
    {
        let index = this.selectedResources.indexOf(resource.boqSeq);
        this.selectedResources.splice(index,1);
    }

    let everythingChecked : boolean = true;
    this.comparisonList.forEach(item=>{
      item.groupingResources.forEach(res=>{
        if(!res.isChecked)
        {
          everythingChecked = false;
          return;
        }
      });
    });

    allCheckbox.checked = everythingChecked;
    //console.log(this.selectedResources);
  }

  isAssigned(event : any){
    return false;
  }

  //AH05032024
  excludBoq(event : any, item : GroupingBoq)
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    // let allCheckbox = document.getElementById('selectAllBoqItem') as HTMLInputElement;
    let checkbox = event.target as HTMLInputElement;
    item.isExcluded = checkbox.checked;
    // if(checkbox.checked)
    // {
    //     this.selectedBoqItems.push();
    // }
    // else
    // {
    //     let index = this.selectedBoqItems.indexOf(item.itemO);
    //     this.selectedBoqItems.splice(index,1);
    // // }
    // console.log(this.packageId);
    // console.log(item.itemO);
    // console.log(item.isNewItem);
    this.packageComparisonService.excludBoq(this.packageId, item.itemO,item.isNewItem,item.isExcluded).subscribe(data=>{
      this.onSearch();
    });
  }

  excludRessource(event : any, boqRes : GroupingResource)
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    
    let checkbox = event.target as HTMLInputElement;
    boqRes.isExcluded = checkbox.checked;

    this.packageComparisonService.excludRessource(this.packageId, boqRes.boqSeq,boqRes.isNewItem,boqRes.isAlternative,boqRes.isExcluded).subscribe(data=>{
      this.onSearch();
    });
  }
  //AH05032024
}
