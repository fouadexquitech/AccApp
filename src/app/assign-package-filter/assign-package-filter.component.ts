import { Component, EventEmitter, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { BOQDivList, BOQLevelList, PackageList, RESDivList, RESPackageList, RESTypeList, RessourceList, SearchInput, SheetDescList } from '../assign-package/assign-package.model';
import { AssignPackageService } from '../assign-package/assign-package.service';

@Component({
  selector: 'app-assign-package-filter',
  templateUrl: './assign-package-filter.component.html',
  styles : [
    `  assignPackageFilter {
        position: static;
        display: block;
        flex: none;
        width: auto;
      
    }
    `
],
encapsulation: ViewEncapsulation.None
})

export class AssignPackageFilterComponent implements OnInit {
  @ViewChild('assignPackageFilter', { static: false }) assignPackageFilter: any;
  @Output() searchEvent : EventEmitter<any> = new EventEmitter<any>();
  @Output() clearEvent : EventEmitter<any> = new EventEmitter<boolean>();
  opened : boolean = false;
  submitting : boolean = false;

  SearchInput = new SearchInput();

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

  ressourceList: RessourceList[] = [];
  selectedRessources: RessourceList[];
  selectedFilterRessources : RessourceList[];

  SheetDescList: SheetDescList[] = [];
  selectedSheetDescList : SheetDescList[] = [];

  PackageList: PackageList[] = [];
  selectedPackages: PackageList[];
  selectedFilterPackages : PackageList[];

  RESPackageList: RESPackageList[] = [];
  selectedFilterResPackages : RESPackageList[] = [];

  constructor(private assignPackageService : AssignPackageService) { }

  ngOnInit(): void {
    let body : any = {
      level2 : this.SearchInput.boqLevel2,
      level3 : this.SearchInput.boqLevel3,
      level4 : this.SearchInput.boqLevel4,
      resType: this.SearchInput.rESType,
      boqDiv: this.SearchInput.bOQDiv
    };

    this.GetBOQDivList(body);
    this.GetBOQLevel2List(body);
    this.GetBOQLevel3List(body);
    this.GetBOQLevel4List(body);
    this.GetRESDivList();
    this.GetRESTypeList(body);
    this.GetPackageList();
    this.GetRESPackageList();
    this.GetSheetDescList();

    this.GetRessourcesListByLevels();
  }

  
  GetBOQDivList(body : any) {
    this.assignPackageService.GetBOQDivList(body).subscribe((data) => {
      if (data) {
        this.BOQDivList = data;
        this.selectedBOQDivList = data;
        //console.log(data)
      }
    });
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

  GetBOQLevel2List(body : any) {
   
    this.assignPackageService.GetBOQLevel2List(body).subscribe((data) => {
      if (data) {
        this.BOQLevelList = data;
        this.selectedBOQLevel2List = data;
        //console.log(data)
      }
    });
  }

  GetBOQLevel3List(body : any) {
   
    this.assignPackageService.GetBOQLevel3List(body).subscribe((data) => {
      if (data) {
        this.BOQLevelList = data;
        this.selectedBOQLevel3List = data;
        //console.log(data)
      }
    });
  }

  GetBOQLevel4List(body : any) {
    
    this.assignPackageService.GetBOQLevel4List(body).subscribe((data) => {
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

  GetRESTypeList(body : any) {
    
    this.assignPackageService.GetRESTypeList(body).subscribe((data) => {
      if (data) {
        this.RESTypeList = data;
        this.selectedRESTypeList = data;
      }
    });
  }


  GetRessourcesListByLevels() {
    let body : any = {
      level2 : this.SearchInput.boqLevel2,
      level3 : this.SearchInput.boqLevel3,
      level4 : this.SearchInput.boqLevel4,
      resType: this.SearchInput.rESType,
      boqDiv: this.SearchInput.bOQDiv
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

  get isClearedActive()
  {
     return ( (this.SearchInput.bOQDesc == null || this.SearchInput.bOQDesc == '') &&
      this.SearchInput.bOQDiv.length == 0 &&
      (this.SearchInput.bOQItem == null || this.SearchInput.bOQItem == '') &&
      this.SearchInput.boqLevel2.length == 0 &&
      this.SearchInput.boqLevel3.length == 0 &&
      this.SearchInput.boqLevel4.length == 0 &&
      this.SearchInput.boqResourceSeq.length == 0 &&
      (this.SearchInput.fromRow == null || this.SearchInput.fromRow == '') &&
      (this.SearchInput.toRow == null || this.SearchInput.toRow == '') &&
      this.SearchInput.isItemsAssigned == 0 &&
      (this.SearchInput.itemO == null || this.SearchInput.itemO == '') &&
      (this.SearchInput.obTradeDesc == null || this.SearchInput.obTradeDesc == '') &&
      this.SearchInput.package == 0 &&
      (this.SearchInput.rESDesc == null || this.SearchInput.rESDesc == '') &&
      this.SearchInput.rESDiv.length == 0 &&
      (this.SearchInput.rESPackage == null || this.SearchInput.rESPackage == '') &&
      this.SearchInput.rESType.length == 0 &&
      (this.SearchInput.sheetDesc == null || this.SearchInput.sheetDesc == '') &&
      this.SearchInput.isRessourcesAssigned == 0);

  }

  public clearFilter()
  {
      this.SearchInput.bOQDesc = null;
      this.SearchInput.bOQDiv = [];
      this.SearchInput.bOQItem = null;
      this.SearchInput.boqLevel2 = [];
      this.SearchInput.boqLevel3 = [];
      this.SearchInput.boqLevel4 = [];
      this.SearchInput.boqResourceSeq = [];
      this.SearchInput.fromRow = null;
      this.SearchInput.isItemsAssigned = 0;
      this.SearchInput.itemO = null;
      this.SearchInput.obTradeDesc = null;
      this.SearchInput.package = 0;
      this.SearchInput.rESDesc = null;
      this.SearchInput.rESDiv = [];
      this.SearchInput.rESPackage = null;
      this.SearchInput.rESType = [];
      this.SearchInput.sheetDesc = null;
      this.SearchInput.toRow = null;
      this.SearchInput.isRessourcesAssigned = 0;
      this. GetRessourcesListByLevels();
      //this.searchEvent.emit(this.SearchInput);
  }


  search(){
      this.searchEvent.emit(this.SearchInput);
      this.closeDrawer();
  }

  public openDrawer(){
    this.assignPackageFilter.toggle();
  }

  closeDrawer(){
    this.assignPackageFilter.close();
  }


  GetRessourcesList(body : any) {
    this.assignPackageService.GetRessourcesList(body).subscribe((data) => {
      if (data) {
        this.ressourceList = data;
        this.selectedRessources = this.ressourceList;
        this.selectedFilterRessources = data;
      }
    });
  }

  L2_AfterUpdate()
  {
    let body : any = {
      level2 : this.SearchInput.boqLevel2,
      level3 : this.SearchInput.boqLevel3,
      level4 : this.SearchInput.boqLevel4,
      resType: this.SearchInput.rESType,
      boqDiv: this.SearchInput.bOQDiv
    };

    this.GetBOQDivList(body);
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
      resType: this.SearchInput.rESType,
      boqDiv: this.SearchInput.bOQDiv
    };

    this.GetBOQDivList(body);
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
      resType: this.SearchInput.rESType,
      boqDiv: this.SearchInput.bOQDiv
    };

    this.GetBOQDivList(body);
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
      resType: this.SearchInput.rESType,
      boqDiv: this.SearchInput.bOQDiv
    };

    this.GetBOQDivList(body);
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
      resType: this.SearchInput.rESType,
      boqDiv: this.SearchInput.bOQDiv
    };

    this.GetBOQDivList(body);
    this.GetBOQLevel2List(body);
    this.GetBOQLevel3List(body);
    this.GetBOQLevel4List(body);
    this.GetRESTypeList(body);
  }

  boqDiv_AfterUpdate(){
    let body : any = {
      level2 : this.SearchInput.boqLevel2,
      level3 : this.SearchInput.boqLevel3,
      level4 : this.SearchInput.boqLevel4,
      resType: this.SearchInput.rESType,
      boqDiv: this.SearchInput.bOQDiv
    };

    this.GetBOQLevel2List(body);
    this.GetBOQLevel3List(body);
    this.GetBOQLevel4List(body);
    this.GetRESTypeList(body);
    this.GetRessourcesList(body) ;
  }

  onLooseFocus()
  {
     this.closeDrawer();
  }

  clearAllSearch()
  {
      this.clearEvent.emit(true);
  }


}
