import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TblTechCond, TechConditions } from '../package-comparison/package-comparison.model';
import { PackageComparisonService } from '../package-comparison/package-comparison.service';

@Component({
  selector: 'app-technical-conditions',
  templateUrl: './technical-conditions.component.html',
  styleUrls: ['./technical-conditions.component.css']
})
export class TechnicalConditionsComponent implements OnInit {

  packageId : number = 0;
  list : TechConditions[] = [];
  packageName : string;
  constructor(private router: Router, private packageComparisonService : PackageComparisonService) {
    if (this.router.getCurrentNavigation().extras.state != undefined) {
      this.packageId = this.router.getCurrentNavigation().extras.state.packageId;
      this.packageName = this.router.getCurrentNavigation().extras.state.pkgeName;
    }

   }

  ngOnInit(): void {
    this.getTechnicalConditionsList();
  }

  getTechnicalConditionsList()
  {
    this.packageComparisonService.getTechConditions(this.packageId).subscribe(data=>{
      this.list = data;
      
   });
  }

}
