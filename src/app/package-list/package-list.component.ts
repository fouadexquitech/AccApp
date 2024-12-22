import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { PackageList } from './package-list.model';
import { PackageListService } from './package-list.service';
import { AssignPackageService } from '../assign-package/assign-package.service';
import { PackageSupplierService } from '../package-supplier/package-supplier.service';
import { SupplierPackagesList } from '../package-supplier/package-supplier.model';
//AH21122024
import { LoginService } from '../login/login.service';
import { User } from '../_models';
///AH21122024

@Component({
  selector: 'app-package-list',
  templateUrl: './package-list.component.html',
  styleUrls: ['./package-list.component.css']
})
export class PackageListComponent implements OnInit, OnDestroy {

  PackageList: PackageList[] = [];
  SupplierPackagesList: SupplierPackagesList[] = [];
  selectedPackId:number;
  isShown : boolean = false;
  show : boolean = false;
  toggleClass : string = 'fa-solid fa-toggle-off';
  public user : User;

  public dtOptions: DataTables.Settings = {
    pagingType: 'full_numbers',
    pageLength: 10,
    searching : true,
    destroy : true,
    responsive : true
  };
  public dtTrigger: Subject<any> = new Subject<any>();
  isSearching : boolean = false;

  constructor(private assignPackageService : AssignPackageService,
              private packageListService: PackageListService , 
              private router: Router , 
              private spinner: NgxSpinnerService,
              private packageSupplierService: PackageSupplierService,
              private loginService: LoginService,) 
              { 
                this.loginService.user.subscribe(x => this.user = x);
              }

  ngOnInit(): void 
  {
    this.GetPackageList();
  }

  GetPackageList() {
    //this.spinner.show();
    this.isSearching = true;

    let CostConn=this.user.usrLoggedConnString;
    console.log(CostConn);
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

//AH072024
    this.assignPackageService.GetPackageList(true).subscribe((data) => {
      this.isSearching = false;
      if (data) {
        let newarr = data.sort((a:any, b:any) => (a.pkgeName - b.pkgeName) ? 1 : -1);
        this.PackageList = newarr;
        //this.spinner.hide();
      }else{
        //this.spinner.hide();
      }
      this.dtTrigger.next();
    });

    // this.packageListService.GetPackageList().subscribe((data) => {
    //   this.isSearching = false;
    //   if (data) {
    //     let newarr = data.sort((a:any, b:any) => (a.pkgeName - b.pkgeName) ? 1 : -1);
    //     this.PackageList = newarr;
    //     //this.spinner.hide();
    //   }else{
    //     //this.spinner.hide();
    //   }
    //   this.dtTrigger.next();
    // });
//AH072024
  }

   sortFunc(a:any, b:any) {
    if ( a.index < b.index ){
      return -1;
    }
    if ( a.index > b.index ){
      return 1;
    }
    return 0;
  }

  onClick(idPkge:number){
    this.router.navigate(['package-supplier', idPkge]);
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  routeToTechnicalConditions(idPkge:number, pkgeName : string)
  {
    this.router.navigate(['technical-conditions'], { state: { packageId: idPkge, pkgeName : pkgeName } });
  }

  toggleShow(idPkge:number)
  {
    let CostConn=this.user.usrLoggedConnString;
    this.loginService.CheckConnection(CostConn).subscribe((data) => { });

    this.packageSupplierService.GetSupplierPackagesList(idPkge).subscribe((data) => {
      if (data) {
        this.SupplierPackagesList = data;
      }
    });
    
    this.selectedPackId=idPkge;
    this.isShown = !this.isShown;
    this.toggleClass = (this.isShown ? 'fa-solid fa-toggle-on' : 'fa-solid fa-toggle-off');
  }

}
