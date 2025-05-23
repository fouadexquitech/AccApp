import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { LoginService } from '../login/login.service';
import { TechCondModel,AccConditions, TblTechCond, TechConditionGroup, TechConditions } from '../package-comparison/package-comparison.model';
import { PackageComparisonService } from '../package-comparison/package-comparison.service';
import { ComparisonPackageGroup } from '../package-groups/package-groups.model';
import { PackageGroupsService } from '../package-groups/package-groups.service';
import { PackageSupplierService } from '../package-supplier/package-supplier.service';
import { User } from '../_models';
declare var $: any;


@Component({
  selector: 'app-technical-conditions',
  templateUrl: './technical-conditions.component.html',
  styleUrls: ['./technical-conditions.component.css']
})
export class TechnicalConditionsComponent implements OnInit, OnDestroy {

  params! : any;
  packageId : number = 0;
  list : TechConditions[] = [];
  selectedCondition : TechConditions;
  formTechCond!: FormGroup;
  mode : string = 'add';
  submitted : boolean = false;
  submitting : boolean = false;
  groups : ComparisonPackageGroup[] = [];
  packageName : string;
  filter : string = '';
  isSendingTechConditions : boolean = false;
  listCC : string[] = [];
  technicalConditionsModalLabel : string = '';
  public user : User;

  constructor(private router: Router, private packageComparisonService : PackageComparisonService, private packageSupplierService : PackageSupplierService,
    private packageGroupsService : PackageGroupsService, private formBuilder: FormBuilder,
    private route : ActivatedRoute, private toastrService : ToastrService, private loginService : LoginService,) 
    {this.loginService.user.subscribe(x => this.user = x);
    /*if (this.router.getCurrentNavigation().extras.state != undefined) {
      this.packageId = this.router.getCurrentNavigation().extras.state.packageId;
      this.packageName = this.router.getCurrentNavigation().extras.state.pkgeName;
    }*/
   }

    // convenience getter for easy access to form fields
  get f() { return this.formTechCond!.controls; }

  ngOnInit(): void {
    
    this.params = this.route.params.subscribe(params => {
      
      this.packageId = Number(params["packageId"]);
      this.packageName = params["packageName"];
    
      this.getTechnicalConditionsList();
     });
  }

  openSendTechnicalConditionsModal()
  {
    this.listCC = [];
    $("#sendTechnicalConditionsModal").modal('show');
  }

  closeSendTechnicalConditionsModal()
  {
    $("#sendTechnicalConditionsModal").modal('hide'); 
  }

  sendTechnicalConditions()
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

    let CondList : AccConditions[] = [];
    let table = document.getElementById("tbl1") as HTMLTableElement;
    let rows = table.rows;

    for (let i = 1; i < rows.length - 1; i++)
    {
      let row = rows[i];
      let cell1 = row.cells[0];
      let condId = cell1.textContent;
      let cell2 = row.cells[2];
      let accCondition = cell2.childNodes[0] as HTMLInputElement;

      console.log(condId);

      let condList: AccConditions=
      {
        condId : Number(condId),
        AccCondition:String(accCondition.value)
      };
      CondList.push(condList);
    }

    console.log(1);
    let techCondModel:TechCondModel = {AccCondList:CondList,ListCC:this.listCC};
    console.log(3);

    this.isSendingTechConditions = true;
    this.packageSupplierService.sendTechnicalConditions(Number(this.packageId), techCondModel, this.loginService.userValue?.usrId,CostConn).subscribe(data=>{
      this.isSendingTechConditions = false;
        if(data)
        {      
          this.toastrService.success("Technical conditions sent successfully");
          $("#sendTechnicalConditionsModal").modal('hide');     
        }
        else
        {
          this.toastrService.error("Sending email failed");
        }
    });
  }

  doSearch()
  {
    this.getTechnicalConditionsList();
  }

  addTechnicalCondition()
  {
      this.mode = 'add';
      this.technicalConditionsModalLabel = 'Add New Technical Condition';
      this.formTechCond = this.formBuilder.group({
          tcDescription : [null,[Validators.required]],
          techConditionGroups:  [null,[Validators.required]]
      });

      this.getGroups(null);
      $("#technicalConditionsModal").modal('show');
  }

  getGroups(items : TechConditionGroup[])
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

    this.packageGroupsService.getGroups(this.packageId).subscribe((data) => {
        if(data)
        {
            this.groups = data;

            let arr : ComparisonPackageGroup[] = null;
            if(items != null)
            {
                arr = [];
                items.forEach(item=>{
                  arr.push({id : item.groupId, name : item.groupDescription, package : {idPkge : this.packageId, pkgeName : this.packageName}, userId : ''});
                });
                
            }
            this.f.techConditionGroups.setValue(arr);
        }
    });
  }

  editTechCond(item : TechConditions)
  {
    this.mode = 'edit';
    this.selectedCondition = item;
    this.technicalConditionsModalLabel = 'Edit Technical Condition';
    this.formTechCond = this.formBuilder.group({
        tcDescription : [item.tcDescription,[Validators.required]],
        techConditionGroups:  [null,[Validators.required]]
    });

    this.getGroups(item.techConditionGroups);
    $("#technicalConditionsModal").modal('show');
  }

  onFormTechCondSubmit()
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

    this.submitted = true;
    if(this.formTechCond.invalid)
    {
        return;
    }
    else
    {
      let groups : TechConditionGroup[] = [];
      let arr : ComparisonPackageGroup[] = this.f.techConditionGroups?.value;
      if(arr)
      {
          arr.forEach(item=>{
            groups.push({groupId : item.id, groupDescription : item.name});
          });
      }
      if(this.mode == 'add')
      {
          let condition : TechConditions = {
            tcDescription : this.f.tcDescription?.value,
            tcPackId : this.packageId,
            tcSeq : 0,
            techConditionGroups : groups,
            tcAccCondValue:"",
            checked:false
          };
            this.submitting = true;
            this.packageSupplierService.addTechConditions(condition).subscribe(data=>{
            this.submitting = false;
              if(data)
              {
                $("#technicalConditionsModal").modal('hide');
                this.toastrService.success('Added Successsfuly');
                this.getTechnicalConditionsList();
              }
          });
    }
    else
    {
      let condition : TechConditions = {
        tcDescription : this.f.tcDescription?.value,
        tcPackId : this.packageId,
        tcSeq : this.selectedCondition!.tcSeq,
        techConditionGroups : groups,
        tcAccCondValue:"",
        checked:false
      };
        this.submitting = true;
        this.packageSupplierService.updateTechConditions(condition).subscribe(data=>{
        this.submitting = false;
          if(data)
          {
            $("#technicalConditionsModal").modal('hide');
            this.toastrService.success('Updated Successsfuly');
            this.getTechnicalConditionsList();
          }
      });
    }
  }
  }

  deleteTechCond(item : TechConditions)
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

    Swal.fire({  
      title: 'Are you sure you want to delete this condition?',  
      text: 'Please confirm',  
      icon: 'warning',  
      showCancelButton: true,  
      confirmButtonText: 'Proceed',  
      cancelButtonText: 'Cancel'  
    }).then((result) => {  
      if (result.value) 
      {   
        this.packageSupplierService.delTechConditions(item).subscribe(data=>{
            if(data)
            {
              this.toastrService.success('Deleted Successsfuly');
              this.getTechnicalConditionsList();
            }
        });
      }  
    }); 
  }

  closeTechnicalConditionsModal()
  {
    $("#technicalConditionsModal").modal('hide');
  }

  routeToPackageSupplier()
  {
    
    this.router.navigate(['package-supplier', 2]);
  }

  getTechnicalConditionsList()
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
//AH052024
  //   this.packageComparisonService.getTechConditions(this.packageId, this.filter).subscribe(data=>{
  //     this.list = data;
      
  //  });
  this.packageSupplierService.getTechConditionsByPackage(this.packageId, 0, CostConn).subscribe(data=>{
    this.list = data;
 });
//AH052024
  }

  ngOnDestroy(): void {
    this.params!.unsubscribe();
  }

}
