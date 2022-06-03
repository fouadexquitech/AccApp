import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { BOQDivList, RESDivList, RESTypeList, SearchInput, SheetDescList } from '../assign-package/assign-package.model';
import { AssignPackageService } from '../assign-package/assign-package.service';
import { AssignSupplierGroup, AssignSuppliertBoq, AssignSuppliertRes, boqItem, DisplayCondition, Group, PackageSuppliersPrice, ressourceItem, RevisionDetails, SupplierBOQ, SupplierGroups, SupplierPercent, SupplierQty, SupplierResrouces, TopManagement, TopManagementTemplate } from '../package-comparison/package-comparison.model';
import { PackageComparisonService } from '../package-comparison/package-comparison.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { GroupingBoq, GroupingBoqGroup, GroupingPackageSupplierPrice, GroupingResource } from '../package-groups/package-groups.model';
import { SupplierPackagesList } from '../package-supplier/package-supplier.model';
import { FieldType } from '../_models';
import {environment} from '../../environments/environment';
import { PackageSupplierService } from '../package-supplier/package-supplier.service';
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
  
  constructor(private router: Router, 
    private packageComparisonService: PackageComparisonService,
    private assignPackageService : AssignPackageService,
    private packageSupplierService : PackageSupplierService,
    private toastr : ToastrService) { 
    if (this.router.getCurrentNavigation().extras.state != undefined) {
      this.packageId= this.router.getCurrentNavigation().extras.state.packageId;
      this.packageName = this.router.getCurrentNavigation().extras.state.packageName;
      this.byBoq = this.router.getCurrentNavigation().extras.state.byBoq;
    } else {
      this.router.navigateByUrl("/package-list");
    }
  }

  ngOnInit(): void {
    this.GetRESDivList();
    this.GetBOQDivList();
    this.GetSheetDescList();
    this.GetRESTypeList();
    this.GetSupplierPackagesList();
    this.onSearch();
    this.getTechCondReplies();
    this.getComCondReplies();
  }

  isResourceSelected(boqSeq : number)
  {
    return false;
  }

  getPercByResource(revisionDetails : RevisionDetails[], resourceID : number, itemO : string)
  {
    return (revisionDetails.length > 0 ? revisionDetails.find(x=>x.resourceID === resourceID && x.itemO === itemO).perc : 0);
  }

  GetSupplierPackagesList() {
    //this.techConditionsReplies = [];
    
    this.packageComparisonService.GetSupplierPackagesList(this.packageId).subscribe((data) => {
      if (data) {
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
          if (data) {
            this.groupingBoqGroupList = data;
            //console.log(this.groupingBoqGroupList);
             
          }
        });
      }
  }

  getTechCondReplies()
  {
     this.packageComparisonService.getTechCondReplies( this.packageId).subscribe(data=>{
        this.techConditionsReplies = data;
        //console.log(this.techConditionsReplies);
     });
  }

  getComCondReplies()
  {
     this.packageComparisonService.getComCondReplies( this.packageId).subscribe(data=>{
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
    if(!this.byBoq && !this.byGroup)
    {
      let ressourceItems : ressourceItem[] = [];

      this.comparisonList.forEach((boq : GroupingBoq, i : any)=>{
        boq.groupingResources.forEach(resource=>{
            if(resource.isChecked)
            {
              ressourceItems.push({resId : resource.boqSeq});
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

      this.comparisonList.forEach((boq : GroupingBoq, i : any)=>{
       
            if(boq.isChecked)
            {
              boqItems.push({boqItemID : boq.itemO});
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
        let assignSuppliertBoq: AssignSuppliertBoq = {supplierPercentList : this.supplierPercent, supplierBoqItemList : boqItems};
        this.isAssigningSupplierList = true;
        this.packageComparisonService.AssignSupplierListBoqList(this.packageId, true, assignSuppliertBoq).subscribe((data) => {
          this.isAssigningSupplierList = false;
          if (data) {
            this.supplierPercent = [];
            this.toastr.success("Assigned Successfully");
            $("#assignPackageModal").modal('hide');
            
            let checkAll = document.getElementById("selectAllBoqItems") as HTMLInputElement;
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

  openSendEmailModal()
  {
    this.topManagementAttachement = null;
    //this.emailTemplate = "";
    this.getEmailTemplate();
    this.selectedTopManagementList = [];
    this.getManagementEmail();

    $("#modalEmail").modal('show');
  }

  getEmailTemplate()
  {
      this.packageSupplierService.GetEmailTemplate('0').subscribe(data=>{
        this.emailTemplate = data?.etContent;
        
      });
  }

  getManagementEmail()
  {
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
      this.generatingFile = true;
      if(!this.byGroup)
      {
        if(!this.byBoq)
        {
            this.packageComparisonService.getComparisonSheet_Excel(this.packageId, this.SearchInput).subscribe(data=>{
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
            this.packageComparisonService.GetComparisonSheetByBoq_Excel(this.packageId, this.SearchInput).subscribe(data=>{
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
      else
      {
        if(!this.byBoq)
        {
            this.packageComparisonService.getComparisonSheetResourcesByGroup_Excel(this.packageId, this.SearchInput).subscribe(data=>{
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
          this.packageComparisonService.getComparisonSheetBoqByGroup_Excel(this.packageId, this.SearchInput).subscribe(data=>{
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

  sendEmail()
  {
      if(this.selectedTopManagementList.length == 0 || this.topManagementAttachement == null || this.emailTemplate == "")
      {
          this.toastr.error('Fields are required', '');
          return;
      }

      this.sendingEmail = true;
      let topManagementTemplate : TopManagementTemplate = { packageId : this.packageId, topManagements : this.selectedTopManagementList, template : this.emailTemplate};
    
      this.packageComparisonService.sendCompToManagement(topManagementTemplate, this.topManagementAttachement).subscribe(data=>{
        this.sendingEmail = false;
          if(data)
          {
            this.toastr.success('Email sent successfully', '');
            this.CloseSendEmailModal();
          }
      });
  }

  onFileSelect(event : any)
  {
    if (event.target.files.length > 0) {

      const file = event.target.files[0];
      this.topManagementAttachement = file;
    }
    else
    {
      this.topManagementAttachement = null;
    }
  }

  saveByQty()
  {
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
            totalQty += sup.assignedQty;
            this.supplierResourceQty.push({supID : sup.supplierId, qty : sup.assignedQty});
          });
          
          //alert(totalPerc);
          if(totalQty != resource.qty)
          { 
              qtyIsValid = false;
              resource.validPerc = false;
              
          }
       
          
          const newSupplierResource : SupplierResrouces = {
            resourceID : resourceId,
            supplierPercents : [],
            supplierQtys : this.supplierResourceQty

          };
          this.supplierResrouces.push(newSupplierResource);
        }
         
        });
      
    });

    if(oneResourceChecked)
    {
    if (!qtyIsValid) 
    {
        this.toastr.error("Invalid total quantities");
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
      this.comparisonList.forEach((boq : GroupingBoq, i : any)=>{
    
          
          if(boq.isChecked)
          {
            oneItemChecked = true;
          let itemO = boq.itemO;
          let totalQty = 0;
          let sups = boq.groupingPackageSuppliersPrices;
          boq.validPerc = true;
          this.supplierBoqQty = [];
          sups.forEach((sup, j)=>{
            totalQty += sup.assignedQty;
            this.supplierBoqQty.push({supID : sup.supplierId, qty : sup.assignedQty});
          });
          
          //alert(totalPerc);
          if(totalQty != boq.qty)
          { 
              qtyIsValid = false;
              boq.validPerc = false;
              
          }
       
          
          const newSupplierBoq : SupplierBOQ = {
            boqItemID : itemO,
            supplierPercents : [],
            supplierQtys : this.supplierBoqQty

          };
          this.supplierBoq.push(newSupplierBoq);
        }
         
        
      
    });
    if(oneItemChecked)
    {
    if (!qtyIsValid) 
    {
        this.toastr.error("Invalid total quantities");
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
        let checkAll = document.getElementById("selectAllBoqItems") as HTMLInputElement;
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
                this.toastr.error("Invalid total quantities");
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
            supplierQtys : []

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
            supplierQtys : []

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
        let checkAll = document.getElementById("selectAllBoqItems") as HTMLInputElement;
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
    this.comparisonList.forEach((boq : GroupingBoq,i : number)=>{
          
              if(boq.itemO === item.itemO)
              {
                this.searchSupQtyByBoq(Number(element.value), item, sup);
                  return;
              }
         
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
    this.searching = true;
      if(!this.byBoq)
      {
      this.packageComparisonService.getComparisonSheet(this.packageId, this.SearchInput).subscribe(data=>{
        this.searching = false; 
        if(data)
        {
            this.comparisonList = data;
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
            this.comparisonList = data;
            this.getSuppliersPrice();
        }
      });
    }
  }

  selectAllBoqItems(target:any)
  {
     this.selectedBoqItems = [];
      let checkbox = target as HTMLInputElement;
      this.comparisonList.forEach(item=>{
        item.isChecked = checkbox.checked;
        if(checkbox.checked)
          {
              this.selectedBoqItems.push(item.itemO);
          }
          else
          {
              let index = this.selectedBoqItems.indexOf(item.itemO);
              this.selectedBoqItems.splice(index,1);
          }
      });
  }

  getSuppliersPrice()
  {
    this.packageComparisonService.GetPackageSuppliersPrice(this.packageId, this.SearchInput).subscribe((data) => {
        if(data)
        {
            this.packageSuppliersPrices = data;
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

  GetBOQDivList() {
    this.assignPackageService.GetBOQDivList().subscribe((data) => {
      if (data) {
        this.BOQDivList = data;
        
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

  GetRESTypeList() {
    this.assignPackageService.GetRESTypeList().subscribe((data) => {
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

  selectBoq(event : any, item : GroupingBoq)
  {
    let allCheckbox = document.getElementById('selectAllBoqItems') as HTMLInputElement;
    let checkbox = event.target as HTMLInputElement;
    item.isChecked = checkbox.checked;
    let allChecked : boolean = true;
    

    
    if(checkbox.checked)
    {
        this.selectedBoqItems.push(item.itemO);
    }
    else
    {
        let index = this.selectedBoqItems.indexOf(item.itemO);
        this.selectedBoqItems.splice(index,1);
    }

    let everythingChecked : boolean = true;
    this.comparisonList.forEach(item=>{
     
        if(!item.isChecked)
        {
          everythingChecked = false;
          return;
        }
     
    });

    allCheckbox.checked = everythingChecked;
    
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

}
