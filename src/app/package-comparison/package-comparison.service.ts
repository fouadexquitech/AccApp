import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { SearchInput } from '../assign-package/assign-package.model';
import { AssignSuppliertBoq, AssignSuppliertRes, SupplierBOQ, SupplierPercent, SupplierResrouces } from './package-comparison.model';

@Injectable({
  providedIn: 'root'
})
export class PackageComparisonService {
  baseUrl = '';


  constructor(private http: HttpClient) {
    this.baseUrl = environment.baseApiUrl + "api/";
  }

  GetPackageSuppliersPrice(IdPkge: number, searchInput : SearchInput): Observable<any> {
    const headers = { 'content-type': 'application/json'}  
    const body=JSON.stringify(searchInput);
    return this.http.post(this.baseUrl + 'Package/GetPackageSuppliersPrice?IdPkge=' + IdPkge, body, {'headers':headers}).pipe(
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

  AssignSupplierBOQ(packId: number, input: SupplierBOQ[]): Observable<any> {
    return this.http.post(this.baseUrl + 'RevisionDetails/AssignSupplierBOQ?packId=' + packId, input).pipe(
      map(res => res), catchError(this.handleError)
    );
  }

  AssignSupplierListRessourceList(PackId: number, item: AssignSuppliertRes): Observable<any> {
    return this.http.post(this.baseUrl + 'RevisionDetails/AssignSupplierListRessourceList?packId=' + PackId, item).pipe(
      map(res => res), catchError(this.handleError)
    );
  }

  AssignSupplierListBoqList(PackId: number, item: AssignSuppliertBoq): Observable<any> {
    return this.http.post(this.baseUrl + 'RevisionDetails/AssignSupplierListBoqList?packId=' + PackId, item).pipe(
      map(res => res), catchError(this.handleError)
    );
  }

  getTechConditions(packId : number)
 {
  return this.http.get(this.baseUrl + 'Conditions/GetTechConditions?packId=' + packId).pipe(
    map(res => res), catchError(this.handleError)
  );
 }

 getTechConditionsReply(packageSupliersID : number)
 {
  return this.http.get(this.baseUrl + 'Conditions/GetTechConditionsReply?packageSupliersID=' + packageSupliersID).pipe(
    map(res => res), catchError(this.handleError)
  );
 }

 getComConditionsReply(packageSupliersID : number)
 {
  return this.http.get(this.baseUrl + 'Conditions/GetComConditionsReply?packageSupliersID=' + packageSupliersID).pipe(
    map(res => res), catchError(this.handleError)
  );
 }


  handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
