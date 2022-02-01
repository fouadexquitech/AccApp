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
import { PackageListComponent } from './package-list/package-list.component';
import { PackageSupplierComponent } from './package-supplier/package-supplier.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
//Angular Material Stuff
import { MatSelectModule } from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatCardModule} from '@angular/material/card';
import {MatSelect} from '@angular/material/select';
import {MatDividerModule} from '@angular/material/divider';
import { PackageComparisonComponent } from './package-comparison/package-comparison.component';
import { JwtInterceptor, ErrorInterceptor } from './_helpers';
import { ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgSelect2Module } from 'ng-select2';
import { DataTablesModule } from 'angular-datatables';

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
    PackageComparisonComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCardModule,
    MatInputModule,
    MatDividerModule,
    ToastrModule.forRoot(),
    NgxSpinnerModule,
    NgSelect2Module,
    DataTablesModule
    ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    AssignPackageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
