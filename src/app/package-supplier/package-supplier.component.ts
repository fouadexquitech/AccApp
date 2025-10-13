import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SupplierInput, SupplierList, SupplierPackagesList, SupplierPackagesRevList, CurrencyList, ExchangeRate, RevisionFieldsList, RevisionDetailsList, SupplierInputList, Condition, AssignPackageTemplate } from './package-supplier.model';
import { PackageSupplierService } from './package-supplier.service';
import { environment } from '../../environments/environment';
import { ProjectCurrency,Project } from '../login/login.model';
import { EmailTemplate, FieldType, Language } from '../_models';
import { ConfirmationDialogService } from '../_components/confirmation-dialog/confirmation-dialog.service';
import { OriginalBoqModel } from '../assign-package/assign-package.model';
import { Group, TblComCond, TechConditions, TopManagementAttachement,ConditionsReply} from '../package-comparison/package-comparison.model';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { ComparisonPackageGroup } from '../package-groups/package-groups.model';
import { PackageGroupsService } from '../package-groups/package-groups.service';
import { LoginService } from '../login/login.service';
// AH052024
import { User } from '../_models';
// AH052024

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
  checkedSuppliers: Array<number> = [];
  SupplierInput: SupplierInput[] = [];
  SupplierPackagesList: SupplierPackagesList[] = [];
  SupplierPackagesRevList: SupplierPackagesRevList[] = [];
  RevisionDetailsList: RevisionDetailsList[] = [];
  RevisionDetailsBoqItems : OriginalBoqModel[] = [];
  SupplierInputList : SupplierInputList[] = [];
  CurrencyList : CurrencyList[] = [];
  projectCurrency : ProjectCurrency;
  project:Project;
  expandedDetail: boolean = false;
  currentRowIndex: number = -1;
  currentRevRowIndex : number = -1;
  rowindex: number = -1;
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
  selectedPackageSupplierRevision : SupplierPackagesRevList;
  exchangeRate : number = 1;
  discount : number = 0;
  exchangeRates : ExchangeRate[];
  selectedLanguage : string = '';
  selectedEmailTemplate : EmailTemplate | null;
  lstEmailTemplate : EmailTemplate[] = [];
  lstLanguages : string[] = [];
  isUpdatingTechnicalConditions : boolean = false;
  formEmailTemplate: FormGroup = new FormGroup({
    language: new FormControl(''),
    template: new FormControl(''),
    revisionExpDate: new FormControl('')
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
  conditionsReplyList: ConditionsReply[] = [];
  techConditions : TechConditions[] = [];
  acceptanceComments : any[] = [];
  isUpdatingCommercialConditions : boolean = false;
  listCC : string[] = [];
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
//AH052024
public user : User;
//AH052024

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
    //AH052024
    this.loginService.user.subscribe(x => this.user = x); 
    //AH052024
  }


  // onKey(event : any) {
  //   this.ccList.push (event.target.value);
  // }

 
  getGroups()
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
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
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

    this.confirmationDialogService.confirm('Please confirm', 'Do you really want to delete this field ?')
    .then((confirmed) => {
      if(confirmed)
        {
          this.packageSupplierService.DeleteField(Number(fieldId),CostConn).subscribe(data=>{
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
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

      this.isSendingTechConditions = true;
      this.packageSupplierService.sendTechnicalConditions(Number(this.PackageId), null, this.loginService.userValue?.usrId,CostConn).subscribe(data=>{
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
    this.listCC=null;
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
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

    this.packageSupplierService.GetFields(Number(revisionId),CostConn).subscribe(data=>{
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
      
      localStorage.setItem('assignByBoqOnly', '1');

      // if(localStorage.getItem('assignByBoqOnly') == null)
      // {
      //   //AH022025
      //   // localStorage.setItem('assignByBoqOnly', '0');
      //   localStorage.setItem('assignByBoqOnly', '1');
      //   ///AH022025
      // }
   
      if (this.PackageId != null && this.PackageId != 0) {
        this.GetPackageById(Number(this.PackageId));
      }

      //AH30012023
      // this.GetSupplierList(Number(this.PackageId));
      this.GetSupplierList_NotAssignetPackage(Number(this.PackageId));
      //AH30012023
      this.GetSupplierPackagesList();
      this.assignByBoqOnly = localStorage.getItem('assignByBoqOnly');
      this.projectCurrency = JSON.parse(localStorage.getItem("currency")) as ProjectCurrency;
      this.project = JSON.parse(localStorage.getItem("project")) as Project;
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
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

    this.packageSupplierService.GetPackageById(IdPkge).subscribe((data) => {
      if (data) {
        this.PackageName = data.packageName;
        this.FilePath = data.filePath;
      }
    });
  }

  GetCurrencyList()
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

    this.packageSupplierService.GetCurrencies().subscribe((data) => {
      if (data) {
        this.CurrencyList = data;
        let projectCurrency = JSON.parse(localStorage.getItem("currency")) as ProjectCurrency;
        this.selectedCurrencyId = projectCurrency.curId;
      }
    });
  }

  GetSupplierList(IdPkge: number) {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

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

  OpenEmailTemplateModal(supId: number,psId :number,packageSupplier : SupplierPackagesList,index:number) 
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

//AH052024
//  this.lstLanguages = Language.languages;
    this.GetEmailTemplateLanguageList();
    let costDB=this.user.usrLoggedCostDB;
    this.packageSupplierService.GetDefaultProjectEmailTemplate(costDB).subscribe((data) => {
    this.selectedEmailTemplate = data;
    this.formEmailTemplate.controls['language'].setValue(this.selectedEmailTemplate?.etLang);
    this.formEmailTemplate.controls['template'].setValue(this.selectedEmailTemplate?.etContent || '');
  
    // var expdate = document.getElementById("revisionExpDate") as HTMLInputElement;
    // expdate.value = new Date().toISOString().substring(0, 10);
  });
//AH052024

    this.topManagementAttachements = [];
    this.SupplierInputList = [];
    this.listCC = [];
    this.formEmailTemplate = this.formBuilder.group(
      {
        language: ['', Validators.required],
        template: ['', Validators.required],
        listCC :[[],[]],
        revisionExpDate: ['', [Validators.required]]
      }
    );
    this.getComConditions(psId);
//AH24012024
    this.GetTechnicalConditionsByPackage(psId);
    if (supId>0)
    {
      this.selectedSuppliers = [];
      this.selectedSuppliers.push(supId);
    }
    this.selectedPsId = psId;
    this.selectedPackageSupplier = packageSupplier;
    this.rowindex=index;

//AH24012024
    $("#emailTemplateModal").modal('show');
  }

  get f(): { [key: string]: AbstractControl } 
  {
    return this.formEmailTemplate.controls;
  }

  CloseEmailTemplateModal()
  {
    $("#emailTemplateModal").modal('hide');
    this.selectedEmailTemplate = null;
  }

  onEmailTemplateSubmit(){
    this.formEmailSubmitted = true;
    
    // var dte = document.getElementById("revisionExpDate") as HTMLInputElement;
    // console.log(dte.value)

    if (this.formEmailTemplate.invalid) {
      // console.log(this.formEmailTemplate)  (to know the validations)
      return;
    }
    else
    {
      // let ccList=this.ccList;
      this.AssignSuppliers();
    //AH18022024
      this.Toggle( this.selectedPackageSupplier, this.rowindex) ;
      // this.SupplierPackagesRevList = [];
      // this.GetSupplierPackagesRevision(this.selectedPsId);
    //AH18022024
    }
  }

  onLanguageChange(event : any)
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    let revExpiryDate = this.f.revisionExpDate.value;

    console.log(this.f.revisionExpDate.value);

      let select = event.target as HTMLInputElement;
      let lang = select.value;
      this.formEmailTemplate.controls['template'].setValue('');
      this.packageSupplierService.GetEmailTemplate(lang,this.PackageId,this.user.usrLoggedProjectName ,revExpiryDate).subscribe((data) => {
      this.selectedEmailTemplate = data[0];
      this.formEmailTemplate.controls['template'].setValue(this.selectedEmailTemplate?.etContent || '');
      });
  }

//AH30012024
  GetEmailTemplateLanguageList() {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    this.lstLanguages=[];
    this.packageSupplierService.GetEmailTemplate("",this.PackageId,this.user.usrLoggedProjectName,"").subscribe((data) => {
      if (data) {
        this.lstEmailTemplate = data;
        this.lstEmailTemplate.forEach(element => {
          this.lstLanguages.push(element.etLang);
          // console.log(element.etLang);
        });
      }
    });
  }
//AH30012024

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

  GetSupplierPackagesList() {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

    this.packageSupplierService.GetSupplierPackagesList(this.PackageId,CostConn).subscribe((data) => {
      if (data) {
        this.SupplierPackagesList = data;
        this.selectedSuppliers = [];
//AH30012024
        // this.SupplierPackagesList.forEach(element => {
        //   this.selectedSuppliers.push(element.psSuppId);
        // });
//AH30012024
      }
    });
  }

  AssignSuppliers() {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

    //this.spinner.show();
    this.isAssigning = true;
    this.SupplierInput = [];
    this.SupplierInputList= [];
    
    if (this.selectedSuppliers.length > 0) 
    {
      this.SupplierInput = [];
      this.selectedSuppliers.forEach(element => {
        this.SupplierInput.push({ supID: element });
      });

      let comCondList : Condition[] = [];
      this.comConditions.forEach(c=>{
          if(c.checked)
          {
            comCondList.push({ id : c.cmSeq, description : c.cmDescription , ACCCondValue:c.cmAccCondValue });
          }
      });

      //AH24012024
      let techCondList : Condition[] = [];
      this.techConditions.forEach(c=>{
          if(c.checked)
          {
            techCondList.push({ id : c.tcSeq, description : c.tcDescription , ACCCondValue:c.tcAccCondValue });
          }
      });
      //AH24012024
      this.SupplierInput.forEach(supplier=>{
        this.SupplierInputList.push({supplierInput : supplier, comercialCondList : comCondList, emailTemplate : null, filePath : this.FilePath , technicalCondList:techCondList});
      });

      if (this.SupplierInputList.length > 0) {
        this.SupplierInputList.forEach(sup=>{
          sup.emailTemplate = this.f.template.value;
        });

        // console.log(this.listCC);

        let assignPackageTemplate : AssignPackageTemplate = {
          byBoq : Number(localStorage.getItem('assignByBoqOnly')),
          listAttach : [],
          listCC : [],
          packId : this.PackageId,
          supInputList : this.SupplierInputList,
          userName : this.loginService.userValue?.usrId,
          revisionExpiryDate : this.f.revisionExpDate.value,
        };

        let files : File[] = [];
        this.topManagementAttachements.forEach(attachement=>{
          files.push(attachement.file);
        });

        this.packageSupplierService.AssignPackageSuppliers(assignPackageTemplate, files,CostConn).subscribe((data) => {
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

  getComConditions(packSupId :number)
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

      this.packageSupplierService.getComConditions(packSupId,CostConn).subscribe(data=>{
          this.comConditions = data;
          // console.log(this.comConditions);
      });
  }

  GetSupplierPackagesRevision(packageSupplierId: number) {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    this.packageSupplierService.GetSupplierPackagesRevision(packageSupplierId,CostConn).subscribe((data) => {
      if (data) {
        this.SupplierPackagesRevList = data;
      }
    });
  }

  Toggle(data: SupplierPackagesList, index: number) {
    if (this.currentRowIndex == index) {
      this.currentRowIndex = -1;
    } 
    else 
    {
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
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

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
          this.packageSupplierService.AddRevision(this.selectedPsId, date.value, this.selectedFile, this.selectedCurrencyId, this.exchangeRate,Number(discount.value),Number(addedItem),CostConn).subscribe((data) => {
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
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
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
    
    this.packageSupplierService.validateExcelBeforeAssign(this.PackageId, Number(localStorage.getItem('assignByBoqOnly')),CostConn).subscribe((data) => {
      this.isValidatingExcel = false;
      if (data) {
        // this.spinner.hide();
        
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
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

    var inputCommercialCondFile = document.getElementById("inputCommercialCondFile") as HTMLInputElement;
    if(!inputCommercialCondFile.value)
    {
      this.toastr.error('Please select a file');
      return;
    }

    this.isUpdatingCommercialConditions = true;
    //AH18012024
    // this.packageSupplierService.updateCommercialConditions(this.selectedPackageSupplier?.psId, this.selectedCommercialCondFile).subscribe(data=>{
    //AH18012024 
    this.packageSupplierService.updateCommercialConditions(this.selectedPackageSupplierRevision?.prRevId, this.selectedCommercialCondFile,CostConn).subscribe(data=>{
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
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

    var inputTechnicalCondFile = document.getElementById("inputTechnicalCondFile") as HTMLInputElement;
    if(!inputTechnicalCondFile.value)
    {
      this.toastr.error('Please select a file');
      
      return;
    }

    this.isUpdatingTechnicalConditions = true;
    this.packageSupplierService.updateTechnicalConditions(this.PackageId, this.selectedPackageSupplierRevision?.prRevId, this.selectedTechnicalCondFile,CostConn).subscribe(data=>{
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
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

    var labelInput = document.getElementById("labelInput") as HTMLInputElement;
    var valueInput = document.getElementById("valueInput") as HTMLInputElement;
    var valueType = document.getElementById("valueType") as HTMLSelectElement;

    if (labelInput.value && valueInput.value && valueType.selectedIndex > 0) {
      this.packageSupplierService.AddField(this.selectedRevisionId, labelInput.value, Number(valueInput.value), Number(valueType.value),CostConn).subscribe((data) => {
        this.SupplierPackagesRevList.find(x => x.prRevId == this.selectedRevisionId).prTotPrice = data;
        this.CloseFieldModal();
        this.toastr.success("A new field has been added !")
      });
    } else {
      this.toastr.error("Please Fill All Fields !")
    }

  }

  onCompare() {
    this.router.navigate(['package-comparison-novo'], { state: { packageId: this.PackageId, packageName : this.PackageName, byBoq : (this.SupplierPackagesList[0]?.psByBoq == 1) , packSuppId : this.SupplierPackagesList[0].psId} });
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
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

      this.packageSupplierService.GetRevisionDetails(prRevId, '', '',CostConn).subscribe(data=>{
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
               scopeO : 0,
               unitO : '',
               unitRateO : 0,
               assignedPackage:'',
               scopeQtyO : 0,
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
               c4:'',
               boqRefNumber:'',comment:''
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
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

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

  //AH24012024
  updateComAccCondValue(event : any, index : number)
  {
      let value = event.target.value;
      this.comConditions[index].cmAccCondValue = value;
  }

  updateTechAccCondValue(event : any, index : number)
  {
      let value = event.target.value;
      this.techConditions[index].tcAccCondValue = value;
  }

  GetTechnicalConditions()
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

      this.packageSupplierService.getTechConditions(this.PackageId,CostConn).subscribe(data=>{
          if(data)
          {
            this.techConditions = data;
            // console.log(this.techConditions);
            // $("#viewTechnicalConditionsModal").modal('show');
          }
      });
    }

    selectTechCond(event : any, index : number)
    {
        let chk = event.target as HTMLInputElement;
        let chkAll = document.getElementById("chkAllTecCond") as HTMLInputElement;
        let tecCond = this.techConditions[index];
        tecCond.checked = chk.checked;
  
        let allChecked : boolean = true;
  
        this.techConditions.forEach(c=>{
          if(!c.checked)
          {
            allChecked = false;
            return;
          }
      });
      chkAll.checked = allChecked;
    }

    checkAllTechCond(event : any)
    {
        let chk = event.target as HTMLInputElement;
        this.comConditions.forEach(c=>{
            c.checked = chk.checked;
        });
    }

    openComCondReplyListModal(revisionId : any, prRevNo : any, psSupName : any)
    {
      $('#comCondReplyListModal').modal('show');
        this.selectedSupplierName = psSupName;
        this.selectedRevisionNb = prRevNo;
        this.getComCondReplyByRevision(revisionId); 
    }

    getComCondReplyByRevision(revisionId : any)
    {
      let CostConn=this.user.usrLoggedConnString;
      this.loginService.CheckConnection(CostConn).subscribe((data) => { });

      this.packageSupplierService.GetComCondReplyByRevision(Number(revisionId),CostConn).subscribe(data=>{
        this.conditionsReplyList = data;
      });
    }

    openTechCondReplyListModal(revisionId : any, prRevNo : any, psSupName : any)
    {
      $('#techCondReplyListModal').modal('show');
        this.selectedSupplierName = psSupName;
        this.selectedRevisionNb = prRevNo;
        this.getTechCondReplyByRevision(revisionId); 
    }

    getTechCondReplyByRevision(revisionId : any)
    {
      let CostConn=this.user.usrLoggedConnString;
      this.loginService.CheckConnection(CostConn).subscribe((data) => { });

      this.packageSupplierService.GetTechCondReplyByRevision(Number(revisionId),CostConn).subscribe(data=>{
        this.conditionsReplyList = data;
      });
    }

    GetTechnicalConditionsByPackage(revisionId :number)
    {
      let CostConn=this.user.usrLoggedConnString;
      this.loginService.CheckConnection(CostConn).subscribe((data) => { });

        this.packageSupplierService.getTechConditionsByPackage(this.PackageId,revisionId,CostConn).subscribe(data=>{
            if(data)
            {
              this.techConditions = data;
              // console.log(this.techConditions);
              // $("#viewTechnicalConditionsModal").modal('show');
            }
        });
      }

    GetSupplierList_NotAssignetPackage(IdPkge: number) {
      let CostConn=this.user.usrLoggedConnString;
      this.loginService.CheckConnection(CostConn).subscribe((data) => { });

      this.packageSupplierService.GetSupplierList_NotAssignetPackage(IdPkge,CostConn).subscribe((data) => {
        if (data) {
          this.SupplierList = data;
        }
      });
    }

    filterSuppliers(event: KeyboardEvent) { 
      const txt = event.target as HTMLInputElement;
      
      let result: SupplierList[] = [];
      for(let a of this.SupplierList){
        if(a.supName.toLowerCase().indexOf(txt.value.toLowerCase()) > -1){
          result.push(a)
        }
      }
      if (txt.value.toLowerCase()=="")
      {
        this.GetSupplierList_NotAssignetPackage(this.PackageId);
      }
      else
        this.SupplierList = result;
    }
//AH24012024

openAcceptanceCommentsModal(revisionId : any, prRevNo : any, psSupName : any)
{
  $('#acceptanceCommentsModal').modal('show');
    this.selectedSupplierName = psSupName;
    this.selectedRevisionNb = prRevNo;
    this.getAcceptanceComment(revisionId); 
}

  getAcceptanceComment(revId : any)
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    
      this.packageSupplierService.getRevisionAcceptance(revId,CostConn).subscribe(data=>{
        if(data)
        {
            this.acceptanceComments = data;
        }
      });
  }

  closeAcceptanceComments()
  {
    $('#acceptanceCommentsModal').modal('hide');
    this.acceptanceComments = [];
  }
}


export function validateTypeDate(control: AbstractControl) {
  const value = control.value;
  //min date 01/01/1850 and max date today
  if (value == null || value == '' || value <= '2000-01-01') {
    return { required: true };
  } else {
    return null;
  }
}
