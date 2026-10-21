import { Component, ElementRef, OnInit } from '@angular/core';
import { ColDef, ColGroupDef, GridApi, ColumnApi, GridReadyEvent, CellClickedEvent, CellValueChangedEvent, BodyScrollEvent } from 'ag-grid-community';
import { Router } from '@angular/router';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import {
  BOQDivList,
  RESDivList,
  RESTypeList,
  SearchInput,
  SheetDescList,
} from '../assign-package/assign-package.model';
import { AssignPackageService } from '../assign-package/assign-package.service';
import {
  AssignSupplierGroup,
  AssignSuppliertBoq,
  AssignSuppliertRes,
  boqItem,
  DisplayCondition,
  Group,
  PackageSuppliersPrice,
  ressourceItem,
  RevisionDetails,
  SupplierBOQ,
  SupplierGroups,
  SupplierPercent,
  SupplierQty,
  SupplierResrouces,
  TopManagement,
  TopManagementAttachement,
  TopManagementTemplate,
} from '../package-comparison/package-comparison.model';
import { PackageComparisonService } from '../package-comparison/package-comparison.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import {
  CLevelGrouping,
  GroupingBoq,
  GroupingBoqGroup,
  GroupingLevelModel,
  GroupingPackageSupplierPrice,
  GroupingResource,
} from '../package-groups/package-groups.model';
import {
  SupplierList,
  SupplierPackagesList,
} from '../package-supplier/package-supplier.model';
import { FieldType, Language, User } from '../_models';
import { environment } from '../../environments/environment';
import { PackageSupplierService } from '../package-supplier/package-supplier.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../login/login.service';
import { escapeRegExp } from 'lodash-es';
declare var $: any;
@Component({
  selector: 'app-package-comparison-novo',
  templateUrl: './package-comparison-novo.component.html',
  styleUrls: ['./package-comparison-novo.component.css'],
})
export class PackageComparisonNovoComponent implements OnInit {
  packageId: number = 0;
  packageName: string = '';
  SearchInput: SearchInput = new SearchInput();
  byBoq: boolean = false;
  packSuppId: number = 0;
  isShown: boolean = false;
  show: boolean = false;
  toggleClass: string = 'fa-solid fa-toggle-off';
  selectedBOQDivList: any[] = [];
  RESDivList: RESDivList[] = [];
  BOQDivList: BOQDivList[] = [];
  supplierResourcePercent: SupplierPercent[] = [];
  supplierResourceQty: SupplierQty[] = [];
  supplierBoqPercent: SupplierPercent[] = [];
  supplierBoqQty: SupplierQty[] = [];
  supplierGroupPercent: SupplierPercent[] = [];
  supplierGroupQty: SupplierQty[] = [];
  supplierPercent: SupplierPercent[] = [];
  supplierQty: SupplierPercent[] = [];
  supplierResrouces: SupplierResrouces[] = [];
  supplierBoq: SupplierBOQ[] = [];
  supplierGroups: SupplierGroups[] = [];
  SheetDescList: SheetDescList[] = [];
  SupplierPackagesList: SupplierPackagesList[] = [];
  selectedSheetDescList: any[] = [];
  selectedRESDivList: any[] = [];
  selectedRESTypeList: any[] = [];
  RESTypeList: RESTypeList[] = [];
  searching: boolean = false;
  packageSuppliersPrices: PackageSuppliersPrice[] = [];
  comparisonList: GroupingBoq[] = [];
  groupingBoqGroupList: GroupingBoqGroup[] = [];
  fieldTypes = FieldType;
  selectedResources: string[] = [];
  selectedBoqItems: string[] = [];
  selectedGroups: number[] = [];
  columns: string[] = ['Resource', 'Unit', 'Qty', 'U. price', 'T. Price'];
  columnsByBoq: string[] = ['Boq Ref', 'Unit', 'Qty', 'U. price', 'T. Price'];
  isAssigningSupplierRessource: boolean = false;
  isAssigningSupplierBoq: boolean = false;
  isAssigningSupplierList: boolean = false;
  isAssigningSupplierGroup: boolean = false;
  byGroup: boolean = false;
  showQuotation: boolean = true;
  techConditionsReplies: DisplayCondition[] = [];
  comConditionsReplies: DisplayCondition[] = [];
  comConditionSuppliers : any[] = [];
  topManagementList: TopManagement[] = [];
  selectedTopManagementList: TopManagement[] = [];
  htmlContent: string = '';
  sendingEmail: boolean = false;
  generatingFile: boolean = false;
  topManagementAttachement: File | null;
  emailTemplate: string = '';
  languages = Language.languages;

  //AH25022024
  public user: User;
  costDB: string = '';
  LevelModelList: GroupingLevelModel[] = [];
  CurrentLevelList: CLevelGrouping[] = [];
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
    fonts: [{ class: 'calibri', name: 'Calibri' }],
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText',
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
    toolbarHiddenButtons: [['italic']],
  };

  formEmailTemplate!: FormGroup;
  formEmailSubmitted: boolean = false;
  topManagementAttachements: TopManagementAttachement[] = [];
  listCC: string[] = [];
  maxAttachements: number = 5;
  supplierList: SupplierList[] = [];
  selectedSupplier: SupplierList = null;
  generatingContract: boolean = false;
  cGroup: string = '1';

  // AG Grid
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: (ColDef | ColGroupDef)[] = [];
  rowData: any[] = [];
  gridHeight: string = '150px';
  defaultColDef: ColDef = {
    sortable: true,
    filter: false,
    resizable: true,
    suppressMovable: true,
    cellStyle: { fontSize: '12px' },
  };
  rowClassRules: { [cssClass: string]: (params: any) => boolean } = {
    'row-level-header': (params) => params.data?._rowType === 'levelHeader',
    'row-subtotal': (params) => params.data?._rowType === 'subtotal',
    'bg-AlternativeItem': (params) => params.data?._rowType === 'data' && params.data?.isAlternative === true,
    'bg-NewItem': (params) => params.data?._rowType === 'data' && params.data?.isNewItem === true,
  };
  isRowSelectable = (rowNode: any) => rowNode.data?._rowType === 'data';
  isFullWidthRowFn = (params: any) => params.rowNode?.data?._rowType === 'levelHeader';
  levelHeaderRenderer: any = class {
    private eGui: any;
    init(params: any) {
      this.eGui = document.createElement('div');
      this.eGui.style.cssText =
        'padding:0 10px;font-weight:700;text-align:left;width:100%;height:100%;' +
        'display:flex;align-items:center;font-size:12px;color:#333;background:#c8c8c8;user-select:text;';
      this.eGui.textContent = params.data?._levelName || '';
    }
    getGui() { return this.eGui; }
    refresh() { return false; }
    destroy() {}
  };

  constructor(
    private router: Router,
    private packageComparisonService: PackageComparisonService,
    private assignPackageService: AssignPackageService,
    private packageSupplierService: PackageSupplierService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private hostEl: ElementRef
  ) {
    if (this.router.getCurrentNavigation().extras.state != undefined) {
      this.packageId =
        this.router.getCurrentNavigation().extras.state.packageId;
      this.packageName =
        this.router.getCurrentNavigation().extras.state.packageName;
      this.byBoq = this.router.getCurrentNavigation().extras.state.byBoq;
      //AH25022024
      this.packSuppId =
        this.router.getCurrentNavigation().extras.state.packSuppId;
      //AH25022024
    } else {
      this.router.navigateByUrl('/package-list');
    }
    //AH25022024
    {
      this.loginService.user.subscribe((x) => (this.user = x));
    }
    this.costDB = this.user.usrLoggedCostDB;
    //AH25022024
  }

  ngOnInit(): void {
    let body: any = {
      level2: this.SearchInput.boqLevel2,
      level3: this.SearchInput.boqLevel3,
      level4: this.SearchInput.boqLevel4,
      resType: this.SearchInput.rESType,
      boqDiv: this.SearchInput.bOQDiv,
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
  FilterRegularItems(items: GroupingBoq[]) {
    let itm = items.filter(
      (p) => p.isNewItem == false && p.isAlternative == false
    );
    return itm;
  }

  FilterNewItems(items: GroupingBoq[]) {
    let itm = items.filter((p) => p.isNewItem == true);
    return itm;
  }

  FilterAlternativeItems(items: GroupingBoq[]) {
    let itm = items.filter((p) => p.isAlternative == true);
    return itm;
  }

  FilterRegularRessource(items: GroupingResource[]) {
    let itm = items.filter(
      (p) => p.isNewItem == false && p.isAlternative == false
    );
    return itm;
  }

  FilterNewRessource(items: GroupingResource[]) {
    let itm = items.filter((p) => p.isNewItem == true);
    return itm;
  }

  FilterAlternativeRessource(items: GroupingResource[]) {
    let itm = items.filter((p) => p.isAlternative == true);
    return itm;
  }

  getSplittedLevelName(levelName: any) {
    let arr: any[] = levelName.split('|');
    let str = '';
    arr.forEach((element) => {
      str += '<br>' + element;
    });
    return this.replaceAll(str, '~', ' : ');
  }

  replaceAll(str: string, find: string, replace: string) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
  }

  // onScroll() {
  //   //add another "sum" items
  //   const start = this.sum;
  //   this.sum += 4;
  //   for (let i = start; i < this.sum; ++i) {
  //     if (this.LevelModelList.length - 1 >= i) {
  //       this.CurrentLevelList.push(this.LevelModelList[i]);
  //     }
  //   }
  // }
  //AH25022024

  isResourceSelected(boqSeq: number) {
    return false;
  }

  GetSupplierList() {
    let CostConn = this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => {});
    this.packageSupplierService
      .GetSupplierList(this.packageId)
      .subscribe((data) => {
        if (data) {
          this.supplierList = data;
        }
      });
  }

  getPercByResource(
    revisionDetails: RevisionDetails[],
    resourceID: number,
    itemO: string
  ) {
    return revisionDetails.length > 0
      ? revisionDetails.find(
          (x) => x.resourceID === resourceID && x.itemO === itemO
        ).perc
      : 0;
  }

  GetSupplierPackagesList() {
    //this.techConditionsReplies = [];
    let CostConn = this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => {});
    this.packageComparisonService
      .GetSupplierPackagesList(this.packageId, CostConn)
      .subscribe((data) => {
        if (data) {
          this.SupplierPackagesList = data;
          //this.byBoq = this.SupplierPackagesList[0].psByBoq;
        }
      });
  }

  checkAllGroups(event: any) {
    this.selectedGroups = [];
    let checkbox = event.target as HTMLInputElement;
    this.groupingBoqGroupList.forEach((element) => {
      element.isChecked = checkbox.checked;
      if (checkbox.checked) {
        this.selectedGroups.push(element.id);
      }
    });
  }

  checkGroup(event: any, group: GroupingBoqGroup) {
    let checkbox = event.target as HTMLInputElement;
    let checkAllGroups = document.getElementById(
      'selectAllGroups'
    ) as HTMLInputElement;
    group.isChecked = checkbox.checked;
    if (checkbox.checked) {
      this.selectedGroups.push(group.id);
    } else {
      let index = this.selectedGroups.indexOf(group.id);
      this.selectedGroups.splice(index, 1);
    }

    let allChecked = true;
    this.groupingBoqGroupList.forEach((element) => {
      if (!element.isChecked) {
        allChecked = false;
        return;
      }
    });

    checkAllGroups.checked = allChecked;
  }

  setSupplierGroupPerc(
    event: any,
    item: GroupingBoqGroup,
    sup: GroupingPackageSupplierPrice
  ) {
    let element = event.target as HTMLInputElement;
    this.groupingBoqGroupList.forEach((group: GroupingBoqGroup, i: number) => {
      if (group.id === item.id) {
        this.searchSupPercByGroup(Number(element.value), item, sup);
        return;
      }
    });
  }

  setSupplierGroupQty(
    event: any,
    item: GroupingBoqGroup,
    sup: GroupingPackageSupplierPrice
  ) {
    let element = event.target as HTMLInputElement;
    this.groupingBoqGroupList.forEach((group: GroupingBoqGroup, i: number) => {
      if (group.id === item.id) {
        this.searchSupQtyByGroup(Number(element.value), item, sup);
        return;
      }
    });
  }

  showByGroup() {
    this.byGroup = !this.byGroup;
    this.getByGroup();
  }

  getByGroup() {
    let CostConn = this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => {});

    if (this.byGroup && !this.byBoq) {
      this.packageComparisonService
        .getComparisonSheetResourcesByGroup(
          this.packageId,
          this.SearchInput,
          CostConn
        )
        .subscribe((data) => {
          if (data) {
            this.groupingBoqGroupList = data;
            //console.log(this.groupingBoqGroupList);
          }
        });
    } else if (this.byGroup && this.byBoq) {
      this.packageComparisonService
        .getComparisonSheetBoqByGroup(
          this.packageId,
          this.SearchInput,
          CostConn
        )
        .subscribe((data) => {
          if (data) {
            this.groupingBoqGroupList = data;
            //console.log(this.groupingBoqGroupList);
          }
        });
    }
  }

  getTechCondReplies() {
    let CostConn = this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => {});
    this.packageComparisonService
      .getTechCondReplies(this.packageId, this.costDB, CostConn)
      .subscribe((data) => {
        this.techConditionsReplies = data;
      });
  }

  getComCondReplies() {
    let CostConn = this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => {});
    this.packageComparisonService.getComCondReplies(this.packageId, this.costDB, CostConn)
      .subscribe((data) => {
        this.comConditionsReplies = data;
        this.comConditionsReplies.forEach((cond) => {
          cond.replies.forEach((rep) => {
            this.comConditionSuppliers.push(rep.supplierName);
          });
        });

        this.comConditionSuppliers = [...new Set(this.comConditionSuppliers)];
        
      });
  }

  CloseAssignModal() {
    for (let index = 0; index < this.SupplierPackagesList.length; index++) {
      var input = document.getElementById(
        'valueInput' + index
      ) as HTMLInputElement;
      input.value = null;
    }
    this.supplierPercent = [];
    $('#assignPackageModal').modal('hide');
  }

  
AssignPackageSuppliers(): void {

  if (this.isAssigningSupplierList) {
    return;
  }

  const CostConn = this.user?.usrLoggedConnString || '';

  if (!CostConn) {
    this.toastr.error('Project database connection is not available.');
    return;
  }

  if ( !this.SupplierPackagesList || this.SupplierPackagesList.length === 0 ) 
  {
    this.toastr.error('No suppliers are available for assignment.');
    return;
  }

  /*
   * Build supplier percentages safely.
   */
  const supplierPercentages: SupplierPercent[] = [];

  let totalPercentage = 0;

  for (
    let index = 0;
    index < this.SupplierPackagesList.length;
    index++
  ) {
    const supplier =
      this.SupplierPackagesList[index];

    const percentageInput =
      document.getElementById(
        'valueInput' + index
      ) as HTMLInputElement | null;

    if (!percentageInput) {
      this.toastr.error(
        'Percentage input was not found for supplier: ' +
        (
          supplier.psSupName ||
          supplier.psSuppId
        )
      );

      return;
    }

    const percentage =
      Number(
        percentageInput.value || 0
      );

    if (
      isNaN(percentage) ||
      percentage < 0 ||
      percentage > 100
    ) {
      this.toastr.error(
        'Invalid percentage for supplier: ' +
        (
          supplier.psSupName ||
          supplier.psSuppId
        )
      );

      return;
    }

    supplierPercentages.push({
      supID:
        supplier.psSuppId,

      percent:
        percentage
    });

    totalPercentage +=
      percentage;
  }

  totalPercentage =
    Math.round(
      totalPercentage * 100
    ) / 100;

  if (totalPercentage !== 100) {
    this.toastr.error(
      'Total supplier percentages must equal 100%. ' +
      'Current total: ' +
      totalPercentage +
      '%'
    );

    return;
  }

  /*
   * Keep all supplier percentages, including zero.
   * The existing API may expect the complete supplier list.
   */
  this.supplierPercent = supplierPercentages;

  /*
   * RESOURCE ASSIGNMENT
   */
  if ( !this.byBoq && !this.byGroup ) 
  {
    const resourceIds: string[] = [];

    /*
     * Do not use level.items here.
     *
     * GetComparisonSheet returns:
     *
     * C
     *   -> groupingLevels
     *       -> groupingResources
     */
    (this.CurrentLevelList || [])
      .forEach(currentLevel => {

        (currentLevel?.groupingLevels || [])
          .forEach(level => {

            (level?.groupingResources || [])
              .forEach(resource => {

                if (
                  !resource ||
                  !resource.isChecked
                ) {
                  return;
                }

                const resourceId =
                  String(
                    resource.resourceSeq || ''
                  ).trim();

                if (!resourceId) {
                  console.error(
                    'Selected resource has no resourceSeq:',
                    resource
                  );

                  return;
                }

                if (
                  resourceIds.indexOf(
                    resourceId
                  ) === -1
                ) {
                  resourceIds.push(
                    resourceId
                  );
                }
              });
          });
      });

    /*
     * Keep compatibility with selectedResources,
     * but only add valid string IDs.
     */
    (this.selectedResources || [])
      .forEach(resourceIdValue => {

        const resourceId =
          String(
            resourceIdValue || ''
          ).trim();

        if (
          resourceId &&
          resourceIds.indexOf(
            resourceId
          ) === -1
        ) {
          resourceIds.push(
            resourceId
          );
        }
      });

    if (resourceIds.length === 0) {
      this.toastr.warning(
        'You must select at least one resource.'
      );

      return;
    }

    const resourceItems:
      ressourceItem[] =
        resourceIds.map(
          resourceId => ({
            resId:
              resourceId
          })
        );

    const request:
      AssignSuppliertRes = {
        supplierPercentList:          supplierPercentages,
        supplierResItemList:          resourceItems
      };

    console.log(      'Assign resource request:',      request    );

    this.isAssigningSupplierList =      true;

    this.packageComparisonService.AssignSupplierListRessourceList(this.packageId, true, request, CostConn)
      .subscribe({
        next: (data: any) => {

          this.isAssigningSupplierList = false;

          if (data) {
            this.supplierPercent = [];
            this.selectedResources = [];

            const checkAllResources =
              document.getElementById(
                'selectAllResources'
              ) as HTMLInputElement | null;

            if (checkAllResources) {
              checkAllResources.checked =
                false;
            }

            const checkAllByItem =
              document.getElementById(
                'selectAllResourcesByItem'
              ) as HTMLInputElement | null;

            if (checkAllByItem) {
              checkAllByItem.checked =
                false;
            }

            this.onSearch();
            
            this.toastr.success('Resources assigned successfully.');
            $('#assignPackageModal').modal('hide');

          } 
          else 
          {
            this.toastr.error('Resource assignment failed.');
          }
        },

        error: (error: any) => {

          this.isAssigningSupplierList = false;

          console.error(
            'Resource assignment API error:',
            error
          );

          this.toastr.error(
            error?.error?.message ||
            error?.message ||
            'Resource assignment failed.'
          );
        }
      });

    return;
  }

  /*
   * BOQ ASSIGNMENT
   */
  if (this.byBoq && !this.byGroup) 
  {
    const selectedBoqIds =
      Array.from(
        new Set(
          (this.selectedBoqItems || [])
            .map(item =>
              String(item || '').trim()
            )
            .filter(item =>
              item.length > 0
            )
        )
      );

    if (selectedBoqIds.length === 0) {
      this.toastr.warning(
        'You must select at least one BOQ item.'
      );

      return;
    }

    const boqItems:
      boqItem[] = [];

    selectedBoqIds.forEach(
      itemNumber => {

        let matchingItem:
          GroupingBoq | null =
            null;

        (this.CurrentLevelList || [])
          .forEach(currentLevel => {

            (currentLevel?.groupingLevels || [])
              .forEach(level => {

                const currentItem =
                  (level?.items || [])
                    .find(item =>
                      item?.itemO ===
                      itemNumber
                    );

                if (currentItem) {
                  matchingItem =
                    currentItem;
                }
              });
          });

        boqItems.push({
          boqItemID:
            itemNumber,

          isNewItem:
            matchingItem?.isNewItem ||
            false,

          isAlternative:
            matchingItem?.isAlternative ||
            false
        });
      }
    );

    const request:
      AssignSuppliertBoq = {

        supplierPercentList:
          supplierPercentages,

        supplierBoqItemList:
          boqItems
      };

    this.isAssigningSupplierList =
      true;

    this.packageComparisonService
      .AssignSupplierListBoqList(
        this.packageId,
        true,
        request,
        CostConn
      )
      .subscribe({
        next: (data: any) => {

          this.isAssigningSupplierList =
            false;

          if (data) {
            this.supplierPercent = [];
            this.selectedBoqItems = [];

            this.toastr.success(
              'BOQ items assigned successfully.'
            );

            $('#assignPackageModal')
              .modal('hide');

            const checkAll =
              document.getElementById(
                'selectAllBoqItem'
              ) as HTMLInputElement | null;

            if (checkAll) {
              checkAll.checked =
                false;
            }

            this.onSearch();
          } else {
            this.toastr.error(
              'BOQ assignment failed.'
            );
          }
        },

        error: (error: any) => {

          this.isAssigningSupplierList =
            false;

          console.error(
            'BOQ assignment API error:',
            error
          );

          this.toastr.error(
            error?.error?.message ||
            error?.message ||
            'BOQ assignment failed.'
          );
        }
      });

    return;
  }

  /*
   * GROUP ASSIGNMENT
   */
  if (this.byGroup) {
    const groupIds =
      Array.from(
        new Set(
          (
            this.groupingBoqGroupList ||
            []
          )
            .filter(group =>
              group?.isChecked
            )
            .map(group =>
              Number(group.id)
            )
            .filter(groupId =>
              !isNaN(groupId) &&
              groupId > 0
            )
        )
      );

    if (groupIds.length === 0) {
      this.toastr.warning(
        'You must select at least one group.'
      );

      return;
    }

    const groups:
      Group[] =
        groupIds.map(
          groupId => ({
            id:
              groupId
          })
        );

    const request:
      AssignSupplierGroup = {

        supplierPercentList:
          supplierPercentages,

        supplierGroupList:
          groups
      };

    this.isAssigningSupplierList =
      true;

    this.packageComparisonService
      .AssignSupplierListGroupList(
        this.packageId,
        this.byBoq,
        true,
        request,
        CostConn
      )
      .subscribe({
        next: (data: any) => {

          this.isAssigningSupplierList =
            false;

          if (data) {
            this.supplierPercent = [];
            this.selectedGroups = [];

            this.toastr.success(
              'Groups assigned successfully.'
            );

            $('#assignPackageModal')
              .modal('hide');

            const checkAll =
              document.getElementById(
                'selectAllGroups'
              ) as HTMLInputElement | null;

            if (checkAll) {
              checkAll.checked =
                false;
            }

            this.onSearch();
            this.getByGroup();
          } else {
            this.toastr.error(
              'Group assignment failed.'
            );
          }
        },

        error: (error: any) => {

          this.isAssigningSupplierList =
            false;

          console.error(
            'Group assignment API error:',
            error
          );

          this.toastr.error(
            error?.error?.message ||
            error?.message ||
            'Group assignment failed.'
          );
        }
      });

    return;
  }

  this.toastr.error(
    'Unsupported assignment mode.'
  );
}


OpenAssignModal() {
    //console.log(this.SupplierPackagesList);
    for (let index = 0; index < this.SupplierPackagesList.length; index++) {
      var input = document.getElementById(
        'valueInput' + index
      ) as HTMLInputElement;
      input.value = '0';
    }
    $('#assignPackageModal').modal('show');
  }

  OpenAssignInputs() {
    this.show = true;
  }

  CloseSendEmailModal() {
    $('#modalEmail').modal('hide');
  }

  get f() {
    return this.formEmailTemplate.controls;
  }

  openSendEmailModal() {
    this.formEmailSubmitted = false;
    this.topManagementAttachements = [];
    this.listCC = [];
    this.formEmailTemplate = this.formBuilder.group({
      selectedTopManagementList: [null, Validators.required],
      listCC: [[], []],
      //language: [null, Validators.required],
      template: [null, Validators.required],
    });

    this.topManagementAttachement = null;
    //this.emailTemplate = "";
    //this.getEmailTemplate();

    this.getManagementEmail();

    $('#modalEmail').modal('show');
    this.getEmailTemplate('0');
  }

  onLanguageChange(event: any) {
    let select = event.target as HTMLInputElement;
    let lang = select.value;
    if (lang) {
      this.getEmailTemplate(lang);
    } else {
      this.f.template.setValue('');
    }
  }

  getEmailTemplate(lang: string) {
    let CostConn = this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => {});

    this.packageSupplierService
      .GetEmailTemplate(lang, this.packageId, '', '')
      .subscribe((data) => {
        this.f.template.setValue(data?.etContent);
      });
  }

  getManagementEmail() {
    let CostConn = this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => {});

    this.selectedTopManagementList = [];
    this.packageComparisonService.getManagementEmail('').subscribe((data) => {
      this.topManagementList = data;
    });
  }

  generatePDF() {
    let data = document.getElementsByClassName(
      'table-comparison'
    )[0] as HTMLTableElement;
    this.generatingFile = true;
    html2canvas(data).then((canvas) => {
      // Few necessary setting options
      this.generatingFile = false;
      let imgWidth = 208;
      let pageHeight = 295;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      const contentDataURL = canvas.toDataURL('image/gif');
      let pdf = new jsPDF('p', 'mm', 'a4', true); // A4 size page of PDF
      let position = 0;
      pdf.addImage(contentDataURL, 'GIF', 0, position, imgWidth, imgHeight);
      pdf.save(new Date().toLocaleDateString('en-UK') + '.pdf'); // Generated PDF
    });
  }

  generateExcel() {
    let CostConn = this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => {});

    this.generatingFile = true;
    if (!this.byGroup) {
      if (!this.byBoq) {
        this.packageComparisonService
          .getComparisonSheet_Excel(
            this.packageId,
            this.SearchInput,
            this.packSuppId,
            this.costDB,
            CostConn
          )
          .subscribe((data) => {
            if (data) {
              //this.spinner.hide();
              this.generatingFile = false;

              let a = document.createElement('a');
              a.id = 'downloader';
              a.target = '_blank';
              a.style.visibility = 'hidden';
              document.body.appendChild(a);
              a.href =
                environment.baseApiUrl +
                'api/SupplierPackages/DownloadFile?filename=' +
                data;
              a.click();
            }
          });
      } else {
        this.packageComparisonService
          .GetComparisonSheetByBoq_Excel(this.packageId,this.SearchInput,this.packSuppId,this.costDB,CostConn,this.cGroup).subscribe((data) => {
            if (data) {
              //this.spinner.hide();
              this.generatingFile = false;

              let a = document.createElement('a');
              a.id = 'downloader';
              a.target = '_blank';
              a.style.visibility = 'hidden';
              document.body.appendChild(a);
              a.href =
                environment.baseApiUrl +
                'api/SupplierPackages/DownloadFile?filename=' +
                data;
              a.click();
            }
          });
      }
    } else {
      if (!this.byBoq) {
        this.packageComparisonService
          .getComparisonSheetResourcesByGroup_Excel(
            this.packageId,
            this.SearchInput,
            this.packSuppId,
            this.costDB,
            CostConn
          )
          .subscribe((data) => {
            if (data) {
              //this.spinner.hide();
              this.generatingFile = false;

              let a = document.createElement('a');
              a.id = 'downloader';
              a.target = '_blank';
              a.style.visibility = 'hidden';
              document.body.appendChild(a);
              a.href =
                environment.baseApiUrl +
                'api/SupplierPackages/DownloadFile?filename=' +
                data;
              a.click();
            }
          });
      } else {
        this.packageComparisonService
          .getComparisonSheetBoqByGroup_Excel(
            this.packageId,
            this.SearchInput,
            this.packSuppId,
            this.costDB,
            CostConn
          )
          .subscribe((data) => {
            if (data) {
              //this.spinner.hide();
              this.generatingFile = false;

              let a = document.createElement('a');
              a.id = 'downloader';
              a.target = '_blank';
              a.style.visibility = 'hidden';
              document.body.appendChild(a);
              a.href =
                environment.baseApiUrl +
                'api/SupplierPackages/DownloadFile?filename=' +
                data;
              a.click();
            }
          });
      }
    }
  }

  generateSupplierContract() {
    let CostConn = this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => {});

    if (!this.selectedSupplier) {
      this.toastr.error('Please select a supplier');
      return;
    }

    this.packageComparisonService.generateSuppliersContractsExcel(this.packageId, this.SearchInput, this.packSuppId,
        this.costDB, CostConn,this.cGroup ).subscribe((res) => {
        if (res) {
          let a = document.createElement('a');
          a.id = 'downloader';
          a.target = '_blank';
          a.style.visibility = 'hidden';
          document.body.appendChild(a);
          a.href =
            environment.baseApiUrl +
            'api/RevisionDetails/DownloadFile?filename=' +
            res;
          a.click();
        } else {
          this.toastr.error('Error Downloading File');
        }
      });
  }

  CloseContractModal() {
    $('#generateContractModal').modal('hide');
  }

  openGenerateContract() {
    let CostConn = this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => {});
    this.generatingContract = true;

    this.packageComparisonService
      .generateSuppliersContractsExcel(
        this.packageId,
        this.SearchInput,
        this.packSuppId,
        this.costDB,
        CostConn,this.cGroup
      )
      .subscribe((res) => {
        this.generatingContract = false;
        if (res) {
          let a = document.createElement('a');
          a.id = 'downloader';
          a.target = '_blank';
          a.style.visibility = 'hidden';
          document.body.appendChild(a);
          let arr: string[] = res;
          arr.forEach((path) => {
            a.href =
              environment.baseApiUrl +
              'api/RevisionDetails/DownloadFile?filename=' +
              path;
            a.click();
          });
        } else {
          this.toastr.error('Error Downloading File');
        }
      });
  }

  sendEmail() {
    let CostConn = this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => {});
    this.formEmailSubmitted = true;

    if (this.formEmailTemplate.invalid) {
      this.toastr.error('Fields are required', '');
      return;
    }

    /*if(this.topManagementAttachements.length == 0)
      {
        this.toastr.error('Please add your attachement', '');
          return;
      }*/

    this.sendingEmail = true;
    let topManagementTemplate: TopManagementTemplate = {
      packageId: this.packageId,
      topManagements: this.f.selectedTopManagementList?.value,
      template: this.f.template?.value,
      listCC: this.f.listCC.value,
      userName: this.loginService.userValue?.usrId,
    };

    let files: File[] = [];
    this.topManagementAttachements.forEach((file) => {
      files.push(file.file);
    });

    this.packageComparisonService
      .sendCompToManagement(topManagementTemplate, files, CostConn)
      .subscribe((data) => {
        this.sendingEmail = false;
        if (data) {
          this.toastr.success('Email sent successfully', '');
          this.CloseSendEmailModal();
        }
      });
  }

  removeAttachement(index: number) {
    this.topManagementAttachements.splice(index, 1);
  }

  addAttachement() {
    this.topManagementAttachements.push({ id: 0, file: null });
  }

  onFileSelect(event: any, index: number) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.topManagementAttachements[index].file = file;
    } else {
      this.topManagementAttachements[index].file = null;
    }
  }

  saveByQty() {
    let CostConn = this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => {});

    if (!this.byBoq && !this.byGroup) {
      this.supplierResrouces = [];
      this.supplierResourceQty = [];
      let oneResourceChecked = false;
      let qtyIsValid = true;
      this.CurrentLevelList.forEach((cLevel) => {
        cLevel.groupingLevels.forEach((level) => {
          level.groupingResources.forEach((resource: GroupingResource, index: any) => {
            if (resource.isChecked) {
              oneResourceChecked = true;
              let resourceId = resource.boqSeq;
              let totalQty = 0;
              let sups = resource.groupingPackageSuppliersPrices;
              resource.validPerc = true;
              this.supplierResourceQty = [];
              sups.forEach((sup, j) => {
                if (sup.supplierName != 'Ideal') {
                  totalQty += sup.assignedQty;
                }
                this.supplierResourceQty.push({
                  supID: sup.supplierId,
                  qty: sup.assignedQty,
                });
              });

              if (totalQty != resource.qty) {
                qtyIsValid = false;
                resource.validPerc = false;
              }

              const newSupplierResource: SupplierResrouces = {
                resourceID: resourceId,
                supplierPercents: [],
                supplierQtys: this.supplierResourceQty,
                isAlternative: false,
                isNewItem: false,
              };
              this.supplierResrouces.push(newSupplierResource);
            }
          });
        });
      });

      if (oneResourceChecked) {
        if (!qtyIsValid) {
          this.toastr.error(
            'Sum of quantities should be less then or equals to the resource quantity'
          );
          this.supplierResrouces = [];
          this.supplierResourceQty = [];
          qtyIsValid = true;
        } else {
          this.isAssigningSupplierRessource = true;
          this.packageComparisonService
            .AssignSupplierRessource(
              this.packageId,
              false,
              this.supplierResrouces,
              CostConn
            )
            .subscribe((data) => {
              this.isAssigningSupplierRessource = false;
              if (data) {
                this.supplierResrouces = [];
                this.supplierResourceQty = [];
                this.selectedResources = [];
                this.toastr.success('Assigned Successfully');
                let checkAll = document.getElementById(
                  'selectAllResourcesByItem'
                ) as HTMLInputElement;
                checkAll.checked = false;
                this.onSearch();
                this.Cancel();
              }
            });
        }
      } 
      else {
        this.toastr.warning('You must selected at least one resource.');
      }
    } else if (this.byBoq && !this.byGroup) {
      //byBoq only
      this.supplierBoq = [];
      this.supplierBoqQty = [];
      let oneItemChecked = false;
      let qtyIsValid = true;
      //AH042024
      this.CurrentLevelList.forEach((cLevel) => {
        cLevel.groupingLevels.forEach((level) => {
          level.items.forEach((boq: GroupingBoq, i: any) => {
            // this.comparisonList.forEach((boq : GroupingBoq, i : any)=>{
            //AH042024
            if (boq.isChecked) {
              oneItemChecked = true;
              let itemO = boq.itemO;
              let isNew = boq.isNewItem;
              let isAlternative = boq.isAlternative;
              let totalQty = 0;
              let sups = boq.groupingPackageSuppliersPrices;
              boq.validPerc = true;
              this.supplierBoqQty = [];
              sups.forEach((sup, j) => {
                if (sup.supplierName != 'Ideal') {
                  totalQty += sup.assignedQty;
                }
                if (totalQty <= boq.quotationQty) {
                  this.supplierBoqQty.push({
                    supID: sup.supplierId,
                    qty: sup.assignedQty,
                  });
                }
              });

              //alert(totalPerc);
              if (totalQty != boq.quotationQty) {
                qtyIsValid = false;
                boq.validPerc = false;
              }

              const newSupplierBoq: SupplierBOQ = {
                boqItemID: itemO,
                supplierPercents: [],
                supplierQtys: this.supplierBoqQty,
                isAlternative: isAlternative,
                isNewItem: isNew,
              };
              this.supplierBoq.push(newSupplierBoq);
            }
          });
        });
      });

      if (oneItemChecked) {
        if (!qtyIsValid) {
          this.toastr.error(
            'Sum of quantities should be less then or equals to the item quantity'
          );
          this.supplierBoq = [];
          this.supplierBoqQty = [];
          qtyIsValid = true;
        } else {
          this.isAssigningSupplierBoq = true;
          this.packageComparisonService
            .AssignSupplierBOQ(
              this.packageId,
              false,
              this.supplierBoq,
              CostConn
            )
            .subscribe((data) => {
              this.isAssigningSupplierBoq = false;
              if (data) {
                this.supplierResrouces = [];
                this.supplierBoqQty = [];
                this.selectedBoqItems = [];
                this.toastr.success('Assigned Successfully');
                let checkAll = document.getElementById(
                  'selectAllBoqItem'
                ) as HTMLInputElement;
                checkAll.checked = false;
                this.onSearch();
                this.Cancel();
              }
            });
        }
      } else {
        this.toastr.warning('You must selected at least one item');
      }
    } else if (this.byGroup) {
      Swal.fire({
        title: 'You are about to overwrite the values!',
        text: 'Are you sure you want to proceed? Please confirm',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Proceed',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.value) {
          let oneGroupChecked = false;
          let qtyIsValid = true;
          this.supplierGroups = [];
          this.supplierGroupQty = [];
          this.groupingBoqGroupList.forEach(
            (group: GroupingBoqGroup, i: number) => {
              if (group.isChecked) {
                oneGroupChecked = true;
                let groupId = group.id;
                let totalQty = 0;
                let sups = group.groupingPackageSuppliersPrices;

                group.validPerc = true;
                this.supplierGroupQty = [];
                sups.forEach((sup, j) => {
                  totalQty += sup.assignedQty;
                  this.supplierGroupQty.push({
                    supID: sup.supplierId,
                    qty: sup.assignedQty,
                  });
                });

                const newSupplierGroups: SupplierGroups = {
                  groupId: groupId,
                  supplierPercents: [],
                  supplierQtys: this.supplierGroupQty,
                };
                this.supplierGroups.push(newSupplierGroups);
              }
            }
          );

          if (oneGroupChecked) {
            if (!qtyIsValid) {
              this.toastr.error(
                'Sum of quantities should be less then or equals to the group quantity'
              );
              this.supplierGroups = [];
              this.supplierGroupQty = [];
              qtyIsValid = true;
            } else {
              this.isAssigningSupplierGroup = true;
              this.packageComparisonService
                .AssignSupplierGroup(
                  this.packageId,
                  this.byBoq,
                  false,
                  this.supplierGroups,
                  CostConn
                )
                .subscribe((data) => {
                  this.isAssigningSupplierGroup = false;
                  if (data) {
                    this.supplierGroups = [];
                    this.supplierGroupQty = [];
                    this.selectedGroups = [];
                    this.toastr.success('Assigned Successfully');
                    let checkAll = document.getElementById(
                      'selectAllGroups'
                    ) as HTMLInputElement;
                    checkAll.checked = false;
                    this.onSearch();
                    this.getByGroup();
                    this.Cancel();
                  }
                });
            }
          } else {
            this.toastr.warning('You must select at least one group');
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          this.Cancel();
        }
      });
    }
  }

  saveNew() {
    let CostConn = this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => {});

    if (!this.byBoq && !this.byGroup) {
      this.supplierResrouces = [];
      this.supplierResourcePercent = [];
      let oneResourceChecked = false;
      let percIsValid = true;
      this.CurrentLevelList.forEach((cLevel) => {
        cLevel.groupingLevels.forEach((level) => {
          level.groupingResources.forEach((resource: GroupingResource, index: any) => {
            if (resource.isChecked) {
              oneResourceChecked = true;
              let resourceId = resource.boqSeq;
              let totalPerc = 0;
              let sups = resource.groupingPackageSuppliersPrices;
              resource.validPerc = true;
              this.supplierResourcePercent = [];
              sups.forEach((sup, j) => {
                totalPerc += sup.assignedPercentage;
                this.supplierResourcePercent.push({
                  supID: sup.supplierId,
                  percent: sup.assignedPercentage,
                });
              });

              if (totalPerc > 100 || totalPerc < 100) {
                percIsValid = false;
                resource.validPerc = false;
              }

              const newSupplierResource: SupplierResrouces = {
                resourceID: resourceId,
                supplierPercents: this.supplierResourcePercent,
                supplierQtys: [],
                isAlternative: false,
                isNewItem: false,
              };
              this.supplierResrouces.push(newSupplierResource);
            }
          });
        });
      });

      if (oneResourceChecked) {
        if (!percIsValid) {
          this.toastr.error(
            'Total percentage for each resource should be equal to 100'
          );
          this.supplierResrouces = [];
          this.supplierResourcePercent = [];
          percIsValid = true;
        } else {
          this.isAssigningSupplierRessource = true;
          this.packageComparisonService
            .AssignSupplierRessource(
              this.packageId,
              true,
              this.supplierResrouces,
              CostConn
            )
            .subscribe((data) => {
              this.isAssigningSupplierRessource = false;
              if (data) {
                this.supplierResrouces = [];
                this.supplierResourcePercent = [];
                this.selectedResources = [];
                this.toastr.success('Assigned Successfully');
                let checkAll = document.getElementById(
                  'selectAllResourcesByItem'
                ) as HTMLInputElement;
                checkAll.checked = false;
                this.onSearch();
                this.Cancel();
              }
            });
        }
      } else {
        this.toastr.warning('You must selected at least one resource');
      }
    } else if (this.byBoq && !this.byGroup) {
      //byBoq only
      this.supplierBoq = [];
      this.supplierBoqPercent = [];
      let oneItemChecked = false;
      let percIsValid = true;
      this.comparisonList.forEach((boq: GroupingBoq, i: any) => {
        if (boq.isChecked) {
          oneItemChecked = true;
          let itemO = boq.itemO;
          let totalPerc = 0;
          let sups = boq.groupingPackageSuppliersPrices;
          boq.validPerc = true;
          this.supplierBoqPercent = [];
          sups.forEach((sup, j) => {
            totalPerc += sup.assignedPercentage;
            this.supplierBoqPercent.push({
              supID: sup.supplierId,
              percent: sup.assignedPercentage,
            });
          });

          //alert(totalPerc);
          if (totalPerc > 100 || totalPerc < 100) {
            percIsValid = false;
            boq.validPerc = false;
          }

          const newSupplierBoq: SupplierBOQ = {
            boqItemID: itemO,
            supplierPercents: this.supplierBoqPercent,
            supplierQtys: [],
            isAlternative: false,
            isNewItem: false,
          };
          this.supplierBoq.push(newSupplierBoq);
        }
      });
      if (oneItemChecked) {
        if (!percIsValid) {
          this.toastr.error(
            'Total percentage for each item should be equal to 100'
          );
          this.supplierBoq = [];
          this.supplierBoqPercent = [];
          percIsValid = true;
        } else {
          this.isAssigningSupplierBoq = true;
          this.packageComparisonService
            .AssignSupplierBOQ(this.packageId, true, this.supplierBoq, CostConn)
            .subscribe((data) => {
              this.isAssigningSupplierBoq = false;
              if (data) {
                this.supplierResrouces = [];
                this.supplierBoqPercent = [];
                this.selectedBoqItems = [];
                this.toastr.success('Assigned Successfully');
                let checkAll = document.getElementById(
                  'selectAllBoqItem'
                ) as HTMLInputElement;
                checkAll.checked = false;
                this.onSearch();
                this.Cancel();
              }
            });
        }
      } else {
        this.toastr.warning('You must selected at least one item');
      }
    } else if (this.byGroup) {
      Swal.fire({
        title: 'You are about to overwrite the values!',
        text: 'Are you sure you want to proceed? Please confirm',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Proceed',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.value) {
          let oneGroupChecked = false;
          let percIsValid = true;
          this.supplierGroups = [];
          this.supplierGroupPercent = [];
          this.groupingBoqGroupList.forEach(
            (group: GroupingBoqGroup, i: number) => {
              if (group.isChecked) {
                oneGroupChecked = true;
                let groupId = group.id;
                let totalPerc = 0;
                let sups = group.groupingPackageSuppliersPrices;

                group.validPerc = true;
                this.supplierGroupPercent = [];
                sups.forEach((sup, j) => {
                  totalPerc += sup.assignedPercentage;
                  this.supplierGroupPercent.push({
                    supID: sup.supplierId,
                    percent: sup.assignedPercentage,
                  });
                });

                if (totalPerc > 100 || totalPerc < 100) {
                  percIsValid = false;
                  group.validPerc = false;
                }

                const newSupplierGroups: SupplierGroups = {
                  groupId: groupId,
                  supplierPercents: this.supplierGroupPercent,
                  supplierQtys: [],
                };
                this.supplierGroups.push(newSupplierGroups);
              }
            }
          );

          if (oneGroupChecked) {
            if (!percIsValid) {
              this.toastr.error(
                'Total percentage for each group should be equal to 100'
              );
              this.supplierGroups = [];
              this.supplierGroupPercent = [];
              percIsValid = true;
            } else {
              this.isAssigningSupplierGroup = true;
              this.packageComparisonService
                .AssignSupplierGroup(
                  this.packageId,
                  this.byBoq,
                  true,
                  this.supplierGroups,
                  CostConn
                )
                .subscribe((data) => {
                  this.isAssigningSupplierGroup = false;
                  if (data) {
                    this.supplierGroups = [];
                    this.supplierGroupPercent = [];
                    this.selectedGroups = [];
                    this.toastr.success('Assigned Successfully');
                    let checkAll = document.getElementById(
                      'selectAllGroups'
                    ) as HTMLInputElement;
                    checkAll.checked = false;
                    this.onSearch();
                    this.getByGroup();
                    this.Cancel();
                  }
                });
            }
          } else {
            this.toastr.warning('You must select at least one group');
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          this.Cancel();
        }
      });
    }
  }

  getTotalBudget() {
    let total = 0;

    if (!this.byBoq) {
      this.CurrentLevelList.forEach((cLevel) => {
        cLevel.groupingLevels.forEach((level) => {
          level.groupingResources.forEach((resource) => {
            total += resource.totalPrice;
          });
        });
      });
    } else {
      this.CurrentLevelList.forEach((cLevel) => {
        cLevel.groupingLevels.forEach((level) => {
          level.items.forEach((item) => {
            total += item.totalPrice;
          });
        });
      });
    }
    return total;
  }

  getTotalQuotation() {
    let totalQotation = 0;
    if (!this.byBoq) {
      this.CurrentLevelList.forEach((cLevel) => {
        cLevel.groupingLevels.forEach((level) => {
          level.groupingResources.forEach((resource) => {
            totalQotation += resource.quotationAmt;
          });
        });
      });
    } else {
      this.CurrentLevelList.forEach((cLevel) => {
        cLevel.groupingLevels.forEach((level) => {
          level.items.forEach((item) => {
            totalQotation += item.quotationAmt;
          });
        });
      });
    }
    // totalQotation=1;
    return totalQotation;
  }

  Cancel() {
    this.show = false;
  }

  setSupplierQty(
    event: any,
    resource: GroupingResource,
    sup: GroupingPackageSupplierPrice
  ) {
    let element = event.target as HTMLInputElement;
    this.comparisonList.forEach((boq: GroupingBoq, i: number) => {
      boq.groupingResources.forEach((res: GroupingResource, j: number) => {
        if (res.boqSeq === resource.boqSeq) {
          this.searchSupQty(Number(element.value), resource, sup);
          return;
        }
      });
    });
  }

  setSupplierPerc(
    event: any,
    resource: GroupingResource,
    sup: GroupingPackageSupplierPrice
  ) {
    let element = event.target as HTMLInputElement;
    this.comparisonList.forEach((boq: GroupingBoq, i: number) => {
      boq.groupingResources.forEach((res: GroupingResource, j: number) => {
        if (res.boqSeq === resource.boqSeq) {
          this.searchSupPerc(Number(element.value), resource, sup);
          return;
        }
      });
    });
  }

  setSupplierQtyByBoq(
    event: any,
    item: GroupingBoq,
    sup: GroupingPackageSupplierPrice
  ) {
    let element = event.target as HTMLInputElement;

    //AH042024
    this.CurrentLevelList.forEach((cLevel) => {
      cLevel.groupingLevels.forEach((level) => {
        level.items.forEach((boq: GroupingBoq, i: number) => {
          //this.comparisonList.forEach((boq : GroupingBoq,i : number)=>{
          //AH042024
          if (boq.itemO === item.itemO) {
            this.searchSupQtyByBoq(Number(element.value), item, sup);
            return;
          }
        });
      });
    });
  }

  setSupplierPercByBoq(
    event: any,
    item: GroupingBoq,
    sup: GroupingPackageSupplierPrice
  ) {
    let element = event.target as HTMLInputElement;
    this.comparisonList.forEach((boq: GroupingBoq, i: number) => {
      if (boq.itemO === item.itemO) {
        this.searchSupPercByBoq(Number(element.value), item, sup);
        return;
      }
    });
  }

  searchSupQty(
    val: number,
    resource: GroupingResource,
    sup: GroupingPackageSupplierPrice
  ) {
    resource.groupingPackageSuppliersPrices.forEach((item) => {
      if (item.supplierId === sup.supplierId) {
        item.assignedQty = val;
        return;
      }
    });
  }

  searchSupPerc(
    val: number,
    resource: GroupingResource,
    sup: GroupingPackageSupplierPrice
  ) {
    resource.groupingPackageSuppliersPrices.forEach((item) => {
      if (item.supplierId === sup.supplierId) {
        item.assignedPercentage = val;
        return;
      }
    });
  }

  searchSupPercByGroup(
    val: number,
    group: GroupingBoqGroup,
    sup: GroupingPackageSupplierPrice
  ) {
    group.groupingPackageSuppliersPrices.forEach((item) => {
      if (item.supplierId === sup.supplierId) {
        item.assignedPercentage = val;
        return;
      }
    });
  }

  searchSupQtyByGroup(
    val: number,
    group: GroupingBoqGroup,
    sup: GroupingPackageSupplierPrice
  ) {
    group.groupingPackageSuppliersPrices.forEach((item) => {
      if (item.supplierId === sup.supplierId) {
        item.assignedQty = val;
        return;
      }
    });
  }

  searchSupPercByBoq(
    val: number,
    boq: GroupingBoq,
    sup: GroupingPackageSupplierPrice
  ) {
    boq.groupingPackageSuppliersPrices.forEach((item) => {
      if (item.supplierId === sup.supplierId) {
        item.assignedPercentage = val;
        return;
      }
    });
  }

  searchSupQtyByBoq(
    val: number,
    boq: GroupingBoq,
    sup: GroupingPackageSupplierPrice
  ) {
    boq.groupingPackageSuppliersPrices.forEach((item) => {
      if (item.supplierId === sup.supplierId) {
        item.assignedQty = val;
        return;
      }
    });
  }

  toggleShow() {
    this.isShown = !this.isShown;
    this.toggleClass = this.isShown
      ? 'fa-solid fa-toggle-on'
      : 'fa-solid fa-toggle-off';
  }

  toggleQuotation() {
    this.showQuotation = !this.showQuotation;
    this.buildColumnDefs();
    if (this.gridApi) {
      this.gridApi.setColumnDefs(this.columnDefs);
      setTimeout(() => { if (this.columnApi) this.columnApi.autoSizeAllColumns(false); }, 300);
    }
  }

  // Page loading overlay: shown until both the comparison sheet and the
  // supplier total prices have been received.
  loadingComparison = false;
  loadingPrices = false;
  get isPageLoading(): boolean {
    return this.loadingComparison || this.loadingPrices;
  }

  onSearch() {
    let CostConn = this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => {});

    this.searching = true;
    this.loadingComparison = true;
    this.loadingPrices = true;
    if (!this.byBoq) {
      this.packageComparisonService
        .getComparisonSheet(this.packageId, this.SearchInput, CostConn, this.cGroup)
        .subscribe(
          (data) => {
            this.searching = false;
            this.loadingComparison = false;
            if (data) {
              this.CurrentLevelList = data;
              this.getSuppliersPrice();
              this.buildColumnDefs();
              this.buildRowData();
            } else {
              this.loadingPrices = false;
            }
          },
          () => {
            this.searching = false;
            this.loadingComparison = false;
            this.loadingPrices = false;
          }
        );
    } else {
      this.packageComparisonService
        .getComparisonSheetByBoq(this.packageId, this.SearchInput, CostConn, this.cGroup)
        .subscribe(
          (data) => {
            this.searching = false;
            this.loadingComparison = false;
            if (data) {
              this.CurrentLevelList = data;
              this.getSuppliersPrice();
              this.buildColumnDefs();
              this.buildRowData();
            } else {
              this.loadingPrices = false;
            }
          },
          () => {
            this.searching = false;
            this.loadingComparison = false;
            this.loadingPrices = false;
          }
        );
    }
  }

  selectAllBoqItems(target: any) {
    this.selectedBoqItems = [];
    let checkbox = target as HTMLInputElement;
    //AH09042024
    // this.comparisonList.forEach(item=>{
    this.CurrentLevelList.forEach((cLevel) => {
      cLevel.groupingLevels.forEach((level) => {
        level.items.forEach((item) => {
          //AH09042024
          item.isChecked = checkbox.checked;
          if (checkbox.checked) {
            this.selectedBoqItems.push(item.itemO);
            //this.show = true;//AH09042024
          } else {
            let index = this.selectedBoqItems.indexOf(item.itemO);
            this.selectedBoqItems.splice(index, 1);
            //this.show = false;//AH09042024
          }
        });
      });
    });
  }

  selectBoq(event: any, item: GroupingBoq) {
    let allCheckbox = document.getElementById(
      'selectAllBoqItem'
    ) as HTMLInputElement;
    let checkbox = event.target as HTMLInputElement;
    item.isChecked = checkbox.checked;
    let allChecked: boolean = true;

    if (checkbox.checked) {
      this.selectedBoqItems.push(item.itemO);
      // this.show = true;//AH09042024
    } else {
      let index = this.selectedBoqItems.indexOf(item.itemO);
      this.selectedBoqItems.splice(index, 1);
      //this.show = false;//AH09042024
    }

    let everythingChecked: boolean = true;
    //AH09042024
    // this.comparisonList.forEach(item=>{
    //     if(!item.isChecked)
    //     {
    //       everythingChecked = false;
    //       return;
    //     }
    // });

    this.CurrentLevelList.forEach((cLevel) => {
      cLevel.groupingLevels.forEach((level) => {
        level.items.forEach((item) => {
          if (!item.isChecked) {
            everythingChecked = false;
            return;
          }
        });
      });
    });
    //AH09042024
    allCheckbox.checked = everythingChecked;
  }

  getSuppliersPrice() {
    let CostConn = this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => {});

    this.loadingPrices = true;
    this.packageComparisonService
      .GetPackageSuppliersPrice(this.packageId, this.SearchInput, CostConn)
      .subscribe(
        (data) => {
          this.loadingPrices = false;
          if (data) {
            this.packageSuppliersPrices = data;
          }
        },
        () => {
          this.loadingPrices = false;
        }
      );
  }

  GetRESDivList() {
    let CostConn = this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => {});

    this.assignPackageService.GetRESDivList(CostConn).subscribe((data) => {
      if (data) {
        this.RESDivList = data;
        this.selectedRESDivList = data;
      }
    });
  }

  GetBOQDivList(body: any) {
    let CostConn = this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => {});

    this.assignPackageService
      .GetBOQDivList(body, CostConn)
      .subscribe((data) => {
        if (data) {
          this.BOQDivList = data;
        }
      });
  }

  GetSheetDescList() {
    let CostConn = this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => {});

    this.assignPackageService.GetSheetDescList(CostConn).subscribe((data) => {
      if (data) {
        this.SheetDescList = data;
        this.selectedSheetDescList = data;
      }
    });
  }

  GetRESTypeList(body: any) {
    let CostConn = this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => {});

    this.assignPackageService
      .GetRESTypeList(body, CostConn)
      .subscribe((data) => {
        if (data) {
          this.RESTypeList = data;
          this.selectedRESTypeList = data;
        }
      });
  }

  onSelectAllSheetDesc() {
    this.selectedSheetDescList = [];
    this.SheetDescList.forEach((item) => {
      this.selectedSheetDescList.push(item.obSheetDesc);
    });
  }

  onSelectAllRESDiv() {
    this.selectedRESDivList = [];
    this.RESDivList.forEach((item) => {
      this.selectedRESDivList.push(item.boqDiv);
    });
  }

  onSelectAllBOQDiv() {
    this.selectedBOQDivList = [];
    this.BOQDivList.forEach((item) => {
      this.selectedBOQDivList.push(item.sectionO);
    });
  }

  onSelectAllRESType() {
    this.selectedRESTypeList = [];
    this.RESTypeList.forEach((item) => {
      this.selectedRESTypeList.push(item.boqCtg);
    });
  }

  selectAllItemsByResource(target: any) {
    this.selectedResources = [];
    let checkbox = target as HTMLInputElement;
    this.comparisonList.forEach((item) => {
      item.isChecked = checkbox.checked;
      item.groupingResources.forEach((resource, index) => {
        resource.isChecked = checkbox.checked;
        if (checkbox.checked) {
          this.selectedResources.push(resource.resourceSeq);
        } else {
          let index = this.selectedResources.indexOf(resource.resourceSeq);
          this.selectedResources.splice(index, 1);
        }
      });
    });

    //console.log(this.selectedResources);
  }

selectAllResources(
  target: any
): void {

  const checkbox =
    target as HTMLInputElement;

  this.selectedResources = [];

  (this.CurrentLevelList || [])
    .forEach(currentLevel => {

      (currentLevel?.groupingLevels || [])
        .forEach(level => {

          /*
           * Resource view stores resources directly
           * under GroupingLevelModel.GroupingResources.
           */
          (level?.groupingResources || [])
            .forEach(resource => {

              if (!resource) {
                return;
              }

              resource.isChecked =
                checkbox.checked;

              const resourceId =
                String(
                  resource.resourceSeq || ''
                ).trim();

              if (
                checkbox.checked &&
                resourceId &&
                this.selectedResources
                  .indexOf(resourceId) === -1
              ) {
                this.selectedResources.push(
                  resourceId
                );
              }
            });
        });
    });
}

  selectResourcesByItem(event: any, item: GroupingBoq) {
    let allCheckbox = document.getElementById(
      'selectAllResourcesByItem'
    ) as HTMLInputElement;
    let checkbox = event.target as HTMLInputElement;
    item.isChecked = checkbox.checked;
    item.groupingResources.forEach((resource, index) => {
      resource.isChecked = checkbox.checked;
      if (checkbox.checked) {
        this.selectedResources.push(resource.resourceSeq);
      } else {
        let index = this.selectedResources.indexOf(resource.resourceSeq);
        this.selectedResources.splice(index, 1);
      }
    });

    let allChecked: boolean = true;
    this.comparisonList.forEach((item) => {
      if (!item.isChecked) {
        allChecked = false;
        return;
      }
    });

    allCheckbox.checked = allChecked;
    //console.log(this.selectedResources);
  }

  selectResource(event: any, resource: GroupingResource, item: GroupingBoq) {
    let allCheckbox = document.getElementById(
      'selectAllResourcesByItem'
    ) as HTMLInputElement;
    let checkbox = event.target as HTMLInputElement;
    resource.isChecked = checkbox.checked;
    let allChecked: boolean = true;
    item.groupingResources.forEach((res) => {
      if (!res.isChecked) {
        allChecked = false;
        return;
      }
    });

    item.isChecked = allChecked;

    if (checkbox.checked) {
      this.selectedResources.push(resource.resourceSeq);
    } else {
      let index = this.selectedResources.indexOf(resource.resourceSeq);
      this.selectedResources.splice(index, 1);
    }

    let everythingChecked: boolean = true;
    this.comparisonList.forEach((item) => {
      item.groupingResources.forEach((res) => {
        if (!res.isChecked) {
          everythingChecked = false;
          return;
        }
      });
    });

    allCheckbox.checked = everythingChecked;
    //console.log(this.selectedResources);
  }

  selectResourceNeo(
  event: any,
  resource: GroupingResource
): void {

  const checkbox =
    event.target as HTMLInputElement;

  resource.isChecked =
    checkbox.checked;

  const resourceId =
    String(
      resource.resourceSeq || ''
    ).trim();

  if (!resourceId) {
    console.error(
      'Resource has no resourceSeq:',
      resource
    );

    checkbox.checked = false;
    resource.isChecked = false;

    this.toastr.error(
      'The selected resource has no Resource Sequence.'
    );

    return;
  }

  if (checkbox.checked) {

    if (
      this.selectedResources.indexOf(
        resourceId
      ) === -1
    ) {
      this.selectedResources.push(
        resourceId
      );
    }
  } else {

    this.selectedResources =
      this.selectedResources.filter(
        id => id !== resourceId
      );
  }

  const allCheckbox =
    document.getElementById(
      'selectAllResources'
    ) as HTMLInputElement | null;

  if (allCheckbox) {

    let everythingChecked =
      true;

    (this.CurrentLevelList || [])
      .forEach(currentLevel => {

        (currentLevel?.groupingLevels || [])
          .forEach(level => {

            (level?.groupingResources || [])
              .forEach(currentResource => {

                if (!currentResource?.isChecked) {
                  everythingChecked = false;
                }
              });
          });
      });

    allCheckbox.checked =
      everythingChecked;
  }
}


  isAssigned(event: any) {
    return false;
  }

  //AH05032024
  excludBoq(event: any, item: GroupingBoq) {
    let CostConn = this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => {});
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
    this.packageComparisonService
      .excludBoq(
        this.packageId,
        item.itemO,
        item.isNewItem,
        item.isExcluded,
        CostConn
      )
      .subscribe((data) => {
        this.onSearch();
      });
  }

  excludRessource(event: any, boqRes: GroupingResource) {
    let CostConn = this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => {});

    let checkbox = event.target as HTMLInputElement;
    boqRes.isExcluded = checkbox.checked;

    this.packageComparisonService
      .excludRessource(
        this.packageId,
        boqRes.boqSeq,
        boqRes.isNewItem,
        boqRes.isAlternative,
        boqRes.isExcluded,
        CostConn
      )
      .subscribe((data) => {
        this.onSearch();
      });
  }
  //AH05032024

  changeCLevelGrouping(level: string) {
    this.cGroup = level;
    this.onSearch();
  }

  goBack() {
    this.router.navigate(['/package-supplier', this.packageId]);
  }

  // ── AG Grid ──────────────────────────────────────────────────────────────

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  onFirstDataRendered() {
    if (this.columnApi) {
      this.columnApi.autoSizeAllColumns(false);
    }
    this.computeFooterLayout();
  }

  private getSupplierListFromData(): any[] {
    if (!this.CurrentLevelList?.length) return [];
    // walk levels until we find one with actual rows
    for (const cLevel of this.CurrentLevelList) {
      for (const level of (cLevel?.groupingLevels || [])) {
        if (this.byBoq) {
          const sups = level?.items?.[0]?.groupingPackageSuppliersPrices;
          if (sups?.length) return sups;
        } else {
          const sups = level?.groupingResources?.[0]?.groupingPackageSuppliersPrices;
          if (sups?.length) return sups;
        }
      }
    }
    return [];
  }

  buildColumnDefs() {
    const suppliers = this.getSupplierListFromData();
    const cols: (ColDef | ColGroupDef)[] = [];

    // Selection + description columns (frozen to left)
    if (this.byBoq) {
      cols.push({
        field: '_sel',
        headerName: '',
        width: 30,
        minWidth: 30,
        maxWidth: 40,
        pinned: 'left',
        lockPinned: true,
        suppressAutoSize: true,
        suppressSizeToFit: true,
        checkboxSelection: (params) => params.data?._rowType === 'data',
        headerCheckboxSelection: true,
        cellRenderer: () => '',
      });
      cols.push({
        field: 'boqRef',
        headerName: 'BOQ #',
        width: 50,
        minWidth: 50,
        maxWidth: 140,
        pinned: 'left',
        lockPinned: true,
        cellRenderer: this._descCellRenderer,
      });
      cols.push({
        field: 'itemDescription',
        headerName: 'Item Description',
        width: 200,
        maxWidth: 300,
        pinned: 'left',
        lockPinned: true,
        cellRenderer: this._descCellRenderer,
        tooltipValueGetter: (p: any) => p.data?._rowType === 'data' ? p.value : null,
      });
    } else {
      cols.push({
        field: '_sel',
        headerName: '',
        width: 30,
        minWidth: 30,
        maxWidth: 40,
        pinned: 'left',
        lockPinned: true,
        suppressAutoSize: true,
        suppressSizeToFit: true,
        checkboxSelection: (params) => params.data?._rowType === 'data',
        headerCheckboxSelection: true,
        cellRenderer: () => '',
      });
      cols.push({
        field: 'resourceDescription',
        headerName: 'Resource Description',
        width: 250,
        maxWidth: 300,
        pinned: 'left',
        lockPinned: true,
        cellRenderer: this._descCellRenderer,
        tooltipValueGetter: (p: any) => p.data?._rowType === 'data' ? p.value : null,
      });
    }

    // Exclude
    cols.push({
      field: 'isExcluded',
      headerName: 'Excl.',
      width: 40,     minWidth: 40,        maxWidth: 70,
      cellRenderer: (params: any) => {
        if (params.data?._rowType !== 'data') return '';
        const chk = params.data.isExcluded ? 'checked' : '';
        return `<input type="checkbox" ${chk} style="cursor:pointer;margin-top:4px;" />`;
      },
    });

    // Unit
    cols.push({ field: 'unit', headerName: 'Unit', width: 60    ,     minWidth: 60,
        maxWidth: 70 });

    // Budget group
    // byBoq: narrow columns (autoSizeAllColumns can shrink but capped by maxWidth)
    const bqW    = this.byBoq ? 60 : 80;
    const bqWMax = this.byBoq ? 95 : 90;
    const bqWT    = this.byBoq ? 55 : 70;
    const bqWTMax = 160;   // total columns: wide enough for grand totals (see ensureTotalColumnsFit)
    cols.push({
      headerName: 'Budget',
      headerClass: 'budget-header',
      children: [
        { field: 'qty',        headerName: 'Final Qty', minWidth: bqW,  maxWidth: bqWMax,  headerClass: 'sup-group-start', cellStyle: { borderLeft: '3px solid #444', textAlign: 'right' }, valueFormatter: (p) => this.fmtNum(p.value, 2), type: 'numericColumn' },
        { field: 'unitPrice',  headerName: 'U. Price',  minWidth: bqW,  maxWidth: bqWMax,  cellStyle: { textAlign: 'right' }, valueFormatter: (p) => this.fmtNum(p.value, 2), type: 'numericColumn' },
        { field: 'totalPrice', headerName: 'T. Budget', minWidth: bqWT, maxWidth: bqWTMax, cellStyle: { textAlign: 'right' }, valueFormatter: (p) => this.fmtNum(p.value, 0), type: 'numericColumn' },
      ],
    });

    // Quotation group (conditionally included)
    if (this.showQuotation) {
      cols.push({
        headerName: 'Quotation',
        headerClass: 'quotation-header',
        children: [
          { field: 'quotationQty', headerName: 'Bill Qty', minWidth: bqW, maxWidth: bqWMax, headerClass: 'sup-group-start', cellStyle: { borderLeft: '3px solid #444', textAlign: 'right' }, valueFormatter: (p) => this.fmtNum(p.value, 2), type: 'numericColumn' },
          { field: 'quotationAmt', headerName: 'Price',    minWidth: bqW, maxWidth: bqWTMax, cellStyle: { textAlign: 'right' }, valueFormatter: (p) => this.fmtNum(p.value, (p.data?._rowType === 'pinnedTotal' || p.data?._rowType === 'subtotal') ? 0 : 2), type: 'numericColumn' },
        ],
      });
    }

    // Per-supplier column groups
    suppliers.forEach((sup, i) => {
      const isIdeal = sup.supplierName === 'Ideal';
      const id = sup.supplierId;
      const header = isIdeal
        ? 'Ideal'
        : `${sup.supplierName} (${this.fmtDate(sup.lastRevisionDate)})`;
      const colorClass = `sup-color-${i % 8}`;

      const children: ColDef[] = [];

      // Qty As. — first column in each supplier group: separator via inline borderLeft
      children.push({
        field: `sup_${id}_assignedQty`,
        headerName: isIdeal ? 'Bud. Qty' : 'Qty As.',
        minWidth: bqW, maxWidth: bqWMax,
        headerClass: 'sup-group-start',
        editable: (params) => !isIdeal && params.data?._rowType === 'data',
        type: 'numericColumn',
        valueFormatter: (p) => {
          if (p.data?._rowType !== 'data') return '';
          if (isIdeal) return this.fmtNum(p.data?.qty, 2);
          return this.fmtNum(p.value, 2);
        },
        cellStyle: (params) => {
          const base: any = { borderLeft: '3px solid #444', textAlign: 'right' };
          if (!isIdeal && params.data?._rowType === 'data') {
            return { ...base, backgroundColor: '#fffde7' };
          }
          return base;
        },
      });

      // Final U.P.
      children.push({
        field: `sup_${id}_finalUP`,
        headerName: 'Final U.P.',
        minWidth: bqW, maxWidth: bqWMax,
        type: 'numericColumn',
        cellStyle: { textAlign: 'right' },
        valueFormatter: (p) => {
          if (p.data?._rowType !== 'data') return '';
          return this.fmtNum(p.value, 2);
        },
        cellClass: (params) =>
          params.data?.[`sup_${id}_isCalculated`] ? 'calculated-supplier-price' : '',
        tooltipValueGetter: (p: any) =>
          p.data?._rowType === 'data' && p.data?.[`sup_${id}_isCalculated`]
            ? (p.data?.[`sup_${id}_calcFrom`]
                ? 'Calculated from the maximum price provided by ' + p.data[`sup_${id}_calcFrom`]
                : 'Calculated from the maximum price provided by the other suppliers')
            : null,
      });

      // T. Price
      children.push({
        field: `sup_${id}_totalPrice`,
        headerName: 'T. Price',
        minWidth: bqWT, maxWidth: bqWTMax,
        type: 'numericColumn',
        cellStyle: { textAlign: 'right' },
        valueFormatter: (p) => {
          if (p.data?._rowType === 'levelHeader') return '';
          return this.fmtNum(p.value, 0);
        },
        cellClass: (params) =>
          params.data?.[`sup_${id}_missed`] === 1 ? 'text-danger' : '',
        tooltipValueGetter: (p: any) =>
          p.data?._rowType === 'data' && p.data?.[`sup_${id}_missed`] === 1
            ? 'Missing price by this supplier'
            : null,
      });

      cols.push({ headerName: header, headerClass: colorClass, children });
    });

    this.columnDefs = cols;
  }

  private _descCellRenderer = (params: any) => {
    if (params.data?._rowType === 'levelHeader') {
      return `<strong style="color:#333">${params.data._levelName || ''}</strong>`;
    }
    if (params.data?._rowType === 'subtotal' || params.data?._rowType === 'pinnedTotal') {
      return `<strong>${params.value || ''}</strong>`;
    }
    return params.value || '';
  };

  buildRowData() {
    try {
      const rows: any[] = [];

      (this.CurrentLevelList || []).forEach((cLevel) => {
        (cLevel?.groupingLevels || []).forEach((level, ind) => {

          // Level name header (byBoq only)
          if (this.byBoq) {
            rows.push({
              _rowType: 'levelHeader',
              _levelName: level.levelName || 'From Drawing',
              boqRef: '',
              itemDescription: level.levelName || 'From Drawing',
            });
          }

          // Data rows
          if (!this.byBoq) {
            (level?.groupingResources || []).forEach((resource) => {
              const row: any = {
                _rowType: 'data',
                _rowRef: resource,
                isChecked: resource.isChecked || false,
                isExcluded: resource.isExcluded || false,
                isAlternative: resource.isAlternative || false,
                isNewItem: resource.isNewItem || false,
                resourceDescription: resource.resourceDescription,
                unit: resource.unit,
                qty: resource.qty,
                unitPrice: resource.unitPrice,
                totalPrice: resource.totalPrice,
                quotationQty: resource.quotationQty,
                quotationAmt: resource.quotationAmt,
              };
              (resource.groupingPackageSuppliersPrices || []).forEach((sup) => {
                const id = sup.supplierId;
                row[`sup_${id}_assignedQty`] = sup.assignedQty;
                row[`sup_${id}_finalUP`] = +(sup.uPriceAfterDiscount * sup.exchRateNow).toFixed(2);
                row[`sup_${id}_totalPrice`] = +(sup.uPriceAfterDiscount * sup.exchRateNow * resource.quotationQty).toFixed(0);
                row[`sup_${id}_isCalculated`] = sup.isCalculatedPrice;
                row[`sup_${id}_calcFrom`] = (sup as any).calculatedFromSupplier;
                row[`sup_${id}_missed`] = sup.missedPrice;
              });
              rows.push(row);
            });

            // Subtotal after each level
            const subRow: any = {
              _rowType: 'subtotal',
              resourceDescription: level.c_Description,
              totalPrice: level.c_TotalBudget,
            };
            (cLevel.groupingSupplierC_Prices || []).forEach((sup) => {
              subRow[`sup_${sup.supplierId}_totalPrice`] = sup.totalPrice;
            });
            rows.push(subRow);

          } else {
            (level?.items || []).forEach((item) => {
              const row: any = {
                _rowType: 'data',
                _rowRef: item,
                _cLevelRef: cLevel,
                isChecked: item.isChecked || false,
                isExcluded: item.isExcluded || false,
                isAlternative: item.isAlternative || false,
                isNewItem: item.isNewItem || false,
                boqRef: item.itemO,
                itemDescription: item.descriptionO,
                unit: item.unit,
                qty: item.qty,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
                quotationQty: item.quotationQty,
                quotationAmt: item.quotationAmt,
              };
              (item.groupingPackageSuppliersPrices || []).forEach((sup) => {
                const id = sup.supplierId;
                row[`sup_${id}_assignedQty`] = sup.assignedQty;
                row[`sup_${id}_qty`] = sup.qty;
                row[`sup_${id}_finalUP`] = +(sup.uPriceAfterDiscount * sup.exchRateNow).toFixed(2);
                row[`sup_${id}_totalPrice`] = sup.totalPrice;
                row[`sup_${id}_isCalculated`] = sup.isCalculatedPrice;
                row[`sup_${id}_calcFrom`] = (sup as any).calculatedFromSupplier;
                row[`sup_${id}_missed`] = sup.missedPrice;
              });
              rows.push(row);
            });

            // Subtotal only for last level in cLevel
            if (ind === (cLevel.groupingLevels || []).length - 1) {
              const subRow: any = {
                _rowType: 'subtotal',
                _cLevelRef: cLevel,
                itemDescription: cLevel.c_Description,
                totalPrice: cLevel.c_TotalBudget,
              };
              (cLevel.groupingSupplierC_Prices || []).forEach((sup) => {
                subRow[`sup_${sup.supplierId}_totalPrice`] = sup.totalPrice;
              });
              rows.push(subRow);
            }
          }
        });
      });

      this.rowData = rows;
      // Dynamic height: fit content up to viewport cap
      const rowPx = 20;                      // rowHeight binding
      const headerPx = 18 + 27;             // groupHeaderHeight + headerHeight
      const pinnedPx = 20;                   // pinned bottom row
      const scrollbarPx = 18;               // horizontal scrollbar
      const calculated = rows.length * rowPx + headerPx + pinnedPx + scrollbarPx;
      const maxH = Math.max(window.innerHeight - 320, 150);
      this.gridHeight = Math.min(calculated, maxH) + 'px';

      setTimeout(() => {
        if (this.columnApi) this.columnApi.autoSizeAllColumns(false);
        this.buildPinnedRow();
      }, 300);

    } catch (err) {
      console.error('buildRowData error:', err);
    }
  }

  onCellClicked(event: CellClickedEvent) {
    if (event.data?._rowType !== 'data') return;
    if (event.colDef.field !== 'isExcluded') return;

    const newVal = !event.data.isExcluded;
    event.node.setDataValue('isExcluded', newVal);
    const ref = event.data._rowRef;

    const CostConn = this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe(() => {});

    if (this.byBoq) {
      const item = ref as GroupingBoq;
      // Update the row + Ideal amounts locally, then just save the flag (no full reload)
      this.applyBoqExclusion(event.node, item, newVal);
      const revert = (msg: string) => {
        event.node.setDataValue('isExcluded', !newVal);
        this.applyBoqExclusion(event.node, item, !newVal);
        this.toastr.error(msg);
      };
      this.packageComparisonService
        .excludBoq(this.packageId, item.itemO, item.isNewItem, newVal, CostConn)
        .subscribe(
          (ok) => { if (ok === false) revert('Could not save the exclusion of item ' + item.itemO); },
          (err) => revert(typeof err === 'string' ? err : 'Could not save the exclusion of item ' + item.itemO)
        );
    } else {
      const res = ref as GroupingResource;
      res.isExcluded = newVal;
      this.packageComparisonService
        .excludRessource(this.packageId, res.boqSeq, res.isNewItem, res.isAlternative, newVal, CostConn)
        .subscribe(() => this.onSearch());
    }
  }

  /**
   * Client-side effect of the "Excl." tick (byBoq), mirroring the server logic in
   * RevisionDetailsRepository.GetComparisonSheetByBoq:
   *  - excluded  -> Ideal Qty / Final U.P. / T. Price = 0
   *  - included  -> Ideal = lowest priced supplier (UP > 0), qty = lowest supplier qty
   * and the Ideal C subtotal, pinned Total row and footer Sub/Grand totals follow.
   */
  private applyBoqExclusion(node: any, item: GroupingBoq, excluded: boolean): void {
    item.isExcluded = excluded;
    const sups: any[] = item.groupingPackageSuppliersPrices || [];
    sups.forEach((s) => { if (s.supplierId !== 0) s.isExcluded = excluded; });

    const ideal: any = sups.find((s) => s.supplierId === 0 || s.supplierName === 'Ideal');
    if (!ideal) return;   // no supplier priced this item -> nothing for Ideal

    const oldTotal = +ideal.totalPrice || 0;
    if (excluded) {
      ideal.assignedQty = 0;
      ideal.qty = 0;
      ideal.uPriceAfterDiscount = 0;
      ideal.totalPrice = 0;
    } else {
      const priced = sups.filter((s) => s.supplierId !== 0 && s.supplierName !== 'Ideal' && (+s.uPriceAfterDiscount || 0) > 0);
      if (!priced.length) return;
      const minUP = Math.min(...priced.map((s) => +s.uPriceAfterDiscount));
      const best = priced.find((s) => +s.uPriceAfterDiscount === minUP);
      const minQty = Math.min(...priced.map((s) => +s.qty || 0));
      const exch = +best.exchRateNow || 1;
      ideal.assignedQty = best.qty;
      ideal.qty = minQty;
      ideal.exchRateNow = best.exchRateNow;
      ideal.uPriceAfterDiscount = Math.round(minUP * 100) / 100;
      ideal.totalPrice = minQty * minUP * exch;
    }

    // Row cells
    const d = node.data;
    d['sup_0_assignedQty'] = ideal.assignedQty;
    d['sup_0_qty'] = ideal.qty;
    d['sup_0_finalUP'] = +((+ideal.uPriceAfterDiscount || 0) * (+ideal.exchRateNow || 1)).toFixed(2);
    d['sup_0_totalPrice'] = ideal.totalPrice;
    const rowsToRefresh: any[] = [node];

    // Ideal subtotal of this C
    const delta = (+ideal.totalPrice || 0) - oldTotal;
    const cLevel: any = d._cLevelRef;
    if (cLevel && delta !== 0) {
      const cIdeal = (cLevel.groupingSupplierC_Prices || []).find((x: any) => x.supplierId === 0 || x.supplierName === 'Ideal');
      if (cIdeal) cIdeal.totalPrice = (+cIdeal.totalPrice || 0) + delta;
      this.gridApi?.forEachNode((n: any) => {
        if (n.data?._rowType === 'subtotal' && n.data._cLevelRef === cLevel) {
          n.data['sup_0_totalPrice'] = (+n.data['sup_0_totalPrice'] || 0) + delta;
          rowsToRefresh.push(n);
        }
      });
    }

    this.gridApi?.refreshCells({ rowNodes: rowsToRefresh, force: true });
    this.buildPinnedRow();   // pinned "Total" row; footer Sub/Grand totals read rowData
  }

  onCellValueChanged(event: CellValueChangedEvent) {
    const field = event.colDef?.field;
    if (!field?.startsWith('sup_') || !field?.endsWith('_assignedQty')) return;
    if (event.data?._rowType !== 'data') return;

    const parts = field.split('_');
    const supplierId = parseInt(parts[1], 10);
    const ref = event.data._rowRef;
    const sups: any[] = this.byBoq
      ? (ref as GroupingBoq).groupingPackageSuppliersPrices
      : (ref as GroupingResource).groupingPackageSuppliersPrices;

    const sup = sups?.find((s) => s.supplierId === supplierId);
    if (sup) {
      sup.assignedQty = parseFloat(event.newValue) || 0;
    }
  }

  onSelectionChanged() {
    if (!this.gridApi) return;
    const selectedNodes = this.gridApi.getSelectedNodes();
    const selectedRefs = new Set(selectedNodes.map((n) => n.data?._rowRef).filter(Boolean));

    if (!this.byBoq) {
      this.selectedResources = [];
      this.CurrentLevelList.forEach((cLevel) =>
        cLevel.groupingLevels.forEach((level) =>
          level.groupingResources.forEach((res) => {
            res.isChecked = selectedRefs.has(res);
            if (res.isChecked) this.selectedResources.push(res.resourceSeq);
          })
        )
      );
    } else {
      this.selectedBoqItems = [];
      this.CurrentLevelList.forEach((cLevel) =>
        cLevel.groupingLevels.forEach((level) =>
          level.items.forEach((item) => {
            item.isChecked = selectedRefs.has(item);
            if (item.isChecked) this.selectedBoqItems.push(item.itemO);
          })
        )
      );
    }
  }

  private buildPinnedRow(): void {
    if (!this.gridApi) return;
    const dataRows = (this.rowData || []).filter((r: any) => r._rowType === 'data');
    const count = dataRows.length;
    const sumField = (field: string) =>
      dataRows.reduce((acc: number, r: any) => acc + (parseFloat(r[field]) || 0), 0);

    const descField = this.byBoq ? 'itemDescription' : 'resourceDescription';
    const row: any = {
      _rowType: 'pinnedTotal',
      [descField]: `Total  (${count} item${count !== 1 ? 's' : ''})`,
      totalPrice: sumField('totalPrice'),
      quotationAmt: sumField('quotationAmt'),
    };

    this.getSupplierListFromData().forEach((sup: any) => {
      row[`sup_${sup.supplierId}_totalPrice`] = sumField(`sup_${sup.supplierId}_totalPrice`);
    });

    this.gridApi.setPinnedBottomRowData([row]);
    this.ensureTotalColumnsFit(row);
  }

  /**
   * autoSizeAllColumns only measures the rendered data rows, so large subtotal /
   * pinned-total values were cut off ("1,096..."). Widen every total column so
   * its largest total is fully visible.
   */
  private ensureTotalColumnsFit(totalRow: any): void {
    if (!this.columnApi) return;
    const totalRows = [totalRow, ...(this.rowData || []).filter((r: any) => r._rowType === 'subtotal')];
    const fields = Object.keys(totalRow).filter(
      (k) => k === 'totalPrice' || k === 'quotationAmt' || /^sup_.+_totalPrice$/.test(k)
    );
    fields.forEach((f) => {
      const col = this.columnApi.getColumn(f);
      if (!col) return;
      let maxLen = 0;
      totalRows.forEach((r: any) => {
        const txt = this.fmtNum(r?.[f], 0);
        if (txt.length > maxLen) maxLen = txt.length;
      });
      const needed = Math.ceil(maxLen * 8) + 28; // bold digits + cell padding
      if (col.getActualWidth() < needed) this.columnApi.setColumnWidth(col, needed);
    });
  }

  // ── Grid-aligned footer (Summary · Technical · Commercial conditions) ────
  // The footer tables below the grid take their column widths from the live
  // AG Grid columns so that Budget / Quotation / each supplier line up exactly
  // under their grid column groups, and follow the grid's horizontal scroll.

  footerLeftWidth = 0;      // width of the pinned-left grid columns
  footerCenterWidth = 0;    // total width of the scrollable grid columns
  footerPreWidth = 0;       // width of non-supplier columns (Excl., Unit, Budget, Quotation)
  footerSegments: FooterSegment[] = [];
  footerSupplierSegments: FooterSegment[] = [];

  computeFooterLayout(): void {
    if (!this.columnApi) return;
    const cols = this.columnApi.getAllDisplayedColumns() || [];
    const names = new Map<string, string>();
    this.getSupplierListFromData().forEach((s: any) => names.set(String(s.supplierId), s.supplierName));

    let left = 0;
    const segs: FooterSegment[] = [];
    let supIndex = -1;
    cols.forEach((col) => {
      const w = col.getActualWidth();
      const pinned = col.getPinned();
      if (pinned === 'left') { left += w; return; }
      if (pinned === 'right') return;

      const field = col.getColDef().field || '';
      let seg: FooterSegment;
      if (field === 'qty' || field === 'unitPrice' || field === 'totalPrice') {
        seg = { key: 'budget', type: 'budget', width: 0, label: 'Budget', cssClass: 'af-budget' };
      } else if (field === 'quotationQty' || field === 'quotationAmt') {
        seg = { key: 'quotation', type: 'quotation', width: 0, label: 'Quotation', cssClass: 'af-quotation' };
      } else {
        const m = /^sup_(.+?)_(assignedQty|finalUP|totalPrice)$/.exec(field);
        if (m) {
          seg = { key: 'sup_' + m[1], type: 'supplier', width: 0, supplierId: m[1], label: names.get(m[1]) || '' };
        } else {
          seg = { key: 'lead', type: 'lead', width: 0, label: '' };
        }
      }
      const last = segs[segs.length - 1];
      if (last && last.key === seg.key) {
        last.width += w;
      } else {
        if (seg.type === 'supplier') {
          supIndex++;
          seg.cssClass = 'af-sup-' + (supIndex % 8);
        }
        seg.width = w;
        segs.push(seg);
      }
    });

    this.footerLeftWidth = left;
    this.footerSegments = segs;
    this.footerSupplierSegments = segs.filter((s) => s.type === 'supplier');
    this.footerCenterWidth = segs.reduce((a, s) => a + s.width, 0);
    const firstSup = segs.findIndex((s) => s.type === 'supplier');
    this.footerPreWidth = segs
      .slice(0, firstSup < 0 ? segs.length : firstSup)
      .reduce((a, s) => a + s.width, 0);
  }

  onGridBodyScroll(event: BodyScrollEvent): void {
    if (event.direction !== 'horizontal') return;
    this.hostEl.nativeElement.style.setProperty('--af-scroll', -event.left + 'px');
  }

  getFooterSupplier(seg: FooterSegment): PackageSuppliersPrice {
    if (!seg || seg.type !== 'supplier') return null;
    const list = this.packageSuppliersPrices || [];
    return (
      list.find((p) => String(p.supplierId) === seg.supplierId) ||
      list.find((p) => p.supplierName === seg.label) ||
      null
    );
  }

  /** Sum of the grid data rows for a field — the same numbers as the grid "Total" row. */
  private sumGridField(field: string): number {
    return (this.rowData || [])
      .filter((r: any) => r._rowType === 'data')
      .reduce((acc: number, r: any) => acc + (parseFloat(r[field]) || 0), 0);
  }

  /** Sub-Total: Budget / Quotation / supplier T. Price, summed from the grid rows. */
  getFooterSubTotal(seg: FooterSegment): number {
    if (!seg) return null;
    if (seg.type === 'budget') return this.sumGridField('totalPrice');
    if (seg.type === 'quotation') return this.sumGridField('quotationAmt');
    if (seg.type === 'supplier') return this.sumGridField(`sup_${seg.supplierId}_totalPrice`);
    return null;
  }

  /** Additional fees of a supplier: amount fields + percentage fields applied on the Sub-Total. */
  getFooterAdditionalFees(seg: FooterSegment): number {
    if (!seg || seg.type !== 'supplier') return 0;
    const sub = this.getFooterSubTotal(seg) || 0;
    return (this.getFooterSupplier(seg)?.fieldLists || []).reduce((acc: number, f: any) => {
      const v = parseFloat(f.value) || 0;
      return acc + (f.type == this.fieldTypes.PERCENTAGE_TYPE_ID ? (sub * v) / 100 : v);
    }, 0);
  }

  /** Grand Total = Sub-Total + Additional Fees. */
  getFooterGrandTotal(seg: FooterSegment): number {
    if (!seg || seg.type === 'lead') return null;
    return (this.getFooterSubTotal(seg) || 0) + this.getFooterAdditionalFees(seg);
  }

  getFooterReply(cond: any, seg: FooterSegment): string {
    const replies: any[] = cond?.replies || [];
    const r =
      replies.find((x) => x.supplierId != null && String(x.supplierId) === seg.supplierId) ||
      replies.find((x) => x.supplierName === seg.label);
    return r ? r.reply : '';
  }

  trackBySegKey(_: number, seg: FooterSegment) {
    return seg.key;
  }

  private fmtNum(value: any, decimals: number): string {
    if (value == null || value === '') return '';
    const n = parseFloat(value);
    if (isNaN(n)) return '';
    return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: decimals });
  }

  private fmtDate(dateVal: any): string {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
}

interface FooterSegment {
  key: string;
  type: 'lead' | 'budget' | 'quotation' | 'supplier';
  width: number;
  label: string;
  supplierId?: string;
  cssClass?: string;
}
