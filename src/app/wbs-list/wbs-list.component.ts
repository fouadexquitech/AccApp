
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ConfirmBoxInitializer, DialogLayoutDisplay } from '@costlydeveloper/ngx-awesome-popup';
import { ModalDismissReasons, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { wbs } from '../wbs-list/wbs-list.model';
import { WbsListService } from './wbs-list.service';
import { DataTableDirective } from 'angular-datatables';
import { LoginService } from '../login/login.service';
import { User } from '../_models';

@Component({
  selector: 'app-wbs-list',
  templateUrl: './wbs-list.component.html',
  styleUrls: ['./wbs-list.component.css']
})
export class WbsListComponent implements OnInit {
  @ViewChild(DataTableDirective, {static: false})
    dtElement: DataTableDirective | undefined;
    dtInstance: Promise<DataTables.Api> | undefined;
    wbslist : wbs[] = [];
    addedList : wbs[] = [];
    wbslists : any[] = [];
    filter : string = '';
    loading : boolean = false;
    modalTitle = 'Add Bulk Management Users';
    mode = 'add';
    closeResult: string;
    modalOptions:NgbModalOptions;
    modalReference : any;
    savingBulk : boolean = false;
    deleting : boolean = false;
    formEdit: FormGroup;
    submitted : boolean = false;
    updating : boolean = false;
    currentUser : wbs;
    public user : User;
  
    public dtOptions: DataTables.Settings;
    public dtTrigger: Subject<any> = new Subject<any>();
    // isSearching : boolean = false;


  constructor(
    private modalService: NgbModal, private toastrService : ToastrService, 
    private wbsListService : WbsListService,
    private formBuilder: FormBuilder,
    private loginService: LoginService,
  ) 
  { this.loginService.user.subscribe(x => this.user = x);
    this.modalOptions = {
      backdrop:'static',
      backdropClass:'customBackdrop',
      size : 'lg'
    }
  }

  ngOnInit(): void 
  {
    this.fetchData();
  }

  fetchData()
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    const that = this;

    this.dtOptions = {
      pagingType: 'full_numbers',
      responsive : true,
      lengthMenu: [
        [5, 10, 25, 50, 100],
        [5, 10, 25, 50, 100]
      ],
      language: {
        infoFiltered:"",
        
      },
      pageLength: 10,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
       
        this.wbsListService.GetWbsList(dataTablesParameters,CostConn).subscribe(resp => {
            that.wbslists = resp.data;
            console.log(that.wbslists)
            callback({
              recordsTotal: resp.recordsTotal - 1,
              recordsFiltered: resp.recordsFiltered,
              data: []
            });
          });
      },
      columns: [
        { title : 'Div', data: 'div', name : 'div' }, 
        { title : 'WBS', data: 'wbsCode', name : 'wbsCode' }, 
        { title : 'Description', data: 'wbsDesc', name : 'wbsDesc' }, 
      ]
    };
  }

  getWbsList()
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });
    this.loading = true;
      this.wbsListService.GetWbsList(this.filter,CostConn).subscribe(data=>{
        this.loading = false;
          if(data)
          {
              this.wbslist = data;
              console.log(this.wbslist)
          }
          this.dtTrigger.next();
      });
  }

  ngOnDestroy(): void 
  {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
    
  onFilterKeyUp(event: any)
   {
    let filterValue = event.target.value.trim();
    this.filter = filterValue;
    this.getWbsList();
  }
    
      //convenience getter for easy access to form fields
  get f() { return this.formEdit.controls; }
    
    
  reload() {
    this.dtElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload(undefined, false);
    });
  }

}
