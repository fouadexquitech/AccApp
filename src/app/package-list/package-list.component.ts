import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { PackageList } from './package-list.model';
import { PackageListService } from './package-list.service';

@Component({
  selector: 'app-package-list',
  templateUrl: './package-list.component.html',
  styleUrls: ['./package-list.component.css']
})
export class PackageListComponent implements OnInit, OnDestroy {

  PackageList: PackageList[] = [];
  public dtOptions: DataTables.Settings = {};
  public dtTrigger: Subject<any> = new Subject<any>();

  constructor(private packageListService: PackageListService , private router: Router , private spinner: NgxSpinnerService,) { }

  ngOnInit(): void {
    this.GetPackageList();
  }

  GetPackageList() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      searching : true,
      destroy : true,
      responsive : true
    };
    //this.spinner.show();
    this.packageListService.GetPackageList().subscribe((data) => {
      if (data) {
        this.PackageList = data;
        //this.spinner.hide();
      }else{
        //this.spinner.hide();
      }
      this.dtTrigger.next();
    });
  }

  onClick(idPkge:number){
    this.router.navigate(['package-supplier'], { state: { packageId: idPkge } });
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
}
