import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SupplierInput, SupplierList, SupplierPackagesList, SupplierPackagesRevList, CurrencyList } from './package-supplier.model';
import { PackageSupplierService } from './package-supplier.service';
import { environment } from '../../environments/environment';
import { ProjectCurrency } from '../login/login.model';

declare var $: any;
@Component({
  selector: 'app-package-supplier',
  templateUrl: './package-supplier.component.html',
  styleUrls: ['./package-supplier.component.css']
})
export class PackageSupplierComponent implements OnInit {
 
  PackageId: number = 0;
  PackageName = "";
  FilePath = "";
  SupplierList: SupplierList[] = [];
  selectedSuppliers: Array<number> = [];
  SupplierInput: SupplierInput[] = [];
  SupplierPackagesList: SupplierPackagesList[] = [];
  SupplierPackagesRevList: SupplierPackagesRevList[] = [];
  CurrencyList : CurrencyList[] = [];

  expandedDetail: boolean = false;
  currentRowIndex: number = -1;
  selectedFile: File = null;
  selectedPsId: number = 0;
  selectedRevisionId: number = 0;
  selectedCurrencyId : number = 0;
  public isAssigning : boolean = false;
  public addingRevision : boolean = false;

  constructor(private router: Router, private packageSupplierService: PackageSupplierService, private spinner: NgxSpinnerService, private toastr: ToastrService) {
    if (this.router.getCurrentNavigation().extras.state != undefined) {
      this.PackageId = this.router.getCurrentNavigation().extras.state.packageId;
    } else {
      this.router.navigateByUrl("/package-list");
    }
  }

  ngOnInit(): void {

    if (this.PackageId != null && this.PackageId != 0) {
      this.GetPackageById(Number(this.PackageId));
    }

    this.GetSupplierList(Number(this.PackageId));

    this.GetSupplierPackagesList();
  }

  GetPackageById(IdPkge: number) {
    this.packageSupplierService.GetPackageById(IdPkge).subscribe((data) => {
      if (data) {
        this.PackageName = data.packageName;
        this.FilePath = data.filePath;
      }
    });
  }

  GetCurrencyList()
  {
    this.packageSupplierService.GetCurrencies().subscribe((data) => {
      if (data) {
        this.CurrencyList = data;
        let projectCurrency = JSON.parse(localStorage.getItem("currency")) as ProjectCurrency;
        this.selectedCurrencyId = projectCurrency.curId;
      }
    });
  }

  GetSupplierList(IdPkge: number) {
    this.packageSupplierService.GetSupplierList(IdPkge).subscribe((data) => {
      if (data) {
        this.SupplierList = data;
      }
    });
  }

  AssignSuppliers() {
    //this.spinner.show();
    this.isAssigning = true;
    if (this.selectedSuppliers.length > 0) {
      this.SupplierInput = [];
      this.selectedSuppliers.forEach(element => {
        this.SupplierInput.push({ supID: element });
      });

      if (this.SupplierInput.length > 0) {
        this.packageSupplierService.AssignPackageSuppliers(this.PackageId, this.SupplierInput).subscribe((data) => {
          if (data) {
            //this.spinner.hide();
            this.isAssigning = false;
            this.toastr.success("Assigned !!")
            this.GetSupplierPackagesList();
          }
        });
      }

    } else {
      //this.spinner.hide();
      this.isAssigning = false;
      this.toastr.error('You Should Select at Least 1 Supplier !!')
    }
  }

  GetSupplierPackagesList() {
    this.packageSupplierService.GetSupplierPackagesList(this.PackageId).subscribe((data) => {
      if (data) {
        this.SupplierPackagesList = data;
        this.selectedSuppliers = [];
        this.SupplierPackagesList.forEach(element => {
          this.selectedSuppliers.push(element.psSuppId);
        });
      }
    });
  }

  GetSupplierPackagesRevision(packageSupplierId: number) {
    this.packageSupplierService.GetSupplierPackagesRevision(packageSupplierId).subscribe((data) => {
      if (data) {
        this.SupplierPackagesRevList = data;
      }
    });
  }

  Toggle(data: SupplierPackagesList, index: number) {

    if (this.currentRowIndex == index) {
      this.currentRowIndex = -1;
    } else {
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
    var exchangeRate = document.getElementById("exchangeRate") as HTMLInputElement;
    file.value = null;
    exchangeRate.value = "0";
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
    this.addingRevision = true;
    var date = document.getElementById("revisionDate") as HTMLInputElement;
    var exchangeRate = document.getElementById("exchangeRate") as HTMLInputElement;
    if (date.value) {
      
      if(this.selectedCurrencyId > 0)
      {
        if(exchangeRate.value)
        {
      if (this.selectedFile != null) 
        {
          this.addingRevision = true;
          this.packageSupplierService.AddRevision(this.selectedPsId, date.value, this.selectedFile, this.selectedCurrencyId, Number(exchangeRate.value)).subscribe((data) => {
            if (data) {
              // Refresh Supplier Package Revision List
              this.addingRevision = false;
              this.GetSupplierPackagesRevision(this.selectedPsId);

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
    this.spinner.show();
    this.packageSupplierService.validateExcelBeforeAssign(this.PackageId).subscribe((data) => {
      if (data) {
        this.spinner.hide();
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
    labelInput.value = null;
    valueInput.value = null;
    this.selectedRevisionId = 0;

  }

  AddField() {
    var labelInput = document.getElementById("labelInput") as HTMLInputElement;
    var valueInput = document.getElementById("valueInput") as HTMLInputElement;

    if (labelInput.value && valueInput.value) {
      this.packageSupplierService.AddField(this.selectedRevisionId, labelInput.value, Number(valueInput.value)).subscribe((data) => {
        this.SupplierPackagesRevList.find(x => x.prRevId == this.selectedRevisionId).prTotPrice = data;
        this.CloseFieldModal();
        this.toastr.success("A new field has been added !")
      });
    } else {
      this.toastr.error("Please Fill All Fields !")
    }

  }

  onCompare() {
    this.router.navigate(['package-comparison'], { state: { packageId: this.PackageId } });
  }

  validateExcel()
  {

  }
}
