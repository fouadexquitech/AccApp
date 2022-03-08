import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { SupplierInput, SupplierInputList } from './package-supplier.model';

@Injectable({
  providedIn: 'root'
})
export class PackageSupplierService {
  baseUrl = '';


  constructor(private http: HttpClient) {
    this.baseUrl = environment.baseApiUrl + "api/";
  }

  GetSupplierList(IdPkge: number): Observable<any> {
    return this.http.get(this.baseUrl + 'Supplier/GetSupplierList?packID=' + IdPkge).pipe(
      map(res => res), catchError(this.handleError)
    );
  }

  GetPackageById(IdPkge: number): Observable<any> {
    return this.http.get(this.baseUrl + 'Package/GetPackageById?IdPkge=' + IdPkge).pipe(
      map(res => res), catchError(this.handleError)
    );
  }

  DeleteField(fieldId : number)
  {
    return this.http.post(this.baseUrl + 'SupplierPackagesRev/DeleteField?fieldId=' + fieldId, null).pipe(
      map(res => res), catchError(this.handleError)
    );
  }

  GetFields(revisionId: number): Observable<any> {
    return this.http.get(this.baseUrl + 'SupplierPackagesRev/GetFields?revisionid=' + revisionId).pipe(
      map(res => res), catchError(this.handleError)
    );
  }

  AssignPackageSuppliers(PackId: number, supInputList: SupplierInputList[], filePath : string, emailcontent : string, byBoq : number): Observable<any> {
    return this.http.post(this.baseUrl + 'SupplierPackages/AssignPackageSuppliers?packId=' + PackId + '&FilePath=' + filePath + '&EmailContent=' + emailcontent + '&ByBoq=' + byBoq, supInputList).pipe(
      map(res => res), catchError(this.handleError)
    );
  }

  GetEmailTemplate(language : string)
  {
    return this.http.get(this.baseUrl + 'Logon/GetSuppliersEmailTemplate?Lang=' + language).pipe(
      map(res => res), catchError(this.handleError)
    );
  }

  
  GetCurrencies(): Observable<any> {
    return this.http.get(this.baseUrl + 'SupplierPackagesRev/GetCurrencies').pipe(
      map(res => res), catchError(this.handleError)
    );
  }

  GetSupplierPackagesList(PackId: number): Observable<any> {
    return this.http.get(this.baseUrl + 'SupplierPackages/GetSupplierPackagesList?packageid=' + PackId).pipe(
      map(res => res), catchError(this.handleError)
    );
  }

  GetSupplierPackagesRevision(packageSupplierId: number): Observable<any> {
    return this.http.get(this.baseUrl + 'SupplierPackagesRev/GetSupplierPackagesRevision?packageSupplierId=' + packageSupplierId).pipe(
      map(res => res), catchError(this.handleError)
    );
  }

  GetSupplierPackagesSingleRevision(revision: number): Observable<any> {
    return this.http.get(this.baseUrl + 'SupplierPackagesRev/GetSupplierPackagesSingleRevision?revisionId=' + revision).pipe(
      map(res => res), catchError(this.handleError)
    );
  }

  validateExcelBeforeAssign(packId: number, byBoq : number) : Observable<any> 
  {
    return this.http.post(this.baseUrl + 'SupplierPackages/ValidateExcelBeforeAssign?packId=' + packId + '&byBoq=' + byBoq, null).pipe(
      map(res => res), catchError(this.handleError)
    );
  }

  AddRevision(PackageSupplierId: number, PackSuppDate: string, input: File, CurrencyId : number, ExchangeRate : number): Observable<any> {
    const formData = new FormData();
    formData.append('ExcelFile' , input , input.name)
    return this.http.post(this.baseUrl + 'RevisionDetails/AddRevision?PackageSupplierId=' + 
    PackageSupplierId + '&PackSuppDate=' + 
    PackSuppDate + '&curId=' + 
    CurrencyId + '&ExchRate=' + ExchangeRate, formData).pipe(
      map(res => res), catchError(this.handleError)
    );
  }

  GetRevisionDetails(RevisionId : number, itemDesc : string, resource : string)
  {
    return this.http.get(this.baseUrl + 'RevisionDetails/GetRevisionDetails?RevisionId=' + RevisionId + '&itemDesc=' + itemDesc + '&resource=' + resource).pipe(
      map(res => res), catchError(this.handleError)
    );
  }

  AddField(revId: number, lbl: string, val: number, type : number): Observable<any> {
    return this.http.post(this.baseUrl + 'SupplierPackagesRev/AddField?revId=' + revId + '&lbl=' + lbl + '&val=' + val + '&type=' + type, null).pipe(
      map(res => res), catchError(this.handleError)
    );
  }

  downloadFile(fileName: string): Observable<any> {
    
   return this.http.get(this.baseUrl + 'SupplierPackages/DownloadFile?filename=' + fileName).pipe(
    map(res => res), catchError(this.handleError)
  );
}

 getExchangeRate(selectedCurrency : string, projectCurrency : string)
 {
  return this.http.get('http://api.exchangeratesapi.io/v1/latest?access_key=ac94d97d8f42506333ce81bcf6b68544&symbols=USD,' + projectCurrency + ',' + selectedCurrency).pipe(
    map(res => res), catchError(this.handleError)
  );
 }

 sendTechnicalConditions(packId : number)
 {
    return this.http.post(this.baseUrl + 'Conditions/SendTechnicalConditions?packId=' + packId, null).pipe(
    map(res => res), catchError(this.handleError)
  );
 }

 updateTechnicalConditions(packageSupplierId: number, input: File)
 {
  const formData = new FormData();
  formData.append('ExcelFile' , input , input.name)
    return this.http.post(this.baseUrl + 'Conditions/UpdateTechnicalConditions?PackageSupliersID=' + packageSupplierId, formData).pipe(
    map(res => res), catchError(this.handleError)
  );
 }

 updateCommercialConditions(packageSupplierId: number, input: File)
 {
  const formData = new FormData();
  formData.append('ExcelFile' , input , input.name)
    return this.http.post(this.baseUrl + 'Conditions/UpdateCommercialConditions?PackageSupliersID=' + packageSupplierId, formData).pipe(
    map(res => res), catchError(this.handleError)
  );
 }

 getComConditions() : Observable<any>
 {
  return this.http.get(this.baseUrl + 'Conditions/GetComConditions').pipe(
    map(res => res), catchError(this.handleError)
  );
 }

 

  handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
