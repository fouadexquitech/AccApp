import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './login/login.component';
import { AssignPackageComponent } from './assign-package/assign-package.component';
import { NavComponent } from './nav/nav.component';
import { HomeComponent } from './home/home.component';
import { AlertComponent } from './_components';
import { AssignPackageService } from './assign-package/assign-package.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap'
import { PackageListComponent } from './package-list/package-list.component';
import { PackageSupplierComponent } from './package-supplier/package-supplier.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
//Angular Material Stuff
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatCardModule} from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {MatDividerModule} from '@angular/material/divider';
import { PackageComparisonComponent } from './package-comparison/package-comparison.component';
import { JwtInterceptor, ErrorInterceptor } from './_helpers';
import { ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgSelect2Module } from 'ng-select2';
import { DataTablesModule } from 'angular-datatables';
import { ConfirmationDialogComponent } from './_components/confirmation-dialog/confirmation-dialog.component';

import { ConfirmationDialogService } from './_components/confirmation-dialog/confirmation-dialog.service';
import { RevisionDetailsComponent } from './revision-details/revision-details.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { ManagementUsersComponent } from './management-users/management-users.component';
import { ConfirmBoxConfigModule, DialogConfigModule, NgxAwesomePopupModule, ToastNotificationConfigModule } from '@costlydeveloper/ngx-awesome-popup';
import { TechnicalConditionsComponent } from './technical-conditions/technical-conditions.component';
import { PackageGroupsComponent } from './package-groups/package-groups.component';
import { PackageComparisonNovoComponent } from './package-comparison-novo/package-comparison-novo.component';
import { TagInputModule } from 'ngx-chips';
import { SuppliersComponent } from './suppliers/suppliers.component';
import { PackagesComponent } from './packages/packages.component';
import { ScrollContainerComponent } from './_components/scroll-container/scroll-container.component';
import { BoqListTableComponent } from './boq-list-table/boq-list-table.component';
import { AssignPackageFilterComponent } from './assign-package-filter/assign-package-filter.component';
import { FuseDrawerModule } from './@fuse/drawer';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AssignPackageComponent,
    NavComponent,
    HomeComponent,
    AlertComponent,
    PackageListComponent,
    PackageSupplierComponent,
    PackageComparisonComponent,
    ConfirmationDialogComponent,
    RevisionDetailsComponent,
    ManagementUsersComponent,
    TechnicalConditionsComponent,
    PackageGroupsComponent,
    PackageComparisonNovoComponent,
    SuppliersComponent,
    PackagesComponent,
    ScrollContainerComponent,
    BoqListTableComponent,
    AssignPackageFilterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCardModule,
    MatInputModule,
    MatDividerModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    ToastrModule.forRoot(),
    NgxAwesomePopupModule.forRoot(), // Essential, mandatory main module.
    DialogConfigModule.forRoot(), // Needed for instantiating dynamic components.
    ConfirmBoxConfigModule.forRoot(), // Needed for instantiating confirm boxes.
    ToastNotificationConfigModule.forRoot(), // Needed for instantiating toast notifications.
    NgxSpinnerModule,
    NgSelect2Module,
    DataTablesModule,
    NgbModule,
    AngularEditorModule,
    TagInputModule,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    FuseDrawerModule
    ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    AssignPackageService,
    ConfirmationDialogService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
