import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SupplierPackagesList } from '../package-supplier/package-supplier.model';
import { PackageSuppliersPrice, RevisionDetails, SupplierPercent, SupplierResrouces } from './package-comparison.model';
import { PackageComparisonService } from './package-comparison.service';

declare var $: any;
@Component({
  selector: 'app-package-comparison',
  templateUrl: './package-comparison.component.html',
  styleUrls: ['./package-comparison.component.css']
})
export class PackageComparisonComponent implements OnInit {
  PackageId: number = 0;
  packageSuppliersPrice: PackageSuppliersPrice[] = [];
  columns = ["Resource Id","Resource Name", "Resource Unit", "Resource Qty"];
  revisionDetails: RevisionDetails[] = [];
  comparisonObject: any = [];
  comparisonObjectColumns: any = [];
  totalPackageSuppliersPrice: any = [];
  SupplierPackagesList: SupplierPackagesList[] = [];
  supplierPercent: SupplierPercent[] = [];
  supplierResourcePercent : SupplierPercent[] = [];
  supplierResrouces : SupplierResrouces[] = [];
  show: boolean = false;

  constructor(private router: Router, private packageComparisonService: PackageComparisonService, private spinner: NgxSpinnerService, private toastr: ToastrService) {
    if (this.router.getCurrentNavigation().extras.state != undefined) {
      this.PackageId = this.router.getCurrentNavigation().extras.state.packageId;
    } else {
      this.router.navigateByUrl("/package-list");
    }
  }

  ngOnInit(): void {
    this.GetPackageSuppliersPrice();
    this.GetSupplierPackagesList()
  }

  GetPackageSuppliersPrice() {
    this.spinner.show();
    this.packageComparisonService.GetPackageSuppliersPrice(this.PackageId).subscribe((data) => {
      if (data) {
        
        this.packageSuppliersPrice = data;
   
        let count = 0;
        let newObj: any[] = [];

        this.packageSuppliersPrice.forEach(element => {
          this.columns.push(element.supplierName);
          count++;
          if (count > 1) {
            element.revisionDetails.forEach(revision => {
              var record = this.comparisonObject.find((x: { [x: string]: number; }) => x["resourceID"] == revision.resourceID)
              if (record) {
                let newColumn = "price" + count;
                record[newColumn] = revision.price;
              }
            });
          } else {
            this.comparisonObject = element.revisionDetails;
          }
        });
        //console.log(newObj);
        if (newObj.length > 0) {
          this.comparisonObject = newObj;
        }
        if(this.comparisonObject[0] != undefined)
        {
          for (let key of Object.keys(this.comparisonObject[0])) {
            
             if (key != "perc") {
              this.comparisonObjectColumns.push(key);
             }
          }
        }
        
        let lowest = this.packageSuppliersPrice[0].totalprice;

        this.packageSuppliersPrice.forEach(element => {
          let record: any = element;
          if (element.totalprice < lowest) {
            lowest = element.totalprice;
            record["lowest"] = 1;
            this.totalPackageSuppliersPrice.push(record);
          } else {
            record["lowest"] = 0;
            this.totalPackageSuppliersPrice.push(record);
          }
        });

        this.spinner.hide();
      } else {
        this.spinner.hide();
      }
    });
    
  }

  GetSupplierPackagesList() {
    this.packageComparisonService.GetSupplierPackagesList(this.PackageId).subscribe((data) => {
      if (data) {
        this.SupplierPackagesList = data;
      }
    });
  }

  AssignPackageSuppliers() {
    this.supplierPercent = [];

    let total = 0;
    for (let index = 0; index < this.SupplierPackagesList.length; index++) {
      var input = document.getElementById("valueInput" + index) as HTMLInputElement;
      this.supplierPercent.push({ supID: this.SupplierPackagesList[index].psSuppId, percent: Number(input.value) });
      total += Number(input.value);
    }

    if (total != 100) {
      this.toastr.error("Total Inputs Should be equal to 100");
      this.supplierPercent = [];
    } else {
      this.packageComparisonService.AssignSupplierPackage(this.PackageId, this.supplierPercent).subscribe((data) => {
        if (data) {
          this.supplierPercent = [];
          this.toastr.success("Assigned Successfully !!");
          $("#assignPackageModal").modal('hide');
          this.comparisonObjectColumns = [];
          this.totalPackageSuppliersPrice = [];
          this.columns = ["Resource Id","Resource Name", "Resource Unit", "Resource Qty"];
          this.GetPackageSuppliersPrice();
        }
      });
    }
  }

  CloseAssignModal() {
    for (let index = 0; index < this.SupplierPackagesList.length; index++) {
      var input = document.getElementById("valueInput" + index) as HTMLInputElement;
      input.value = null;
    }
    this.supplierPercent = [];
    $("#assignPackageModal").modal('hide');
  }

  OpenAssignModal() {
    console.log(this.SupplierPackagesList);
    for (let index = 0; index < this.SupplierPackagesList.length; index++) {
      var input = document.getElementById("valueInput" + index) as HTMLInputElement;
      input.value = null;
    }
    $("#assignPackageModal").modal('show');
  }

  OpenAssignInputs() {
    this.show = true;
  }

  Cancel(){
    this.show = false;
  }

  Save(){
    
    //this.show = false;
     var table = document.getElementById("myTable") as HTMLTableElement;
     this.supplierResrouces = [];
     for (let i in table.rows) {
        let row = table.rows[i];
        //iterate through rows
    //    //rows would be accessed using the "row" variable assigned in the for loop
        //console.log("row",row)
        for (let j in row.cells) {
          let col = row.cells[j];
          if(parseInt(i) > 0 && parseInt(i) < (table.rows.length - 2))
          {
            let td = col as HTMLTableCellElement;
            if(parseInt(j) == 0)
            {
              //console.log(td.innerHTML);
            }
            
             
             
          }
          if(j == '6')
          {
            if(col.hasChildNodes)
            {
              for (let k in col.childNodes)
              {
                let p = col.childNodes[k];
                 if(p.hasChildNodes){

                    if(col.childNodes[k].childNodes[2] != undefined)
                    {
                        let input = col.childNodes[k].childNodes[2] as HTMLInputElement;
                        //let totalPerc = parseFloat()
                        //console.log(input.value);
                    }
                 }
              }
            }
          }
            
          //      //iterate through columns
          //columns would be accessed using the "col" variable assigned in the for loop
       }  
    }

  }

  saveNew(){
    this.supplierResrouces = [];
    this.supplierResourcePercent = [];
    var table = document.getElementById("myTable") as HTMLTableElement;
    let percIsValid = true;
    this.comparisonObject.forEach((item : any, index : any) => {
      this.supplierResourcePercent = [];
      let resourceId = item.resourceID;
     
      let totalPerc = 0;
      /**skip the table header */
      let row = table.rows[index + 1];
      
      /*get the last column which contains the supplier percentage inputs */
      let col = row.cells[row.cells.length - 1];
      
      if(col.hasChildNodes)
      {
        
        for (let k in col.childNodes)
        {
            let p = col.childNodes[k];
            if(p.hasChildNodes)
            {
              if(col.childNodes[k].childNodes[2] != undefined)
              {
                  let input = col.childNodes[k].childNodes[2] as HTMLInputElement;
                  totalPerc += Number(input.value);
              
                  const newSupplierPerc : SupplierPercent = {
                    supID : Number(input.id.split('-')[1]),
                    percent : Number(input.value)
                };

                this.supplierResourcePercent.push(newSupplierPerc);
                
              }
          }
        }

        if(totalPerc > 100 || totalPerc < 100)
        { 
          percIsValid = false;
          row.style.borderColor = "red";
        }
        else
        {    
          row.style.borderColor = "";
        }

        const newSupplierResource : SupplierResrouces = {
          resourceID : Number(resourceId),
          supplierPercents : this.supplierResourcePercent

        };
        this.supplierResrouces.push(newSupplierResource);

      }
     
    });
  

    if (!percIsValid) 
    {
        this.toastr.error("Total percentage for each resource should be equal to 100");
        this.supplierResrouces = [];
        this.supplierResourcePercent = [];
        percIsValid = true;
    } 
    else {
      
        this.packageComparisonService.AssignSupplierRessource(this.PackageId, this.supplierResrouces).subscribe((data) => {
        if (data) {
        this.supplierResrouces = [];
        this.supplierResourcePercent = [];
        this.toastr.success("Assigned Successfully !!");
        this.comparisonObjectColumns = [];
        this.totalPackageSuppliersPrice = [];
        this.columns = ["Resource Id","Resource Name", "Resource Unit", "Resource Qty"];
        this.GetPackageSuppliersPrice();
        this.Cancel();
        }
      });
    }

  }
}
