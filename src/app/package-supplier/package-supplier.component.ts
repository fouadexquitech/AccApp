import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SupplierInput, SupplierList, SupplierPackagesList, SupplierPackagesRevList, CurrencyList, ExchangeRate, RevisionFieldsList, RevisionDetailsList, SupplierInputList, Condition, AssignPackageTemplate } from './package-supplier.model';
import { PackageSupplierService } from './package-supplier.service';
import { environment } from '../../environments/environment';
import { ProjectCurrency,Project } from '../login/login.model';
import { EmailTemplate, FieldType, User } from '../_models';
import { ConfirmationDialogService } from '../_components/confirmation-dialog/confirmation-dialog.service';
import { OriginalBoqModel } from '../assign-package/assign-package.model';
import { TblComCond, TechConditions, TopManagementAttachement, ConditionsReply } from '../package-comparison/package-comparison.model';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { ComparisonPackageGroup } from '../package-groups/package-groups.model';
import { PackageGroupsService } from '../package-groups/package-groups.service';
import { LoginService } from '../login/login.service';
// AH052024
import { finalize } from 'rxjs/operators';
// AH052024

interface SelectedSupplierEmail {
  supplierId: number;
  supplierName: string;
  email: string;
}


export function emailListValidator(
  required: boolean = false
): ValidatorFn {

  return (
    control: AbstractControl
  ): ValidationErrors | null => {

    const rawValue: string =
      control.value == null
        ? ''
        : String(control.value).trim();

    if (!rawValue) {
      return required
        ? { required: true }
        : null;
    }

    const emailList: string[] =
      rawValue
        .split(/[;,\r\n]+/)
        .map((email: string) => email.trim())
        .filter((email: string) => email.length > 0);

    if (required && emailList.length === 0) {
      return { required: true };
    }

    const emailExpression =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const containsInvalidEmail =
      emailList.some(
        (email: string) =>
          !emailExpression.test(email)
      );

    return containsInvalidEmail
      ? { invalidEmailList: true }
      : null;
  };
}

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

  /*
   * Supplier group:
   * null = no group selected
   * 1 = With Portal Account
   * 0 = Without Portal Account
   */
  selectedPortalStatus: number | null = null;

  /*
   * Assignment option:
   * null = no option selected
   * 1 = By BOQ Item
   * 0 = By Resources
   */
  assignmentOption: number | null = null;
  assignOptionSubmitted: boolean = false;

  isRevisionMode: boolean = false;
  isLoadingSuppliers: boolean = false;
  isPreparingRfqAttachment: boolean = false;
  generatedRfqAttachment: string = '';
  generatedRfqAttachmentName: string = '';
  includeRfqAttachment: boolean = true;

  /* Complete supplier list displayed by the dropdown. */
  SupplierList: SupplierList[] = [];

  /* Unfiltered source list used by supplier search and reset. */
  AllSupplierList: SupplierList[] = [];

  selectedSuppliers: Array<number> = [];
  checkedSuppliers: Array<number> = [];
  SupplierInput: SupplierInput[] = [];
  SupplierPackagesList: SupplierPackagesList[] = [];
  SupplierPackagesRevList: SupplierPackagesRevList[] = [];
  RevisionDetailsList: RevisionDetailsList[] = [];
  RevisionDetailsBoqItems : OriginalBoqModel[] = [];
  SupplierInputList : SupplierInputList[] = [];
  CurrencyList : CurrencyList[] = [];
  projectCurrency : ProjectCurrency | null = null;
  project: Project | null = null;
  expandedDetail: boolean = false;
  currentRowIndex: number = -1;
  currentRevRowIndex : number = -1;
  rowindex: number = -1;
  selectedFile: File | null = null;
  selectedTechnicalCondFile : File | null = null;
  selectedCommercialCondFile : File | null = null;
  selectedPsId: number = 0;
  selectedRevisionId: number = 0;
  selectedCurrencyId : number = 0;
  public isAssigning : boolean = false;
  public addingRevision : boolean = false;
  public isValidatingExcel : boolean = false;
  selectedPackageSupplier : SupplierPackagesList | null = null;
  selectedPackageSupplierRevision : SupplierPackagesRevList | null = null;
  exchangeRate : number = 1;
  discount : number = 0;
  exchangeRates : ExchangeRate[] = [];
  selectedLanguage : string = '';
  selectedEmailTemplate : EmailTemplate | null;
  lstEmailTemplate : EmailTemplate[] = [];
  lstLanguages : string[] = [];
  isUpdatingTechnicalConditions : boolean = false;

  formEmailTemplate: FormGroup ;

  addedTechConditions : TechConditions[] = [];
  groups : ComparisonPackageGroup[] = [];
  formEmailSubmitted = false;
  
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

constructor(
  private router: Router,
  private packageSupplierService: PackageSupplierService,
  private spinner: NgxSpinnerService,
  private toastr: ToastrService,
  private formBuilder: FormBuilder,
  private route: ActivatedRoute,
  private confirmationDialogService: ConfirmationDialogService,
  private packageGroupsService: PackageGroupsService,
  private loginService: LoginService,
  private changeDetectorRef: ChangeDetectorRef
) {
  this.loginService.user.subscribe(
    x => this.user = x
  );

  this.formEmailTemplate =
    this.createEmailTemplateForm();
}



private createEmailTemplateForm(
  emailCc: string = '',
  requireEmailContent: boolean = true
): FormGroup {

  return this.formBuilder.group({
    /*
     * One FormGroup per selected supplier.
     */
    supplierEmails: this.formBuilder.array([]),

    /*
     * One shared CC field.
     */
    emailCc: [
      emailCc,
      [
        emailListValidator(false)
      ]
    ],

    language: [
      '',
      requireEmailContent ? Validators.required : []
    ],

    template: [
      '',
      requireEmailContent ? Validators.required : []
    ],

    revisionExpDate: [
      '',
      Validators.required
    ]
  });
}

private parseEmailList(
  value: string | null | undefined
): string[] {

  if (!value) {
    return [];
  }

  const result: string[] =
    String(value)
      .split(/[;,\r\n]+/)
      .map((email: string) =>
        email.trim()
      )
      .filter((email: string) =>
        email.length > 0
      );

  const uniqueEmails: string[] = [];

  result.forEach((email: string) => {

    const alreadyExists =
      uniqueEmails.some(
        (existingEmail: string) =>
          existingEmail.toLowerCase() ===
          email.toLowerCase()
      );

    if (!alreadyExists) {
      uniqueEmails.push(email);
    }
  });

  return uniqueEmails;
}

private joinEmailList(
  emailList: string[]
): string {

  if (!emailList || emailList.length === 0) {
    return '';
  }

  const uniqueEmails: string[] = [];

  emailList.forEach((email: string) => {

    if (!email || !email.trim()) {
      return;
    }

    const cleanedEmail =
      email.trim();

    const alreadyExists =
      uniqueEmails.some(
        (existingEmail: string) =>
          existingEmail.toLowerCase() ===
          cleanedEmail.toLowerCase()
      );

    if (!alreadyExists) {
      uniqueEmails.push(cleanedEmail);
    }
  });

  return uniqueEmails.join('; ');
}


private getSelectedSupplierEmails(): string[] {

  if (
    !this.selectedSuppliers ||
    this.selectedSuppliers.length === 0
  ) {
    return [];
  }

  /*
   * Always search the complete master list,
   * not the currently filtered dropdown list.
   */
  const sourceList: SupplierList[] =
    this.AllSupplierList &&
    this.AllSupplierList.length > 0
      ? this.AllSupplierList
      : this.SupplierList;

  const selectedEmails: string[] = [];

  this.selectedSuppliers.forEach(
    (supplierId: number) => {

      const supplierRecord:
        SupplierList | undefined =
        sourceList.find(
          (supplier: SupplierList) =>
            Number(supplier.supID) ===
            Number(supplierId)
        );

      if (!supplierRecord) {

        console.warn(
          'Selected supplier was not found:',
          supplierId
        );

        return;
      }

      const supplierEmail =
        (supplierRecord.supEmail || '')
          .trim();

      if (supplierEmail) {

        const emailsFromSupplier =
          this.parseEmailList(
            supplierEmail
          );

        emailsFromSupplier.forEach(
          (email: string) => {

            const alreadyAdded =
              selectedEmails.some(
                (existingEmail: string) =>
                  existingEmail
                    .toLowerCase() ===
                  email.toLowerCase()
              );

            if (!alreadyAdded) {
              selectedEmails.push(email);
            }
          }
        );
      } else {

        console.warn(
          'No email found for supplier:',
          supplierRecord.supID,
          supplierRecord.supName
        );
      }
    }
  );

  return selectedEmails;
}

  // onKey(event : any) {
  //   this.ccList.push (event.target.value);
  // }

onSupplierSelectionChange(): void {

  /*
   * The form array is rebuilt when opening the modal.
   * No action is required while the modal is closed.
   */
  const modal =
    document.getElementById(
      'emailTemplateModal'
    );

  const modalIsOpen =
    modal &&
    modal.classList.contains('show');

  if (!modalIsOpen) {
    return;
  }

  this.buildSelectedSupplierEmailControls(
    this.selectedPackageSupplier
  );

  this.changeDetectorRef
    .detectChanges();
}

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
    this.listCC = [];
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

  ngOnDestroy(): void {
    if (this.params) {
      this.params.unsubscribe();
    }
  }

  ngOnInit(): void {
    /* Always start both mandatory selections blank. */
    this.selectedPortalStatus = null;
    this.assignmentOption = null;
    this.assignOptionSubmitted = false;
    this.selectedSuppliers = [];
    this.SupplierList = [];
    this.AllSupplierList = [];
    this.generatedRfqAttachment = '';
    this.generatedRfqAttachmentName = '';
    this.includeRfqAttachment = true;
    localStorage.removeItem('assignByBoqOnly');

    this.params = this.route.params.subscribe(params => {
      this.PackageId = Number(params['packageId']);

      if (this.PackageId > 0) {
        this.GetPackageById(this.PackageId);
        this.GetSupplierPackagesList();
      }

      const currencyValue = localStorage.getItem('currency');
      const projectValue = localStorage.getItem('project');

      this.projectCurrency = currencyValue
        ? JSON.parse(currencyValue) as ProjectCurrency
        : null;

      this.project = projectValue
        ? JSON.parse(projectValue) as Project
        : null;
    });
  }

  onAssignmentOptionChange(): void {
    this.assignOptionSubmitted = false;

    if (this.assignmentOption !== 0 && this.assignmentOption !== 1) {
      this.assignmentOption = null;
      localStorage.removeItem('assignByBoqOnly');
      return;
    }

    localStorage.setItem(
      'assignByBoqOnly',
      String(this.assignmentOption)
    );

    /* Never reuse an RFQ created for another assignment mode. */
    this.generatedRfqAttachment = '';
    this.generatedRfqAttachmentName = '';
    this.includeRfqAttachment = true;
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


openAssignSupplierEmail(): void {
  this.assignOptionSubmitted = true;

  if (this.selectedPortalStatus !== 0 && this.selectedPortalStatus !== 1) {
    this.toastr.error('Please select a supplier group.');
    return;
  }

  if (this.assignmentOption !== 0 && this.assignmentOption !== 1) {
    this.toastr.error('Please select By BOQ Item or By Resources.');
    return;
  }

  if (!this.selectedSuppliers || this.selectedSuppliers.length === 0) {
    this.toastr.error('Select at least one supplier.');
    return;
  }

  if (this.selectedPortalStatus === 1 || this.selectedPortalStatus === 0) {
    this.preparePortalRfqAttachmentAndOpenModal();
    return;
  }

  this.generatedRfqAttachment = '';
  this.generatedRfqAttachmentName = '';
  this.includeRfqAttachment = false;
  this.OpenEmailTemplateModal(0, 0, null, -1);
}

private preparePortalRfqAttachmentAndOpenModal(): void {
  if (this.isPreparingRfqAttachment) {
    return;
  }

  if (this.assignmentOption !== 0 && this.assignmentOption !== 1) {
    this.toastr.error('Please select By BOQ Item or By Resources.');
    return;
  }

  const CostConn = this.user?.usrLoggedConnString || '';

  if (!CostConn) {
    this.toastr.error('Project database connection is not available.');
    return;
  }

  this.isPreparingRfqAttachment = true;
  this.generatedRfqAttachment = '';
  this.generatedRfqAttachmentName = '';
  this.includeRfqAttachment = true;

  this.packageSupplierService
    .validateExcelBeforeAssign(
      this.PackageId,
      this.assignmentOption,
      false,
      CostConn
    )
    .pipe(
      finalize(() => {
        this.isPreparingRfqAttachment = false;
        this.changeDetectorRef.detectChanges();
      })
    )
    .subscribe({
      next: (data: any) => {
        const generatedPath = String(data || '').trim();

        if (!generatedPath) {
          this.toastr.error('RFQ Excel was not generated.');
          return;
        }

        this.generatedRfqAttachment = generatedPath;
        this.generatedRfqAttachmentName =
          generatedPath.split(/[\\/]/).pop() || generatedPath;

        this.OpenEmailTemplateModal(0, 0, null, -1);
      },
      error: (error: any) => {
        console.error('RFQ Excel generation failed:', error);
        this.toastr.error(
          error?.error?.message ||
          error?.message ||
          'RFQ Excel generation failed.'
        );
      }
    });
}

downloadGeneratedRfq(): void {
  if (!this.generatedRfqAttachment) {
    this.toastr.error('RFQ attachment is not available.');
    return;
  }

  const downloadUrl =
    environment.baseApiUrl +
    'api/SupplierPackages/DownloadFile?filename=' +
    encodeURIComponent(this.generatedRfqAttachment);

  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.target = '_blank';
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

removeGeneratedRfq(): void {
  if (this.selectedPortalStatus === 0) {
    this.toastr.warning(
      'The RFQ attachment is mandatory for suppliers without a portal account.'
    );
    return;
  }

  this.includeRfqAttachment = false;
  this.generatedRfqAttachment = '';
  this.generatedRfqAttachmentName = '';
}

OpenEmailTemplateModal(
  supId: number,
  psId: number,
  packageSupplier: SupplierPackagesList | null,
  index: number
): void {

  const CostConn =
    this.user.usrLoggedConnString;

  this.loginService
    .CheckConnection(CostConn)
    .subscribe(() => { });

  this.formEmailSubmitted = false;
  this.isAssigning = false;

  this.topManagementAttachements = [];
  this.SupplierInput = [];
  this.SupplierInputList = [];
  this.listCC = [];

  /*
   * Add Revision button:
   * use only the supplier belonging to that row.
   *
   * Main Assign Supplier button:
   * supId is zero, therefore keep all dropdown selections.
   */
  if (supId > 0) {
    this.selectedSuppliers = [
      Number(supId)
    ];
  }

  if (
    !this.selectedSuppliers ||
    this.selectedSuppliers.length === 0
  ) {
    this.toastr.error(
      'Select at least one supplier.'
    );

    return;
  }

  this.selectedPsId =
    psId;

  this.selectedPackageSupplier =
    packageSupplier;

  this.rowindex =
    index;

  this.isRevisionMode = index >= 0;

  const defaultCc =
    this.user &&
    this.user.usrEmail
      ? this.user.usrEmail.trim()
      : '';

  this.formEmailTemplate =
    this.createEmailTemplateForm(
      defaultCc,
      !this.isRevisionMode
    );

  /*
   * Build one editable Email To control
   * for every selected supplier.
   */
  this.buildSelectedSupplierEmailControls(
    packageSupplier
  );

  const suppliersWithoutEmail =
    this.supplierEmailControls.controls
      .filter(
        control =>
          !control.get('emailTo')
            ?.value
      );

  if (suppliersWithoutEmail.length > 0) {
    this.toastr.warning(
      'One or more selected suppliers do not have an email. Please enter the missing email before sending.'
    );
  }

  if (!this.isRevisionMode) {
    this.GetEmailTemplateLanguageList();

    const costDB =
      this.user.usrLoggedCostDB;

    this.packageSupplierService
      .GetDefaultProjectEmailTemplate(
        costDB
      )
      .subscribe({
        next: (data) => {

          this.selectedEmailTemplate =
            data;

          this.formEmailTemplate.patchValue({
            language:
              this.selectedEmailTemplate
                ?.etLang || '',

            template:
              this.selectedEmailTemplate
                ?.etContent || ''
          });
        },

        error: (error: any) => {

          console.error(
            'Unable to load default email template:',
            error
          );

          this.toastr.error(
            'Unable to load the default email template.'
          );
        }
      });
  }

  this.getComConditions(psId);

  this.GetTechnicalConditionsByPackage(
    psId
  );

  $('#emailTemplateModal')
    .modal('show');
}

openAddRevisionEmailModal(
  packageSupplier: SupplierPackagesList,
  index: number
): void {

  if (!packageSupplier) {
    this.toastr.error(
      'The selected package supplier is not available.'
    );

    return;
  }

  const supplierId =
    Number(
      packageSupplier.psSuppId
    );

  if (!supplierId) {
    this.toastr.error(
      'The supplier ID is not available.'
    );

    return;
  }

  const existingSupplier =
    this.findSupplierById(
      supplierId
    );

  if (
    existingSupplier &&
    String(
      existingSupplier.supEmail || ''
    ).trim()
  ) {
    this.OpenEmailTemplateModal(
      supplierId,
      packageSupplier.psId,
      packageSupplier,
      index
    );

    return;
  }

  const CostConn =
    this.user
      ?.usrLoggedConnString || '';

  if (!CostConn) {
    this.toastr.error(
      'Project database connection is not available.'
    );

    return;
  }

  this.isLoadingSuppliers =
    true;

  this.packageSupplierService
    .GetSupplierList(
      this.PackageId
    )
    .pipe(
      finalize(() => {

        this.isLoadingSuppliers =
          false;

        this.changeDetectorRef
          .detectChanges();
      })
    )
    .subscribe({

      next: (
        data: SupplierList[]
      ) => {

        const completeSupplierList =
          data || [];

        const selectedSupplier =
          completeSupplierList.find(
            (
              supplier:
                SupplierList
            ) =>
              Number(
                supplier.supID
              ) === supplierId
          );

        if (!selectedSupplier) {
          this.toastr.error(
            'Supplier information could not be loaded.'
          );

          return;
        }

        this.upsertSupplierInMasterList(
          selectedSupplier
        );

        this.OpenEmailTemplateModal(
          supplierId,
          packageSupplier.psId,
          packageSupplier,
          index
        );
      },

      error: (
        error: any
      ) => {

        console.error(
          'Unable to load supplier email for Add Revision:',
          error
        );

        this.toastr.error(
          error?.error?.message ||
          error?.message ||
          'Unable to load the supplier email.'
        );
      }

    });
}

private findSupplierById(
  supplierId: number
): SupplierList | undefined {

  const allSuppliers =
    [
      ...(this.AllSupplierList || []),
      ...(this.SupplierList || [])
    ];

  return allSuppliers.find(
    (
      supplier:
        SupplierList
    ) =>
      Number(
        supplier.supID
      ) ===
      Number(
        supplierId
      )
  );
}

private upsertSupplierInMasterList(
  supplier:
    SupplierList
): void {

  if (!supplier) {
    return;
  }

  const supplierId =
    Number(
      supplier.supID
    );

  const existingIndex =
    this.AllSupplierList.findIndex(
      (
        currentSupplier:
          SupplierList
      ) =>
        Number(
          currentSupplier.supID
        ) === supplierId
    );

  if (existingIndex >= 0) {

    this.AllSupplierList[
      existingIndex
    ] = {
      ...this.AllSupplierList[
        existingIndex
      ],
      ...supplier
    };

  } else {

    this.AllSupplierList.push({
      ...supplier
    });

  }
}

get f(): { [key: string]: AbstractControl } {
  return this.formEmailTemplate.controls;
}

get supplierEmailControls(): FormArray {
  return this.formEmailTemplate.get(
    'supplierEmails'
  ) as FormArray;
}

getSupplierEmailGroup(
  index: number
): FormGroup {

  return this.supplierEmailControls.at(
    index
  ) as FormGroup;
}

  CloseEmailTemplateModal()
  {
    $("#emailTemplateModal").modal('hide');
    this.selectedEmailTemplate = null;
  }


  onEmailTemplateSubmit(): void {

  if (this.isAssigning) {
    return;
  }

  this.formEmailSubmitted = true;

  if (
    this.rowindex < 0 &&
    this.assignmentOption !== 0 &&
    this.assignmentOption !== 1
  ) {
    this.toastr.error('Please select By BOQ Item or By Resources.');
    return;
  }

  if (
    this.rowindex < 0 &&
    this.selectedPortalStatus === 1 &&
    (!this.includeRfqAttachment || !this.generatedRfqAttachment)
  ) {
    this.toastr.error(
      'The generated RFQ Excel attachment is required for suppliers with a portal account.'
    );
    return;
  }

  if (!this.formEmailTemplate) {
    this.toastr.error(
      'Email form is not initialized.'
    );

    return;
  }

  if (
    !this.supplierEmailControls ||
    this.supplierEmailControls.length === 0
  ) {
    this.toastr.error(
      'No selected supplier email was found.'
    );

    return;
  }

  /*
   * Revalidate every supplier email explicitly.
   */
  this.supplierEmailControls.controls.forEach(
    (control: AbstractControl) => {

      control
        .get('emailTo')
        ?.markAsTouched();

      control
        .get('emailTo')
        ?.updateValueAndValidity();
    }
  );

  this.formEmailTemplate
    .markAllAsTouched();

  this.formEmailTemplate
    .updateValueAndValidity();

  if (this.formEmailTemplate.invalid) {

    let validationMessage =
      'Please complete all required fields.';

    const invalidSupplier =
      this.supplierEmailControls.controls.find(
        (control: AbstractControl) =>
          control.get('emailTo')?.invalid
      );

    if (invalidSupplier) {

      const supplierName =
        String(
          invalidSupplier
            .get('supplierName')
            ?.value || ''
        );

      validationMessage =
        'Please enter a valid Email To for supplier: ' +
        supplierName;
    } else if (
      this.f.emailCc &&
      this.f.emailCc.invalid
    ) {
      validationMessage =
        'Please enter valid CC email addresses.';
    } else if (
      this.f.revisionExpDate &&
      this.f.revisionExpDate.invalid
    ) {
      validationMessage =
        'Expiry Date is required.';
    } else if (
      this.f.language &&
      this.f.language.invalid
    ) {
      validationMessage =
        'Language is required.';
    } else if (
      this.f.template &&
      this.f.template.invalid
    ) {
      validationMessage =
        'Email Template is required.';
    }

    this.toastr.error(
      validationMessage
    );

    this.changeDetectorRef
      .detectChanges();

    return;
  }

  /*
   * Set loading state before starting any processing.
   */
  this.isAssigning = true;

  this.changeDetectorRef
    .detectChanges();

  /*
   * Give the browser one rendering cycle so the
   * spinner and Sending text appear immediately.
   */
  setTimeout(() => {

    try {
      this.AssignSuppliers();
    } catch (error) {

      this.isAssigning = false;

      this.changeDetectorRef
        .detectChanges();

      console.error(
        'AssignSuppliers client error:',
        error
      );

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unable to prepare supplier assignment.';

      this.toastr.error(
        errorMessage
      );
    }

  }, 0);
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


AssignSuppliers(): void {

  if (
    this.rowindex < 0 &&
    this.assignmentOption !== 0 &&
    this.assignmentOption !== 1
  ) {
    this.stopAssigning();
    this.toastr.error('Please select By BOQ Item or By Resources.');
    return;
  }

  if (
    this.rowindex < 0 &&
    this.selectedPortalStatus === 1 &&
    (!this.includeRfqAttachment || !this.generatedRfqAttachment)
  ) {
    this.stopAssigning();
    this.toastr.error(
      'The generated RFQ Excel attachment is required for suppliers with a portal account.'
    );
    return;
  }

  if (
    !this.selectedSuppliers ||
    this.selectedSuppliers.length === 0
  ) {
    this.toastr.error(
      'You should select at least one supplier.'
    );

    return;
  }

  if (
    !this.formEmailTemplate ||
    this.formEmailTemplate.invalid
  ) {
    this.formEmailTemplate
      .markAllAsTouched();

    this.toastr.error(
      'Please complete all required email fields.'
    );

    return;
  }

  const CostConn =
    this.user.usrLoggedConnString;

  const TSConn =
    this.user.usrLoggedTSConnString;

  this.loginService
    .CheckConnection(CostConn)
    .subscribe(() => { });

  const sharedEmailCc: string[] =
    this.parseEmailList(
      this.f.emailCc.value
    );

  const comCondList: Condition[] = [];

  this.comConditions.forEach(c => {

    if (c.checked) {
      comCondList.push({
        id: c.cmSeq,
        description:
          c.cmDescription,
        ACCCondValue:
          c.cmAccCondValue
      });
    }
  });

  const techCondList: Condition[] = [];

  this.techConditions.forEach(c => {

    if (c.checked) {
      techCondList.push({
        id: c.tcSeq,
        description:
          c.tcDescription,
        ACCCondValue:
          c.tcAccCondValue
      });
    }
  });

  this.SupplierInput = [];
  this.SupplierInputList = [];
  this.listCC = sharedEmailCc.slice();

  /*
   * Build one SupplierInputList for every supplier,
   * including only that supplier's edited mailTo.
   */
  this.supplierEmailControls.controls.forEach(
    (control: AbstractControl) => {

      const supplierId =
        Number(
          control
            .get('supplierId')
            ?.value
        );

      const supplierName =
        String(
          control
            .get('supplierName')
            ?.value || ''
        );

      const supplierMailTo =
        this.parseEmailList(
          control
            .get('emailTo')
            ?.value
        );

      if (supplierMailTo.length === 0) {
        throw new Error(
          'Email To is required for supplier ' +
          supplierName
        );
      }

      const supplierInput:
        SupplierInput = {
          supID: supplierId
        };

      this.SupplierInput.push(
        supplierInput
      );

      const supplierInputList =
        new SupplierInputList();

      supplierInputList.supplierInput =
        supplierInput;

      supplierInputList.supplierName =
        supplierName;

      /*
       * Only this supplier's edited To addresses.
       */
      supplierInputList.mailTo =
        supplierMailTo;

      supplierInputList.mailCC = [];

      supplierInputList.comercialCondList =
        comCondList.map(
          condition => ({
            ...condition
          })
        );

      supplierInputList.technicalCondList =
        techCondList.map(
          condition => ({
            ...condition
          })
        );

      supplierInputList.emailTemplate =
        this.f.template.value;

      supplierInputList.filePath =
        this.FilePath;

      this.SupplierInputList.push(
        supplierInputList
      );
    }
  );

  const assignPackageTemplate =
    new AssignPackageTemplate();

  assignPackageTemplate.byBoq =
    this.rowindex >= 0 && this.selectedPackageSupplier
      ? Number(this.selectedPackageSupplier.psByBoq)
      : Number(this.assignmentOption);

  assignPackageTemplate.listAttach =
    this.includeRfqAttachment && this.generatedRfqAttachment
      ? [this.generatedRfqAttachment]
      : [];
  assignPackageTemplate.includeRfqAttachment =
    this.selectedPortalStatus === 1
      ? true
      : this.includeRfqAttachment;

  /*
   * One shared CC only.
   */
  assignPackageTemplate.listCC =
    sharedEmailCc;

  assignPackageTemplate.packId =
    this.PackageId;

  assignPackageTemplate.supInputList =
    this.SupplierInputList;

  assignPackageTemplate.userName =
    this.loginService
      .userValue
      ?.usrId || '';

  assignPackageTemplate
    .revisionExpiryDate =
      this.f.revisionExpDate.value;

  const files: File[] = [];

  this.topManagementAttachements
    .forEach(attachment => {

      if (
        attachment &&
        attachment.file
      ) {
        files.push(
          attachment.file
        );
      }
    });


  this.packageSupplierService
    .AssignPackageSuppliers(
      assignPackageTemplate,
      files,
      CostConn,
      TSConn
    )
    .pipe(
      finalize(() => {
        this.isAssigning = false;
      })
    )
    .subscribe({
      next: (res: any) => {

        if (
          res === true ||
          res?.success === true
        ) {
          this.toastr.success(
            'Each supplier was assigned and emailed separately.'
          );

          this.GetSupplierPackagesList();

          if (
            this.selectedPackageSupplier &&
            this.rowindex >= 0
          ) {
            this.Toggle(
              this.selectedPackageSupplier,
              this.rowindex
            );
          }

          this.CloseEmailTemplateModal();
          this.assignmentOption = null;
          this.assignOptionSubmitted = false;
          localStorage.removeItem('assignByBoqOnly');
        } else {
          this.toastr.error(
            res?.message ||
            'Supplier assignment or email sending failed.'
          );
        }
      },

      error: (err: any) => {

        console.error(
          'Assign supplier error:',
          err
        );

        const errorMessage =
          err?.error?.message ||
          err?.error ||
          'Unexpected error occurred.';

        this.toastr.error(
          typeof errorMessage === 'string'
            ? errorMessage
            : 'Unexpected error occurred.'
        );
      }
    });
}

private stopAssigning(): void {

  this.isAssigning = false;

  this.changeDetectorRef
    .detectChanges();
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
    //var exchangeRate = document.getElementById("exchangeRate") as HTMLInputElement;
    
    let addedItem: number = 0;

    // var checkAddedItem= document.getElementById("addedItems") as HTMLInputElement;
    // if(checkAddedItem.type == 'checkbox'){
   
    //   if (checkAddedItem.checked)
    //   addedItem=1;
    // }
  
    addedItem=1;
    
    console.log(this.selectedPsId);

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
              this.toastr.success("Prices has been updated !")
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
    } 
    else 
    {
      this.toastr.error("Please Select A Date !")
    }
  }

  validateExcelBeforeAssign(): void {
    this.assignOptionSubmitted = true;

    if (this.assignmentOption !== 0 && this.assignmentOption !== 1) {
      this.toastr.error('Please select By BOQ Item or By Resources.');
      return;
    }

    if (this.isValidatingExcel) {
      return;
    }

    const CostConn = this.user?.usrLoggedConnString || '';

    if (!CostConn) {
      this.toastr.error('Project database connection is not available.');
      return;
    }

    this.isValidatingExcel = true;

    this.packageSupplierService
      .validateExcelBeforeAssign(
        this.PackageId,
        this.assignmentOption,
        false,
        CostConn
      )
      .pipe(
        finalize(() => {
          this.isValidatingExcel = false;
          this.changeDetectorRef.detectChanges();
        })
      )
      .subscribe({
        next: (data: any) => {
          const generatedPath = String(data || '').trim();

          if (!generatedPath) {
            this.toastr.error('RFQ Excel was not generated.');
            return;
          }

          this.generatedRfqAttachment = generatedPath;
          this.generatedRfqAttachmentName =
            generatedPath.split(/[\\/]/).pop() || generatedPath;
          this.includeRfqAttachment = true;

          this.toastr.success(
            this.assignmentOption === 1
              ? 'BOQ Item RFQ Excel generated successfully.'
              : 'Resources RFQ Excel generated successfully.'
          );

          const anchor = document.createElement('a');
          anchor.href =
            environment.baseApiUrl +
            'api/SupplierPackages/DownloadFile?filename=' +
            encodeURIComponent(generatedPath);
          anchor.target = '_blank';
          anchor.rel = 'noopener';
          anchor.style.display = 'none';
          document.body.appendChild(anchor);
          anchor.click();
          document.body.removeChild(anchor);
        },
        error: (error: any) => {
          console.error('RFQ Excel generation failed:', error);
          this.toastr.error(
            error?.error?.message ||
            error?.message ||
            'RFQ Excel generation failed.'
          );
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

  get canCompareQuotations(): boolean {

  return !!(
    this.SupplierPackagesList &&
    this.SupplierPackagesList.length > 0 &&
    this.SupplierPackagesList[0] &&
    Number(
      this.SupplierPackagesList[0].psId
    ) > 0
  );
}


onCompare(): void {

  if (!this.canCompareQuotations) {

    this.toastr.warning(
      'At least one supplier quotation is required before comparison.'
    );

    return;
  }

  const firstPackageSupplier =
    this.SupplierPackagesList[0];

  this.router.navigate(
    [
      'package-comparison-novo'
    ],
    {
      state: {

        packageId:
          this.PackageId,

        packageName:
          this.PackageName,

        /*
         * true  = package assigned by BOQ
         * false = package assigned by Resources
         */
        byBoq:
          Number(
            firstPackageSupplier.psByBoq
          ) === 1,

        packSuppId:
          Number(
            firstPackageSupplier.psId
          )
      }
    }
  );
}

  // onCompare() {
  //   this.router.navigate(['package-comparison-novo'], { state: { packageId: this.PackageId, packageName : this.PackageName, byBoq : (this.SupplierPackagesList[0]?.psByBoq == 1) , packSuppId : this.SupplierPackagesList[0].psId} });
  // }

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
               l5:'',
               l6:'',
               c1:'',
               c2:'',
               c3:'',
               c4:'',
               boqRefNumber:'',comment:'',isVO:false
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

  goToPackageList(): void {
    this.router.navigate(['/package-list'], { queryParams: { filter: this.PackageId } });
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

    checkAllTechCond(event: any): void {

      const chk =
        event.target as HTMLInputElement;

      this.techConditions.forEach(c => {
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

GetSupplierList_NotAssignetPackage(
  IdPkge: number
): void {
  if (this.selectedPortalStatus !== 0 && this.selectedPortalStatus !== 1) {
    this.AllSupplierList = [];
    this.SupplierList = [];
    return;
  }

  const CostConn = this.user?.usrLoggedConnString || '';

  if (!CostConn) {
    this.AllSupplierList = [];
    this.SupplierList = [];
    this.toastr.error('Project database connection is not available.');
    return;
  }

  this.isLoadingSuppliers = true;

  this.packageSupplierService
    .GetSupplierList_NotAssignetPackage(
      IdPkge,
      this.selectedPortalStatus,
      CostConn
    )
    .pipe(
      finalize(() => {
        this.isLoadingSuppliers = false;
        this.changeDetectorRef.detectChanges();
      })
    )
    .subscribe({
      next: (data: SupplierList[]) => {
        const suppliers = data || [];
        this.AllSupplierList = suppliers.map(item => ({ ...item }));
        this.SupplierList = suppliers.map(item => ({ ...item }));
      },
      error: (error: any) => {
        this.AllSupplierList = [];
        this.SupplierList = [];
        console.error('Unable to load suppliers:', error);
        this.toastr.error(
          error?.error?.message ||
          error?.message ||
          'Unable to load suppliers.'
        );
      }
    });
}
      

private buildSelectedSupplierEmailControls(
  packageSupplier:
    SupplierPackagesList | null = null
): void {

  const supplierEmails =
    this.supplierEmailControls;

  supplierEmails.clear();

  this.selectedSuppliers.forEach(
    (
      supplierId:
        number
    ) => {

      const supplier =
        this.findSupplierById(
          supplierId
        );

      let supplierName =
        '';

      let supplierEmail =
        '';

      if (supplier) {

        supplierName =
          String(
            supplier.supName || ''
          ).trim();

        supplierEmail =
          String(
            supplier.supEmail || ''
          ).trim();
      }

      /*
       * Fallback for an already-assigned supplier.
       * This works when psSupEmail is returned by
       * GetSupplierPackagesList.
       */
      if (
        packageSupplier &&
        Number(
          packageSupplier.psSuppId
        ) ===
        Number(
          supplierId
        )
      ) {

        if (!supplierName) {

          supplierName =
            String(
              packageSupplier
                .psSupName || ''
            ).trim();
        }

        if (!supplierEmail) {

          supplierEmail =
            String(
              packageSupplier
                .psSupEmail || ''
            ).trim();
        }
      }

      /*
       * Keep only the supplier name in the left label.
       * The email belongs in the editable Email To field.
       */
      supplierName =        this.getSupplierDisplayName(     supplierName              );

      supplierEmails.push( this.formBuilder.group({

          supplierId: [
            Number(
              supplierId
            ),
           Validators.required
          ],
          supplierName: [
            supplierName
          ],

         emailTo: [
            supplierEmail,
            [
              emailListValidator(
                true
              )
            ]
          ]

        })
      )
    }
  );
}


filterSuppliers(
  event: KeyboardEvent
): void {

  const input =
    event.target as HTMLInputElement;

  const searchText =
    (input.value || '')
      .trim()
      .toLowerCase();

  if (!searchText) {

    this.SupplierList =
      this.AllSupplierList.map(
        (supplier: SupplierList) => ({
          ...supplier
        })
      );

    return;
  }

  this.SupplierList =
    this.AllSupplierList.filter(
      (supplier: SupplierList) => {

        const supplierId =
          String(
            supplier.supID || ''
          ).toLowerCase();

        const supplierName =
          (supplier.supName || '')
            .toLowerCase();

        const supplierEmail =
          (supplier.supEmail || '')
            .toLowerCase();

        return (
          supplierId.indexOf(searchText) >= 0 ||
          supplierName.indexOf(searchText) >= 0 ||
          supplierEmail.indexOf(searchText) >= 0
        );
      }
    );
}
//AH24012024

openAcceptanceCommentsModal(revisionId : any, prRevNo : any, psSupName : any)
{
  $('#acceptanceCommentsModal').modal('show');
    this.selectedSupplierName = psSupName;
    this.selectedRevisionNb = prRevNo;
    this.getAcceptanceComment(revisionId); 
}

  getAcceptanceComment(revId: any) {
    let CostConn = this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

    this.packageSupplierService.getRevisionAcceptance(revId, CostConn).subscribe(data => {
      if (data) {
        this.acceptanceComments = data;
      }
    });
  }

  closeAcceptanceComments()
  {
    $('#acceptanceCommentsModal').modal('hide');
    this.acceptanceComments = [];
  }

  onPortalStatusChange(): void {
    this.generatedRfqAttachment = '';
    this.generatedRfqAttachmentName = '';
    this.includeRfqAttachment = true;
    this.selectedSuppliers = [];
    this.SupplierInput = [];
    this.SupplierInputList = [];
    this.AllSupplierList = [];
    this.SupplierList = [];

    if (this.selectedPortalStatus === 0 || this.selectedPortalStatus === 1) {
      this.GetSupplierList_NotAssignetPackage(this.PackageId);
    }
  }

  private getSupplierDisplayName(  value: string | null | undefined): string {

  const text =    String(value || '').trim();

  if (!text) {
    return '';
  }

  return text
    .split('\\')[0]
    .trim();
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
