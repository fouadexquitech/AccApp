import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { SupplierPercent, SupplierResrouces } from './package-comparison.model';

@Injectable({
  providedIn: 'root'
})
export class PackageComparisonService {
  baseUrl = '';


  constructor(private http: HttpClient) {
    this.baseUrl = environment.baseApiUrl + "api/";
  }

  GetPackageSuppliersPrice(IdPkge: number): Observable<any> {
    return this.http.get(this.baseUrl + 'Package/GetPackageSuppliersPrice?IdPkge=' + IdPkge).pipe(
      map(res => res), catchError(this.handleError)
    );
  }


  GetSupplierPackagesList(PackId: number): Observable<any> {
    return this.http.get(this.baseUrl + 'SupplierPackages/GetSupplierPackagesList?packageid=' + PackId).pipe(
      map(res => res), catchError(this.handleError)
    );
  }

  AssignSupplierPackage(PackId: number, input: SupplierPercent[]): Observable<any> {
    return this.http.post(this.baseUrl + 'RevisionDetails/AssignSupplierPackage?packId=' + PackId, input).pipe(
      map(res => res), catchError(this.handleError)
    );
  }

  AssignSupplierRessource(packId: number, input: SupplierResrouces[]): Observable<any> {
    return this.http.post(this.baseUrl + 'RevisionDetails/AssignSupplierRessource?packId=' + packId, input).pipe(
      map(res => res), catchError(this.handleError)
    );
  }


  handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
