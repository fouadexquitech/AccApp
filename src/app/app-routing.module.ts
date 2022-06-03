import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssignPackageComponent } from './assign-package/assign-package.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { ManagementUsersComponent } from './management-users/management-users.component';
import { PackageComparisonNovoComponent } from './package-comparison-novo/package-comparison-novo.component';
import { PackageComparisonComponent } from './package-comparison/package-comparison.component';
import { PackageGroupsComponent } from './package-groups/package-groups.component';
import { PackageListComponent } from './package-list/package-list.component';
import { PackageSupplierComponent } from './package-supplier/package-supplier.component';
import { RevisionDetailsComponent } from './revision-details/revision-details.component';
import { TechnicalConditionsComponent } from './technical-conditions/technical-conditions.component';

import { AuthGuard } from './_helpers';


const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'assign-package', component: AssignPackageComponent, canActivate: [AuthGuard] },
  { path: 'package-list', component: PackageListComponent, canActivate: [AuthGuard] },
  { path: 'package-supplier/:packageId', component: PackageSupplierComponent, canActivate: [AuthGuard] },
  { path: 'package-comparison', component: PackageComparisonComponent, canActivate: [AuthGuard] },
  { path: 'package-comparison-novo', component: PackageComparisonNovoComponent, canActivate: [AuthGuard] },
  { path: 'revision-details/:revisionId/:psId/:psByBoq/:packageId/:packageName', component: RevisionDetailsComponent, canActivate: [AuthGuard] },
  { path: 'management-users', component: ManagementUsersComponent, canActivate: [AuthGuard] },
  { path: 'technical-conditions/:packageId/:packageName', component: TechnicalConditionsComponent, canActivate: [AuthGuard] },
  { path: 'package-groups/:packageId/:pkgeName/:byBoq', component: PackageGroupsComponent, canActivate: [AuthGuard] },

  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
