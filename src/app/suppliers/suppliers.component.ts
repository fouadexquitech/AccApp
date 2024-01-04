import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ConfirmBoxInitializer, DialogLayoutDisplay } from '@costlydeveloper/ngx-awesome-popup';
import { ModalDismissReasons, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Supplier,RegisterModel } from '../suppliers/suppliers.models';
import { SuppliersService } from './suppliers.service';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.css']
})

export class SuppliersComponent implements OnInit {
  @ViewChild('modalUser') modalUser : any;
  @ViewChild('editModal') editModal : any;
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective | undefined;
  dtInstance: Promise<DataTables.Api> | undefined;
  suppliers : any[] = [];
  list : Supplier[] = [];
  addedList : Supplier[] = [];
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
  currentUser : Supplier;
//AH22122023
  selectedSuppliers : string[] = [];
  registerModelList: RegisterModel[] = [];
//AH22122023
  public dtOptions: DataTables.Settings;
  public dtTrigger: Subject<any> = new Subject<any>();
  // isSearching : boolean = false;
  
  constructor(
    private modalService: NgbModal, private toastrService : ToastrService, 
    private suppliersService : SuppliersService,
    private formBuilder: FormBuilder,
  ) 
  { 
    this.modalOptions = {
      backdrop:'static',
      backdropClass:'customBackdrop',
      size : 'lg'
    }
  }
  

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData()
  {
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
       
        this.suppliersService.GetSuppliers(dataTablesParameters).subscribe(resp => {
            that.suppliers = resp.data;
            callback({
              recordsTotal: resp.recordsTotal - 1,
              recordsFiltered: resp.recordsFiltered,
              data: []
            });
          });
      },
      columns: [
        { title : 'Supplier ID', data: 'supID', name : 'supID' }, 
        { title : 'Supplier Name', data: 'supName', name : 'supName' }, 
        { title : 'Supplier Email', data: 'supEmail', name : 'supEmail' }, 
        { title : 'Account Created', data: 'isAccountCreated', name : 'isAccountCreated' }, 
        { title : 'Action', data: null, name : 'action', orderable : false }, 
        { title : 'Select', data: null,  name : 'selSup' },
        { title : 'aaa', data: null,  name : 'butn' },
      ]
    };
  }

  getSuppliersList()
  {
    this.loading = true;
      this.suppliersService.GetSuppliers(this.filter).subscribe(data=>{
        this.loading = false;
          if(data)
          {
              this.list = data;
          }
          this.dtTrigger.next();
      });
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  onFilterKeyUp(event: any)
  {
    let filterValue = event.target.value.trim();
    this.filter = filterValue;
    this.getSuppliersList();
  }


  addUserRow()
  {
    this.addedList.push({supID : 0, supName : null, supEmail : null, isAccountCreated : false,checked:false});
  }

  deleteRowAt(index : number)
  {
    this.addedList.splice(index, 1);
  }

  openAdd(content : any)
  {
    this.addedList = [];
    this.mode = 'add';
    this.modalTitle = 'Add User';
    this.modalReference = this.modalService.open(content, this.modalOptions);
    this.modalReference.result.then((result : any) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason : any) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

  reload() {
    this.dtElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload(undefined, false);
    });
  }

  saveBulk()
  {
      if(this.addedList.length == 0)
      {
          this.toastrService.error('No data available');
          return;
      }

      let valid = true;
      let bulkTable = document.getElementById('bulkTable') as HTMLTableElement;
      this.addedList.forEach((supplier, index)=>
        {
          bulkTable.rows[index + 1].style.borderColor = '';
            if(supplier.supName == null || supplier.supEmail == null)
            {
              valid = false;
              this.toastrService.error('Required fields');
              bulkTable.rows[index + 1].style.borderColor = '#dc3545';
            }
        });

        if(valid)
        {
          this.savingBulk = true;
            this.suppliersService.addSupplier(this.addedList).subscribe(data=>{
              this.savingBulk = false;
                if(data)
                {
                    this.toastrService.success('List added successfuly');
                    //this.getSuppliersList();
                    this.modalReference.close();
                }
                else
                {
                  this.toastrService.error('An error occured');
                }
            });
        }
  }

  NameValueChanged(event : any, index : number)
  {
      let value = event.target.value;
      this.addedList[index].supName = value;
  }

  mailValueChanged(event : any, index : number)
  {
    let value = event.target.value;
    this.addedList[index].supEmail = value;
  }

  deleteUser(id : number)
  {
    const confirmBox = new ConfirmBoxInitializer();

    confirmBox.setTitle('Are you sure you want to delete this user?');
    confirmBox.setMessage('Please confirm');
    confirmBox.setButtonLabels('Confirm', 'Decline');
    
    confirmBox.setConfig({
    layoutType: DialogLayoutDisplay.WARNING // SUCCESS | INFO | NONE | DANGER | WARNING
  });

   // Simply open the popup and listen which button is clicked

   confirmBox.openConfirmBox$().subscribe(resp => {

    // do some action after user click on a button
    //console.log(resp);
    if(resp.success)
    {
      this.deleting = true;
    this.suppliersService.deleteSupplier(id).subscribe(data=>{
      this.deleting = false;
        if(data)
        {
            this.toastrService.success('Deleted successfuly');
            this.getSuppliersList();
            this.modalReference.close();
        }
        else
        {
          this.toastrService.error('An error occured');
        }
    });
    }
  });
  }

  //convenience getter for easy access to form fields
  get f() { return this.formEdit.controls; }

  editUser(content : any, user : Supplier)
  {
    this.formEdit = this.formBuilder.group({
      supName: [user.supName, Validators.required],
      email: [user.supEmail, [Validators.required, Validators.email]]
    });
    this.currentUser = user;
    this.modalReference = this.modalService.open(content, this.modalOptions);
    this.modalReference.result.then((result : any) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason : any) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  editSupplier(supplier : Supplier)
  {
    this.formEdit = this.formBuilder.group({
      supName: [supplier.supName, Validators.required],
      email: [supplier.supEmail, [Validators.required, Validators.email]]
    });
    this.currentUser = supplier;
    this.modalReference = this.modalService.open(this.editModal, this.modalOptions);
    this.modalReference.result.then((result : any) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason : any) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  onEditSubmit()
  {
      this.submitted = true;
      // stop here if form is invalid
      if (this.formEdit.invalid) {
        return;
    }

    this.updating = true;
    this.currentUser.supEmail = this.f.email.value;
    this.currentUser.supName = this.f.supName.value;
    this.suppliersService.updateSupplier(this.currentUser).subscribe(response=>{
      this.updating = false;
        if(response)
        {
          this.toastrService.success('Updated successfuly');
          //this.getSuppliersList();
          this.reload();
          this.modalReference.close();
        }
        else
        {
          this.toastrService.error('An error occured');
        }
    });
  }

//AH22122023
  selectSupplier(target : any, itemO : string)
  {
    let checkbox = target as HTMLInputElement;
    let cell = checkbox.parentElement as HTMLTableCellElement;
    let row = cell.parentElement as HTMLTableRowElement;
    row.style.backgroundColor = (checkbox.checked? '#f1f1f1' : '');

    let registerModelList = [];
    this.suppliers.forEach(c=>{
        if(c.checked)
        {
          registerModelList.push({ SupplierId:c.supID, FirstName : c.supName,LastName:"" ,PhoneNumber : c.PhoneNumber ,DisplayName:c.supName,Email:c.supEmail});
        }

    // if(checkbox.checked)
    // {
    //   if(this.suppliers.indexOf(itemO) == -1)
    //   {
    //     this.registerModelList.push(itemO);
    //   }
    // }
    // else
    // {
    //     this.selectedSuppliers.splice(this.selectedSuppliers.indexOf(itemO), 1);
    // }
  });
//AH22122023
  }
}
