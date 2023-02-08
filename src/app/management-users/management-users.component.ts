import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ConfirmBoxInitializer, DialogLayoutDisplay } from '@costlydeveloper/ngx-awesome-popup';
import { ModalDismissReasons, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TopManagement } from '../package-comparison/package-comparison.model';
import { PackageComparisonService } from '../package-comparison/package-comparison.service';
import { ManagementUsersService } from './management-users.service';

@Component({
  selector: 'app-management-users',
  templateUrl: './management-users.component.html',
  styleUrls: ['./management-users.component.css']
})
export class ManagementUsersComponent implements OnInit {

  list : TopManagement[] = [];
  addedList : TopManagement[] = [];
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
  currentUser : TopManagement;
  constructor(private packageComparisonService : PackageComparisonService,
    private modalService: NgbModal, private toastrService : ToastrService, 
    private managementUsersService : ManagementUsersService,
    private formBuilder: FormBuilder,) {
      this.modalOptions = {
        backdrop:'static',
        backdropClass:'customBackdrop',
        size : 'lg'
      }

     }

  ngOnInit(): void {
    this.getTopManagementList();
  }

  getTopManagementList()
  {
    this.loading = true;
      this.packageComparisonService.getManagementEmail(this.filter).subscribe(data=>{
        this.loading = false;
          if(data)
          {
              this.list = data;
          }
      });
  }

  onFilterKeyUp(event: any)
  {
    let filterValue = event.target.value.trim();
    this.filter = filterValue;
    
    this.getTopManagementList();
  }

  addUserRow()
  {
    this.addedList.push({id : 0, userName : null, mail : null, occupation : null});
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

  saveBulk()
  {
      if(this.addedList.length == 0)
      {
          this.toastrService.error('No data available');
          return;
      }

      let valid = true;
      let bulkTable = document.getElementById('bulkTable') as HTMLTableElement;
      this.addedList.forEach((user, index)=>
        {
          bulkTable.rows[index + 1].style.borderColor = '';
            if(user.userName == null || user.mail == null || user.occupation == null)
            {
              valid = false;
              this.toastrService.error('Required fields');
              bulkTable.rows[index + 1].style.borderColor = '#dc3545';
            }
        });

        if(valid)
        {
          this.savingBulk = true;
            this.managementUsersService.addManagementEmail(this.addedList).subscribe(data=>{
              this.savingBulk = false;
                if(data)
                {
                    this.toastrService.success('List added successfuly');
                    this.getTopManagementList();
                    this.modalReference.close();
                }
                else
                {
                  this.toastrService.error('An error occured');
                }
            });
        }
  }

  userNameValueChanged(event : any, index : number)
  {
      let value = event.target.value;
      this.addedList[index].userName = value;

  }

  mailValueChanged(event : any, index : number)
  {
    let value = event.target.value;
    this.addedList[index].mail = value;
  }

  occupationValueChanged(event : any, index : number)
  {
    let value = event.target.value;
    this.addedList[index].occupation = value;
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
    this.managementUsersService.deleteManagementEmail(id).subscribe(data=>{
      this.deleting = false;
        if(data)
        {
            this.toastrService.success('Deleted successfuly');
            this.getTopManagementList();
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

  editUser(content : any, user : TopManagement)
  {
    this.formEdit = this.formBuilder.group({
      userName: [user.userName, Validators.required],
      email: [user.mail, [Validators.required, Validators.email]],
      occupation: [user.occupation, Validators.required]
    });
    this.currentUser = user;
    this.modalReference = this.modalService.open(content, this.modalOptions);
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
    this.currentUser.mail = this.f.email.value;
    this.currentUser.userName = this.f.userName.value;
    this.currentUser.occupation = this.f.occupation.value;
    this.managementUsersService.updateManagementEmail(this.currentUser).subscribe(response=>{
      this.updating = false;
        if(response)
        {
          this.toastrService.success('Updated successfuly');
          this.getTopManagementList();
          this.modalReference.close();
        }
        else
        {
          this.toastrService.error('An error occured');
        }
    });
  }

}
