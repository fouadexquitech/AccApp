import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ConfirmBoxInitializer, DialogLayoutDisplay } from '@costlydeveloper/ngx-awesome-popup';
import { ModalDismissReasons, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Package } from '../packages/packages.models';
import { packagesService } from './packages.service';

@Component({
  selector: 'app-packages',
  templateUrl: './packages.component.html',
  styleUrls: ['./packages.component.css']
})

export class PackagesComponent implements OnInit {
  list : Package[] = [];
  addedList : Package[] = [];
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
  currentUser : Package;

  public dtOptions: DataTables.Settings = {
    pagingType: 'full_numbers',
    pageLength: 10,
    searching : true,
    destroy : true,
    responsive : true
  };
  public dtTrigger: Subject<any> = new Subject<any>();
  // isSearching : boolean = false;
  
  constructor(
    private modalService: NgbModal, private toastrService : ToastrService, 
    private packagesService : packagesService,
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
    this.getpackagesList();
  }

  getpackagesList()
  {
    this.loading = true;
      this.packagesService.Getpackages(this.filter).subscribe(data=>{
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
    this.getpackagesList();
  }


  addUserRow()
  {
    this.addedList.push({pkgeId : 0, pkgeName : null, division : null});
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
      this.addedList.forEach((Package, index)=>
        {
          bulkTable.rows[index + 1].style.borderColor = '';
            if(Package.pkgeName == null || Package.division == null)
            {
              valid = false;
              this.toastrService.error('Required fields');
              bulkTable.rows[index + 1].style.borderColor = '#dc3545';
            }
        });

        if(valid)
        {
          this.savingBulk = true;
            this.packagesService.addpackage(this.addedList).subscribe(data=>{
              this.savingBulk = false;
                if(data)
                {
                    this.toastrService.success('List added successfuly');
                    this.getpackagesList();
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
      this.addedList[index].pkgeName = value;
  }

  mailValueChanged(event : any, index : number)
  {
    let value = event.target.value;
    this.addedList[index].division = value;
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
    this.packagesService.deletepackage(id).subscribe(data=>{
      this.deleting = false;
        if(data)
        {
            this.toastrService.success('Deleted successfuly');
            this.getpackagesList();
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

  editUser(content : any, user : Package)
  {
    this.formEdit = this.formBuilder.group({
      pkgeName: [user.pkgeName, Validators.required],
      division: [user.division, Validators.required]
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
    this.currentUser.pkgeName = this.f.pkgeName.value;
    this.currentUser.division = this.f.division.value;
    this.packagesService.updatepackage(this.currentUser).subscribe(response=>{
      this.updating = false;
        if(response)
        {
          this.toastrService.success('Updated successfuly');
          this.getpackagesList();
          this.modalReference.close();
        }
        else
        {
          this.toastrService.error('An error occured');
        }
    });
  }

}
