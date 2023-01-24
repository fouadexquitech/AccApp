import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SupplierInput, SupplierList, SupplierPackagesList, SupplierPackagesRevList, CurrencyList, ExchangeRate, RevisionFieldsList, RevisionDetailsList, SupplierInputList, ComercialCond, AssignPackageTemplate } from './package-supplier.model';
import { PackageSupplierService } from './package-supplier.service';
import { environment } from '../../environments/environment';
import { ProjectCurrency } from '../login/login.model';
import { EmailTemplate, FieldType, Language } from '../_models';
import { ConfirmationDialogService } from '../_components/confirmation-dialog/confirmation-dialog.service';
import { OriginalBoqModel } from '../assign-package/assign-package.model';
import { Group, TblComCond, TechConditions, TopManagementAttachement } from '../package-comparison/package-comparison.model';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { ComparisonPackageGroup } from '../package-groups/package-groups.model';
import { PackageGroupsService } from '../package-groups/package-groups.service';
import { LoginService } from '../login/login.service';

declare var $: any;
@Component({
  selector: 'app-package-supplier',
  templateUrl: './package-supplier.component.html',
  styleUrls: ['./package-supplier.component.css']
})
export class PackageSupplierComponent implements OnInit, OnDestroy {
  params : any;
  PackageId: number = 0;
  PackageName = "";
  FilePath = "";
  SupplierList: SupplierList[] = [];
  selectedSuppliers: Array<number> = [];
  SupplierInput: SupplierInput[] = [];
  SupplierPackagesList: SupplierPackagesList[] = [];
  SupplierPackagesRevList: SupplierPackagesRevList[] = [];
  RevisionDetailsList: RevisionDetailsList[] = [];
  RevisionDetailsBoqItems : OriginalBoqModel[] = [];
  SupplierInputList : SupplierInputList[] = [];
  CurrencyList : CurrencyList[] = [];
  projectCurrency : ProjectCurrency;
  expandedDetail: boolean = false;
  currentRowIndex: number = -1;
  currentRevRowIndex : number = -1;
  selectedFile: File = null;
  selectedTechnicalCondFile : File = null;
  selectedCommercialCondFile : File = null;
  selectedPsId: number = 0;
  selectedRevisionId: number = 0;
  selectedCurrencyId : number = 0;
  public isAssigning : boolean = false;
  public addingRevision : boolean = false;
  public isValidatingExcel : boolean = false;
  selectedPackageSupplier : SupplierPackagesList;
  exchangeRate : number = 1;
  discount : number = 0;
  exchangeRates : ExchangeRate[];
  selectedLanguage : string = '';
  selectedEmailTemplate : EmailTemplate | null;
  lstLanguages : string[] = [];
  isUpdatingTechnicalConditions : boolean = false;
  formEmailTemplate: FormGroup = new FormGroup({
    language: new FormControl(''),
    template: new FormControl(''),
    
  });
  addedTechConditions : TechConditions[] = [];
  groups : ComparisonPackageGroup[] = [];

  formEmailSubmitted = false;
  assignByBoqOnly : string;
  fieldTypes : any[] = [{id : FieldType.AMOUNT_TYPE_ID, name : FieldType.AMOUNT_TYPE_NAME}, 
    {id : FieldType.PERCENTAGE_TYPE_ID, name : FieldType.PERCENTAGE_TYPE_NAME}];
  selectedSupplierName : any = null;
  selectedRevisionNb : any = null;
  revisionFieldsList : RevisionFieldsList[] = [];
  isSendingTechConditions : boolean = false;
  comConditions : TblComCond[] = [];
  techConditions : TechConditions[] = [];
  isUpdatingCommercialConditions : boolean = false;
  dtOptions = {
    //pagingType: 'full_numbers',
    //pageLength: 10,
    responsive : true,
    paging : false,
    info : false,
    searching : true,
    destroy : true,
    sorting : false
  };

  editorConfig: AngularEditorConfig = {
    editable: true,
      spellcheck: true,
      height: 'auto',
      minHeight: '0',
      maxHeight: 'auto',
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

topManagementAttachements : TopManagementAttachement[] = [];
maxAttachements : number = 5;

  constructor(private router: Router, 
    private packageSupplierService: PackageSupplierService, 
    private spinner: NgxSpinnerService, 
    private toastr: ToastrService,
    private formBuilder : FormBuilder,
    private route: ActivatedRoute,
    private confirmationDialogService: ConfirmationDialogService,
    private packageGroupsService : PackageGroupsService,
    private loginService : LoginService) {
    /*if (this.router.getCurrentNavigation().extras.state != undefined) {
      this.PackageId = this.router.getCurrentNavigation().extras.state.packageId;
    } else {
      this.router.navigateByUrl("/package-list");
    }*/
  }

  getGroups()
  {
    
    this.packageGroupsService.getGroups(this.PackageId).subscribe((data) => {
        if(data)
        {
            this.groups = data;
        }
    });
  }

  onGroupChange(event : any)
  {

  }

  checkAllComCond(event : any)
  {
      let chk = event.target as HTMLInputElement;
      this.comConditions.forEach(c=>{
          c.checked = chk.checked;
      });
  }

  selectComCond(event : any, index : number)
  {
      let chk = event.target as HTMLInputElement;
      let chkAll = document.getElementById("chkAllComCond") as HTMLInputElement;
      let comCond = this.comConditions[index];
      comCond.checked = chk.checked;

      let allChecked : boolean = true;

      this.comConditions.forEach(c=>{
        if(!c.checked)
        {
          allChecked = false;
          return;
        }
    });
    chkAll.checked = allChecked;
  }

  deleteField(fieldId : any, revisionId : any)
  {
    this.confirmationDialogService.confirm('Please confirm', 'Do you really want to delete this field ?')
    .then((confirmed) => {
      if(confirmed)
        {
          this.packageSupplierService.DeleteField(Number(fieldId)).subscribe(data=>{
            if(data)
            {
              this.toastr.success('Deleted successfuly');
              this.getFields(revisionId);
            }
          });
        }
    });
  }

  sendTechnicalConditions()
  {
      this.isSendingTechConditions = true;
      this.packageSupplierService.sendTechnicalConditions(Number(this.PackageId), null, this.loginService.userValue?.usrId).subscribe(data=>{
        this.isSendingTechConditions = false;
          if(data)
          {
            this.toastr.success("Technical conditions sent successfully");
            $("#viewTechnicalConditionsModal").modal('hide');
            this.GetSupplierPackagesList();
          }
          else
          {
            this.toastr.error("Sending email failed");
          }
      });
  }

  getElementOfArray(arr : any[], val : any)
  {
    let result = arr.find(obj => {
      return obj.id === val
    });
    return result?.name;
  }

  CloseFieldsListModal()
  {
    $('#fieldsListModal').modal('hide');
    this.revisionFieldsList = [];
    this.selectedSupplierName = null;
    this.selectedRevisionNb = null;
  }

  openFieldsListModal(revisionId : any, prRevNo : any, psSupName : any)
  {
    $('#fieldsListModal').modal('show');
      this.selectedSupplierName = psSupName;
      this.selectedRevisionNb = prRevNo;
      this.getFields(revisionId); 
  }

  getFields(revisionId : any)
  {
    this.packageSupplierService.GetFields(Number(revisionId)).subscribe(data=>{
      this.revisionFieldsList = data;
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

  ngOnDestroy() {
    this.params.unsubscribe();
  }

  ngOnInit(): void {

    this.params = this.route.params.subscribe(params => {
      this.PackageId = Number(params['packageId']);
      if(localStorage.getItem('assignByBoqOnly') == null)
      {
        localStorage.setItem('assignByBoqOnly', '0');
      }
   

      if (this.PackageId != null && this.PackageId != 0) {
        this.GetPackageById(Number(this.PackageId));
      }

      this.GetSupplierList(Number(this.PackageId));

      this.GetSupplierPackagesList();
      this.assignByBoqOnly = localStorage.getItem('assignByBoqOnly');
      this.projectCurrency = JSON.parse(localStorage.getItem("currency")) as ProjectCurrency;
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

  GetPackageById(IdPkge: number) {
    this.packageSupplierService.GetPackageById(IdPkge).subscribe((data) => {
      if (data) {
        this.PackageName = data.packageName;
        this.FilePath = data.filePath;
     
      }
    });
  }

  GetCurrencyList()
  {
    this.packageSupplierService.GetCurrencies().subscribe((data) => {
      if (data) {
        this.CurrencyList = data;
        let projectCurrency = JSON.parse(localStorage.getItem("currency")) as ProjectCurrency;
        this.selectedCurrencyId = projectCurrency.curId;
      }
    });
  }

  GetSupplierList(IdPkge: number) {
    this.packageSupplierService.GetSupplierList(IdPkge).subscribe((data) => {
      if (data) {
        this.SupplierList = data;
      }
    });
    
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

  /*getEmailTemplate(language : string)
  {
    this.packageSupplierService.GetEmailTemplate(language).subscribe((data) => {
      if (data) {
          this.selectedEmailTemplate = data;
      }
    });
  }*/

  onAttachementSelect(event : any, index : number)
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

  removeAttachement(index : number)
  {
    this.topManagementAttachements.splice(index, 1);
  }

  addAttachement()
  {
      this.topManagementAttachements.push({id : 0, file : null});
  }

  OpenEmailTemplateModal() {
    this.lstLanguages = Language.languages;
    this.topManagementAttachements = [];
    this.SupplierInputList = [];
    this.formEmailTemplate = this.formBuilder.group(
      {
        language: ['', Validators.required],
        template: ['', Validators.required]
      }
      
    );
    this.getComConditions();
    $("#emailTemplateModal").modal('show');
  }

  get f(): { [key: string]: AbstractControl } {
    return this.formEmailTemplate.controls;
  }

  CloseEmailTemplateModal()
  {
    $("#emailTemplateModal").modal('hide');
    this.selectedEmailTemplate = null;
    
  }

  onEmailTemplateSubmit(){
    this.formEmailSubmitted = true;
    if (this.formEmailTemplate.invalid) {
      return;
    }
    else
    {
      this.AssignSuppliers();
    }

  }

  onLanguageChange(event : any)
  {
      let select = event.target as HTMLInputElement;
      let lang = select.value;
    
      this.formEmailTemplate.controls['template'].setValue('');
      this.packageSupplierService.GetEmailTemplate(lang).subscribe((data) => {
      this.selectedEmailTemplate = data;
      this.formEmailTemplate.controls['template'].setValue(this.selectedEmailTemplate?.etContent || '');
        
      });
  }

  viewTechnicalConditions()
  {
      /*this.packageSupplierService.getTechConditions(this.PackageId).subscribe(data=>{
          if(data)
          {
            this.techConditions = data;
            console.log(this.techConditions);
            $("#viewTechnicalConditionsModal").modal('show');
          }
         
      });*/

      this.router.navigate(['technical-conditions', this.PackageId, this.PackageName]);
      
  }

  closeViewTechnicalConditionsModal()
  {
     $("#viewTechnicalConditionsModal").modal('hide');
  }

  AssignSuppliers() {
    //this.spinner.show();
    this.isAssigning = true;
    if (this.selectedSuppliers.length > 0) {
      this.SupplierInput = [];
      this.selectedSuppliers.forEach(element => {
        this.SupplierInput.push({ supID: element });
      });

      let comercialCond : ComercialCond[] = [];
      this.comConditions.forEach(c=>{
          if(c.checked)
          {
            comercialCond.push({ id : c.cmSeq, description : c.cmDescription });
          }
      });

      this.SupplierInput.forEach(supplier=>{
        this.SupplierInputList.push({supplierInput : supplier, comercialCondList : comercialCond, emailTemplate : null, filePath : this.FilePath});
      });


      if (this.SupplierInputList.length > 0) {
        this.SupplierInputList.forEach(sup=>{
          sup.emailTemplate = this.f.template.value;
        });

        let assignPackageTemplate : AssignPackageTemplate = {
          byBoq : Number(localStorage.getItem('assignByBoqOnly')),
          listAttach : [],
          listCC : [],
          packId : this.PackageId,
          supInputList : this.SupplierInputList,
          userName : this.loginService.userValue?.usrId
        };

        let files : File[] = [];
        this.topManagementAttachements.forEach(attachement=>{
          files.push(attachement.file);
        });

        this.packageSupplierService.AssignPackageSuppliers(assignPackageTemplate, files).subscribe((data) => {
          this.isAssigning = false;
          if (data) {
            //this.spinner.hide();
            
            this.toastr.success("Supplier(s) assigned successfuly");
            this.GetSupplierPackagesList();
            this.CloseEmailTemplateModal();
          }
          else
          {
            this.toastr.error("An error occured");
          }
        });
      }

    } else {
      //this.spinner.hide();
      this.isAssigning = false;
      this.toastr.error('You Should Select at Least 1 Supplier !!')
    }
  }

  getComConditions()
  {
      this.packageSupplierService.getComConditions().subscribe(data=>{
          this.comConditions = data;
      });
  }

  GetSupplierPackagesList() {
    this.packageSupplierService.GetSupplierPackagesList(this.PackageId).subscribe((data) => {
      if (data) {
        this.SupplierPackagesList = data;
        this.selectedSuppliers = [];
        this.SupplierPackagesList.forEach(element => {
          this.selectedSuppliers.push(element.psSuppId);
        });
      }
    });
  }

  GetSupplierPackagesRevision(packageSupplierId: number) {
    this.packageSupplierService.GetSupplierPackagesRevision(packageSupplierId).subscribe((data) => {
      if (data) {
        this.SupplierPackagesRevList = data;
      }
    });
  }

  Toggle(data: SupplierPackagesList, index: number) {

    if (this.currentRowIndex == index) {
      this.currentRowIndex = -1;
    } else {
      this.currentRowIndex = index;
      this.SupplierPackagesRevList = [];
      this.GetSupplierPackagesRevision(data.psId);
    }
  }

  OpenModal(psId: number) {
    this.GetCurrencyList();
    this.selectedPsId = psId;
    var date = document.getElementById("revisionDate") as HTMLInputElement;
    date.value = new Date().toISOString().substring(0, 10);
    $("#addRevisionModal").modal('show')
  }

  CloseModal() {
    $("#addRevisionModal").modal('hide');
    var date = document.getElementById("revisionDate") as HTMLInputElement;
    date.value = new Date().toISOString().substring(0, 10);
    var file = document.getElementById("excelFile") as HTMLInputElement;
   
    //var exchangeRate = document.getElementById("exchangeRate") as HTMLInputElement;
    file.value = null;
  
    this.exchangeRate = 1;
    this.exchangeRates = [];
    this.selectedPsId = 0;
    let projectCurrency = JSON.parse(localStorage.getItem("currency")) as ProjectCurrency;
    this.selectedCurrencyId = projectCurrency.curId;
    this.selectedFile = null;
  }

  onFileSelect(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.selectedFile = file;
    }
  }

  AddRevision() {
    this.addingRevision = true;
    var date = document.getElementById("revisionDate") as HTMLInputElement;
    var discount = document.getElementById("discount") as HTMLInputElement;
    var checkAddedItem= document.getElementById("addedItems") as HTMLInputElement;
    //var exchangeRate = document.getElementById("exchangeRate") as HTMLInputElement;
    
    let addedItem: number = 0;

    if(checkAddedItem.type == 'checkbox'){
    if (checkAddedItem.checked)
    addedItem=1;
    }
  
    if (date.value) {
      if(this.selectedCurrencyId > 0)
      {
        if(this.exchangeRate)
        {
      if (this.selectedFile != null) 
        {
          this.addingRevision = true;
          this.packageSupplierService.AddRevision(this.selectedPsId, date.value, this.selectedFile, this.selectedCurrencyId, this.exchangeRate,Number(discount.value),Number(addedItem)).subscribe((data) => {
            if (data) {
              // Refresh Supplier Package Revision List
              this.addingRevision = false;
              this.GetSupplierPackagesRevision(this.selectedPsId);
              //this.GetRevisionDetails(this.selectedRevisionId);
              this.selectedPsId = 0;
              date.value = null;
              this.selectedFile = null;
              this.CloseModal();
              this.toastr.success("A new revision has been added !")
            }
          });
        } 
        else {
          this.toastr.error("Please Select A File !")
        }
      }
      else
      {
        this.toastr.error("Please Enter A Rate !")
      }
     
    }
    else
    {
      this.toastr.error("Please Select A Currency !")
    }
    } else {
      this.toastr.error("Please Select A Date !")
    }
  }

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
    
    this.packageSupplierService.validateExcelBeforeAssign(this.PackageId, Number(localStorage.getItem('assignByBoqOnly'))).subscribe((data) => {
      this.isValidatingExcel = false;
      if (data) {
        //this.spinner.hide();
        
        this.toastr.success("Validated !!")
        this.GetPackageById(Number(this.PackageId));

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

  

  OpenFieldModal(prRevId: number) {
    $("#addFieldModal").modal('show')
    this.selectedRevisionId = prRevId;
  }
  

  CloseFieldModal() {
    $("#addFieldModal").modal('hide');
    var labelInput = document.getElementById("labelInput") as HTMLInputElement;
    var valueInput = document.getElementById("valueInput") as HTMLInputElement;
    var valueType = document.getElementById("valueType") as HTMLSelectElement;
    labelInput.value = null;
    valueInput.value = null;
    valueType.selectedIndex = 0;
    this.selectedRevisionId = 0;

  }

  openUpdateCommercialCondModal(packageSupplier : SupplierPackagesList)
  {
    var inputCommercialCondFile = document.getElementById("inputCommercialCondFile") as HTMLInputElement;
    inputCommercialCondFile.value = null;
    this.selectedCommercialCondFile = null;
    this.selectedPackageSupplier = packageSupplier;
    $("#updateCommercialCondModal").modal('show');
  }

  openUpdateTechnicalCondModal(packageSupplier : SupplierPackagesList)
  {
    var inputTechnicalCondFile = document.getElementById("inputTechnicalCondFile") as HTMLInputElement;
    inputTechnicalCondFile.value = null;
    this.selectedTechnicalCondFile = null;
    this.selectedPackageSupplier = packageSupplier;
    $("#updateTechnicalCondModal").modal('show');
  }

  closeUpdateTechnicalCondModal() {
    $("#updateTechnicalCondModal").modal('hide');
  }

  closeUpdateCommercialCondModal()
  {
    $("#updateCommercialCondModal").modal('hide');
  }

  inputTechnicalCondFile_change(event : any)
  {
    var inputTechnicalCondFile = event.target as HTMLInputElement;
    var ext = inputTechnicalCondFile.value.split('.').pop().toLowerCase();
    if(ext !== 'xls' && ext !== 'xlsx') {
        this.toastr.error('Please upload excel file only');
        inputTechnicalCondFile.value = null;
        return;
    }

    if (event.target.files.length > 0) {

      const file = event.target.files[0];
      this.selectedTechnicalCondFile = file;
    }
  }

  inputCommercialCondFile_change(event : any)
  {
    var inputCommercialCondFile = event.target as HTMLInputElement;
    var ext = inputCommercialCondFile.value.split('.').pop().toLowerCase();
    if(ext !== 'xls' && ext !== 'xlsx') {
        this.toastr.error('Please upload excel file only');
        inputCommercialCondFile.value = null;
        return;
    }

    if (event.target.files.length > 0) {

      const file = event.target.files[0];
      this.selectedCommercialCondFile = file;
    }
  }

  updateCommercialConditions()
  {
    var inputCommercialCondFile = document.getElementById("inputCommercialCondFile") as HTMLInputElement;
    if(!inputCommercialCondFile.value)
    {
      this.toastr.error('Please select a file');
      
      return;
    }

    this.isUpdatingCommercialConditions = true;
    this.packageSupplierService.updateCommercialConditions(this.selectedPackageSupplier?.psId, this.selectedCommercialCondFile).subscribe(data=>{
      this.isUpdatingCommercialConditions = false;  
      if(data)
        {
            this.toastr.success("Commercial conditions updated successfully");
            this.closeUpdateCommercialCondModal();
        }
        else
        {
          this.toastr.error("Commercial conditions updated failed");    
        }
    });
  }

  updateTechnicalConditions()
  {
    var inputTechnicalCondFile = document.getElementById("inputTechnicalCondFile") as HTMLInputElement;
    if(!inputTechnicalCondFile.value)
    {
      this.toastr.error('Please select a file');
      
      return;
    }

    this.isUpdatingTechnicalConditions = true;
    this.packageSupplierService.updateTechnicalConditions(this.PackageId, this.selectedPackageSupplier?.psId, this.selectedTechnicalCondFile).subscribe(data=>{
      this.isUpdatingTechnicalConditions = false;  
      if(data)
        {
            this.toastr.success("Technical conditions updated successfully");
            this.closeUpdateTechnicalCondModal();
        }
        else
        {
          this.toastr.error("Technical conditions updated failed");    
        }
    });
  }

   AddField() {
    var labelInput = document.getElementById("labelInput") as HTMLInputElement;
    var valueInput = document.getElementById("valueInput") as HTMLInputElement;
    var valueType = document.getElementById("valueType") as HTMLSelectElement;

    if (labelInput.value && valueInput.value && valueType.selectedIndex > 0) {
      this.packageSupplierService.AddField(this.selectedRevisionId, labelInput.value, Number(valueInput.value), Number(valueType.value)).subscribe((data) => {
        this.SupplierPackagesRevList.find(x => x.prRevId == this.selectedRevisionId).prTotPrice = data;
        this.CloseFieldModal();
        this.toastr.success("A new field has been added !")
      });
    } else {
      this.toastr.error("Please Fill All Fields !")
    }

  }

  onCompare() {
    this.router.navigate(['package-comparison-novo'], { state: { packageId: this.PackageId, packageName : this.PackageName, byBoq : (this.SupplierPackagesList[0]?.psByBoq == 1) } });
  }

  validateExcel()
  {

  }

  ToggleRevDetails(prRevId : number, index : number)
  {
    if (this.currentRevRowIndex == index) {
      this.currentRevRowIndex = -1;
    } else {
      this.currentRevRowIndex = index;
      this.RevisionDetailsList = [];
      this.RevisionDetailsBoqItems = [];
      this.GetRevisionDetails(prRevId);
    }
  }

  GetRevisionDetails(prRevId : number)
  {
      this.packageSupplierService.GetRevisionDetails(prRevId, '', '').subscribe(data=>{
          if(data)
          {
            this.RevisionDetailsList = data;
            this.RevisionDetailsList.forEach(rev=>{
              let item : OriginalBoqModel = {
               sectionO : '',
               descriptionO : rev.rdBoqItemDescription,
               itemO : rev.rdBoqItem,
               qtyO : 0,
               rowNumber : 0,
               scope : 0,
               unitO : '',
               unitRate : 0,
               assignedPackage:'',
               scopeQtyO : 0,
               billQtyO:0
            };
            //const found = this.RevisionDetailsBoqItems.find(elem => elem.itemO === rev.rdBoqItem);
            //console.log(found);
            //if(found == undefined)
              this.RevisionDetailsBoqItems.push(item);
            }
            );
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
          
          
          }
      });
  }

  UpdateRevisionPrices(revId : number, tableId : string)
  {
      let table = document.getElementById(tableId) as HTMLTableElement;
      //console.log(table);
  }

  onCurrencyChange(val : any)
  {
    
    this.exchangeRates = [];
    this.exchangeRate = 1;
    if(val)
    {
        
        this.packageSupplierService.getExchangeRateV2(val.curCode, this.projectCurrency?.curCode).subscribe((data)=>{
            if(data)
            {
              /*this.exchangeRates = data.rates;

              let array = Object.values(this.exchangeRates);
              
              if(array.length == 2 && val.curCode == 'USD')
              {
                this.exchangeRate = Number((Number(array[0]) / Number(array[1])).toFixed(2));
              }
              else if(array.length == 2 && projectCurrency.curCode === val.curCode)
              {
                this.exchangeRate = 1;
              }
              else
              {
                  let usdToSelectedRate = Number(array[2]) / Number(array[0]);
                  let projectToUsd = Number(array[0]) / Number(array[1]);
                  
                  this.exchangeRate = Number((usdToSelectedRate * projectToUsd).toFixed(2));
                  
                   
              }*/
              //this.exchangeRate = data.value
              let d = data;
              
              //let rate = d[Object.keys(d)[0]];
              
              this.exchangeRate = d.result;
            }
            
            
        });
    }
   
  }

  routeToRevisionDetails(revisionId : number, psByBoq : number, psId : number){
    this.router.navigate(['/revision-details', revisionId, psId, psByBoq, this.PackageId, this.PackageName]);
  }

  onGrouping()
  {
    let byBoq = (this.SupplierPackagesList[0].psByBoq == 1);
    this.router.navigate(['/package-groups', this.PackageId, this.PackageName, byBoq]);
    
  }
}
