import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { BOQDivList, BoqModel, RESDivList, RESTypeList, SearchInput, SheetDescList } from '../assign-package/assign-package.model';
import { AssignPackageService } from '../assign-package/assign-package.service';
import { LoginService } from '../login/login.service';
import { User } from '../_models';
import { ComparisonPackageGroup, GroupingBoq, GroupingResource } from './package-groups.model';
import { PackageGroupsService } from './package-groups.service';

@Component({
  selector: 'app-package-groups',
  templateUrl: './package-groups.component.html',
  styleUrls: ['./package-groups.component.css']
})
export class PackageGroupsComponent implements OnInit, OnDestroy {

  params : any;
  packageId : number = 0;
  packageName : string = "";
  isShown: boolean = true; // shown by default
  selectedBOQDivList : any[] = []; 
  RESDivList: RESDivList[] = [];
  BOQDivList: BOQDivList[] = [];
  SearchInput : SearchInput = new SearchInput();
  SheetDescList: SheetDescList[] = [];
  selectedSheetDescList : any[] = [];
  selectedRESDivList : any[] = [];
  selectedRESTypeList : any[] = [];
  RESTypeList: RESTypeList[] = [];
  searching : boolean = false;
  groupingBoqs : GroupingBoq[] = [];
  selectedRightResources : GroupingResource[] = [];
  selectedLeftResources : GroupingResource[] = [];
  selectedLeftItems : GroupingBoq[] = [];
  selectedRightItems : GroupingBoq[] = [];
  groups : ComparisonPackageGroup[] = [];
  selectedGroup : any;
  proceed : boolean = false;
  byBoq : boolean = false;
  public user : User;

  constructor(private router : Router, private assignPackageService : AssignPackageService, 
    private packageGroupsService : PackageGroupsService, private loginService : LoginService, private route: ActivatedRoute,
     private toastrService : ToastrService) { 
    /*if (this.router.getCurrentNavigation().extras.state != undefined) {
      this.packageId= this.router.getCurrentNavigation().extras.state.packageId;
      this.packageName = this.router.getCurrentNavigation().extras.state.pkgeName;
      this.byBoq = this.router.getCurrentNavigation().extras.state.byBoq;
    } else {
      this.router.navigateByUrl("/package-list");
    }*/
    this.loginService.user.subscribe(x => this.user = x);
  }

  ngOnInit(): void {
    this.params = this.route.params.subscribe(params => {
      
      this.packageId= Number(params["packageId"]);
      this.packageName = params["pkgeName"];
      this.byBoq = params["byBoq"] == "true";

      this.getGroups();
     });
  }

  ngOnDestroy(): void {
    this.params.unsubscribe();
  }

  getGroups()
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    this.packageGroupsService.getGroups(this.packageId).subscribe((data) => {
        if(data)
        {
            this.groups = data;
        }
    });
  }

  onGroupchange(event : any)
  {
      this.selectedGroup = event;
      this.proceed = false;
      if(event)
      {

        let body : any = {
          level2 : this.SearchInput.boqLevel2,
          level3 : this.SearchInput.boqLevel3,
          level4 : this.SearchInput.boqLevel4,
          resType: this.SearchInput.rESType,
          boqDiv: this.SearchInput.bOQDiv
        };
        
        this.proceed = true;
        this.GetBOQDivList(body);
        this.GetSheetDescList();
        this.GetRESDivList();
        this.GetRESTypeList();
        this.getBoqResourceList();
      }
  }

  allSelected(resources : GroupingResource[])
  {
      let allSelected = false;
      resources.forEach(resource=>{
        allSelected = resource.isSelected;
      });

      return allSelected;
  }


  getBoqResourceList()
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

    this.searching = true;
    if(!this.byBoq)
    {
      this.packageGroupsService.getGroupBoqList(this.packageId, this.selectedGroup, this.SearchInput).subscribe((data) => {
        this.searching = false;
          if(data)
          {
              this.groupingBoqs = data;
              
          }
      });
    }
    else
    {
      this.packageGroupsService.getGroupBoqListOnly(this.packageId, this.selectedGroup, this.SearchInput).subscribe((data) => {
        this.searching = false;
          if(data)
          {
              this.groupingBoqs = data;
              
          }
      });
    }
  }

  openAddGroup()
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

    (async () => {

      const { value: formValue } = await Swal.fire({
        title: 'Add New Group',
        confirmButtonColor : '#0d6efd',
        
        confirmButtonText : 'Save',
        html:
          '<input id="groupNameInput" placeholder="Enter Group Name" class="form-control">',
         
        focusConfirm: false,
        preConfirm: () => {
          return [
            (document.getElementById('groupNameInput') as HTMLInputElement).value
            
          ]
        }
      })
    
      if (formValue) {
        if(formValue[0] == '')
        {
          Swal.fire({title : 'Group Name is Required',
          icon: 'error',
          confirmButtonColor : '#dc3545',
          confirmButtonText : 'Ok'
        });
        }
        else
        {
          let group : ComparisonPackageGroup = {
            id : 0, 
            name : formValue[0], 
            package : {idPkge : this.packageId, pkgeName : null}, 
            userId : this.loginService.userValue?.usrId}
            this.packageGroupsService.addGroup(group).subscribe(data=>{
                if(data)
                {
                    this.toastrService.success('Added Successfuly');
                    this.getGroups();
                }
            });
        }
        
      }
      })()
  }

  toggleShow()
  {
    this.isShown = !this.isShown;
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

  GetBOQDivList(body : any) {
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

  GetRESTypeList() {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    this.assignPackageService.GetRESTypeList(null).subscribe((data) => {
      if (data) {
        this.RESTypeList = data;
        this.selectedRESTypeList = data;
      }
    });
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

  onSearch(){
    this.getBoqResourceList();
  }

  onSelectAllBOQDiv()
  {
    this.selectedBOQDivList = [];
    this.BOQDivList.forEach(item=>{
      this.selectedBOQDivList.push(item.sectionO);
    });
  }

  clearAllSelections(){}

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

  onSelectAllRESType()
  {
    this.selectedRESTypeList = [];
      this.RESTypeList.forEach(item=>{
        this.selectedRESTypeList.push(item.boqCtg);
      });
  }

  selectLeftItem(event: any, item : GroupingBoq)
  {
      let checkbox = event.target as HTMLInputElement;
      item.isChecked = checkbox.checked;
      item.groupingResources.forEach(resource=>{
        resource.isChecked = checkbox.checked;
        
        if(checkbox.checked)
        {
            this.selectedLeftResources.push(resource);
        }
        else
        {
            let index = this.selectedLeftResources.findIndex(x=>x.boqSeq == resource.boqSeq);
            this.selectedLeftResources.splice(index, 1);
        }
      });
  }

  selectRightItem(event: any, item : GroupingBoq)
  {
      let checkbox = event.target as HTMLInputElement;
      item.isChecked = checkbox.checked;
      item.groupingResources.forEach(resource=>{
      
        resource.isChecked = checkbox.checked;
        
        if(checkbox.checked)
        {
            this.selectedRightResources.push(resource);
        }
        else
        {
            let index = this.selectedRightResources.findIndex(x=>x.boqSeq == resource.boqSeq);
            this.selectedRightResources.splice(index, 1);
        }
      });
  }

  selectLeftResource(event: any, resource : GroupingResource, item : GroupingBoq)
  {
      let checkbox = event.target as HTMLInputElement;
        resource.isChecked = checkbox.checked;
        if(checkbox.checked)
        {
            this.selectedLeftResources.push(resource);
        }
        else
        {
            let index = this.selectedLeftResources.findIndex(x=>x.boqSeq == resource.boqSeq);
            this.selectedLeftResources.splice(index, 1);
        }

        let allUnchecked = true;
        item.groupingResources.forEach(resource => {
          if(resource.isChecked)
          {
              allUnchecked = false;
              return;
          }
        });

        item.isChecked = !allUnchecked;
  }

  selectRightResource(event: any, resource : GroupingResource, item : GroupingBoq)
  {
      let checkbox = event.target as HTMLInputElement;
        resource.isChecked = checkbox.checked;
        if(checkbox.checked)
        {
            this.selectedRightResources.push(resource);
        }
        else
        {
            let index = this.selectedRightResources.findIndex(x=>x.boqSeq == resource.boqSeq);
            this.selectedRightResources.splice(index, 1);
        }

        let allUnchecked = true;
        item.groupingResources.forEach(resource => {
          if(resource.isChecked)
          {
              allUnchecked = false;
              return;
          }
        });

        item.isChecked = !allUnchecked;
  }

  attachToGroup(event : any)
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
      this.packageGroupsService.attachToGroup(this.selectedGroup, this.selectedLeftResources).subscribe(resp=>{
          if(resp)
          {
              this.toastrService.success('Attached successfuly');
              this.getBoqResourceList();
              this.selectedLeftResources = [];
          }
          else
          {
            this.toastrService.error('An error occured');
          }
      });    
  }

  detachFromGroup(event : any)
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    this.packageGroupsService.detachFromGroup(this.selectedGroup, this.selectedRightResources).subscribe(resp=>{
      if(resp)
      {
          this.toastrService.success('Detached successfuly');
          this.getBoqResourceList();
          this.selectedRightResources = [];
      }
      else
      {
        this.toastrService.error('An error occured');
      }
  });  
  }

  attachToGroupByBoq(event:any){
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

    this.packageGroupsService.attachToGroupByBoq(this.selectedGroup, this.selectedLeftItems).subscribe(resp=>{
      if(resp)
      {
          this.toastrService.success('Attached successfuly');
          this.getBoqResourceList();
          this.selectedLeftItems = [];
      }
      else
      {
        this.toastrService.error('An error occured');
      }
  });    

  }

  detachFromGroupByBoq(event:any){
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    
    this.packageGroupsService.detachFromGroupByBoq(this.selectedGroup, this.selectedRightItems).subscribe(resp=>{
      if(resp)
      {
          this.toastrService.success('Detached successfuly');
          this.getBoqResourceList();
          this.selectedRightItems = [];
      }
      else
      {
        this.toastrService.error('An error occured');
      }
  });  
  }

  selectLeftItemByBoq(event:any, item : GroupingBoq)
  {
    let checkbox = event.target as HTMLInputElement;
    item.isChecked = checkbox.checked;
    if(checkbox.checked)
    {
        this.selectedLeftItems.push(item);
    }
    else
    {
        let index = this.selectedLeftItems.findIndex(x=>x.itemO == item.itemO);
        this.selectedLeftItems.splice(index, 1);
    }

  
  }

  selectRightItemByBoq(event:any, item : GroupingBoq)
  {
    let checkbox = event.target as HTMLInputElement;
    item.isChecked = checkbox.checked;
    if(checkbox.checked)
    {
        this.selectedRightItems.push(item);
    }
    else
    {
        let index = this.selectedRightItems.findIndex(x=>x.itemO == item.itemO);
        this.selectedRightItems.splice(index, 1);
    }
  }

}
