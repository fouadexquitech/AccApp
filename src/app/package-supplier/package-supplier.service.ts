import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { SearchInput } from '../assign-package/assign-package.model';
import { AccConditions, TechConditions, TechCondModel } from '../package-comparison/package-comparison.model';
import { AssignPackageTemplate, SupplierInput, SupplierInputList } from './package-supplier.model';

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

  DeleteField(fieldId : number,CostConn: string)
  {
    return this.http.post(this.baseUrl + 'SupplierPackagesRev/DeleteField?fieldId=' + fieldId+ '&CostConn='+CostConn, null).pipe(
      map(res => res), catchError(this.handleError)
    );
  }

  GetFields(revisionId: number,CostConn: string): Observable<any> {
    return this.http.get(this.baseUrl + 'SupplierPackagesRev/GetFields?revisionid=' + revisionId+ '&CostConn='+CostConn).pipe(
      map(res => res), catchError(this.handleError)
    );
  }

  AssignPackageSuppliers(assignPackageTemplate : AssignPackageTemplate, attachements : File[],CostConn: string): Observable<any> {
    const formData = new FormData();
  
    formData.append('assignPackageTemplate' , JSON.stringify(assignPackageTemplate));
    attachements.forEach(attachement =>{
    formData.append(attachement?.name, attachement , attachement?.name);
    });
  
    return this.http.post(this.baseUrl + 'SupplierPackages/AssignPackageSuppliers?CostConn=' + CostConn, formData).pipe(
      map(res => res), catchError(this.handleError)
    );
  }

  GetEmailTemplate(language : string, packId :number , projName :string , revExpiryDate :string)
  {
        console.log(packId);
        console.log(projName);
    return this.http.get(this.baseUrl + 'Logon/GetSuppliersEmailTemplate?Lang=' + language+ '&packId=' + packId+ '&projName=' + projName + '&revExpiryDate='+revExpiryDate).pipe(
      map(res => res), catchError(this.handleError)
    );
  }
  
  GetDefaultProjectEmailTemplate(costDb : string)
  {
    return this.http.get(this.baseUrl + 'Logon/GetDefaultProjectEmailTemplate?costDb=' + costDb).pipe(
      map(res => res), catchError(this.handleError)
    );
  }

  GetCurrencies(): Observable<any> {
    return this.http.get(this.baseUrl + 'SupplierPackagesRev/GetCurrencies').pipe(
      map(res => res), catchError(this.handleError)
    );
  }

  GetSupplierPackagesList(PackId: number,CostConn: string): Observable<any> {
    return this.http.get(this.baseUrl + 'SupplierPackages/GetSupplierPackagesList?packageid=' + PackId+ '&CostConn='+CostConn).pipe(
      map(res => res), catchError(this.handleError)
    );
  }

  GetSupplierPackage(psId: number,CostConn: string): Observable<any> {
    return this.http.get(this.baseUrl + 'SupplierPackages/GetSupplierPackage?psId=' + psId+ '&CostConn='+CostConn).pipe(
      map(res => res), catchError(this.handleError)
    );
  }

  GetSupplierPackagesRevision(packageSupplierId: number,CostConn: string): Observable<any> {
    return this.http.get(this.baseUrl + 'SupplierPackagesRev/GetSupplierPackagesRevision?packageSupplierId=' + packageSupplierId+ '&CostConn='+CostConn).pipe(
      map(res => res), catchError(this.handleError)
    );
  }

  GetSupplierPackagesSingleRevision(revision: number,CostConn: string): Observable<any> {
    return this.http.get(this.baseUrl + 'SupplierPackagesRev/GetSupplierPackagesSingleRevision?revisionId=' + revision+ '&CostConn='+CostConn).pipe(
      map(res => res), catchError(this.handleError)
    );
  }

  validateExcelBeforeAssign(packId: number, byBoq : number,CostConn: string) : Observable<any> 
  {
    return this.http.post(this.baseUrl + 'SupplierPackages/ValidateExcelBeforeAssign?packId=' + packId + '&byBoq=' + byBoq+ '&CostConn='+CostConn, null).pipe(
      map(res => res), catchError(this.handleError)
    );
  }

  TestSendMail() : Observable<any> 
  {
    return this.http.post(this.baseUrl + 'SupplierPackages/TestSendMail', null).pipe(
      map(res => res), catchError(this.handleError)
    );
  }


  AddRevision(PackageSupplierId: number, PackSuppDate: string, input: File, CurrencyId : number, ExchangeRate : number, discount : number, addedItem : number,CostConn: string): Observable<any> {
    const formData = new FormData();
    formData.append('ExcelFile' , input , input.name)
    return this.http.post(this.baseUrl + 'RevisionDetails/AddRevision?PackageSupplierId=' + 
    PackageSupplierId + '&PackSuppDate=' + 
    PackSuppDate + '&curId=' + 
    CurrencyId + '&ExchRate=' + ExchangeRate+ '&Discount=' + discount+'&AddedItem=' + addedItem+ '&CostConn='+CostConn, formData).pipe(
      map(res => res), catchError(this.handleError)
    );
  }
  

  GetRevisionDetails(RevisionId : number, itemDesc : string, resource : string,CostConn: string)
  {
    return this.http.get(this.baseUrl + 'RevisionDetails/GetRevisionDetails?RevisionId=' + RevisionId + '&itemDesc=' + itemDesc + '&resource=' + resource+ '&CostConn='+CostConn).pipe(
      map(res => res), catchError(this.handleError)
    );
  }

  AddField(revId: number, lbl: string, val: number, type : number,CostConn: string): Observable<any> {
    return this.http.post(this.baseUrl + 'SupplierPackagesRev/AddField?revId=' + revId + '&lbl=' + lbl + '&val=' + val + '&type=' + type+ '&CostConn='+CostConn, null).pipe(
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

 getExchangeRateV2(selectedCurrency : string, projectCurrency : string)
 {
    //let url = 'https://free.currconv.com/api/v7/convert?q=' + selectedCurrency + '_' + projectCurrency + '&compact=ultra&apiKey=7726dd1cebe5aeb063da';
    let url = 'https://api.apilayer.com/exchangerates_data/convert?to='+ projectCurrency +'&from='+ selectedCurrency + '&amount=1&apikey=4zN5nYjguyVQhynDgczfYxYpActZD8zx';
    return this.http.get(url).pipe(
      map(res => res), catchError(this.handleError)
    );
 }

 sendTechnicalConditions(packId : number, techCondModel : TechCondModel, userName : string, CostConn: string)
 {
  let headers = new HttpHeaders().set('Content-Type','application/json');
   
    let body = JSON.stringify(techCondModel);
    return this.http.post(this.baseUrl + 'Conditions/SendTechnicalConditions?packId=' + packId + '&userName=' + userName+ '&CostConn='+CostConn, body, {headers: headers}).pipe(
    map(res => res), catchError(this.handleError)
  );
 }

 updateTechnicalConditions(packageId : number, packageSupliersRevisionID: number, input: File,CostConn: string)
 {
  const formData = new FormData();
  formData.append('ExcelFile' , input , input.name)
    return this.http.post(this.baseUrl + 'Conditions/UpdateTechnicalConditions?PackageSupliersRevisionID=' + packageSupliersRevisionID + '&packageId=' + packageId+ '&CostConn='+CostConn, formData).pipe(
    map(res => res), catchError(this.handleError)
  );
 }

 updateCommercialConditions(packageSupliersRevisionID: number, input: File,CostConn: string)
 {
  const formData = new FormData();
  formData.append('ExcelFile' , input , input.name)
    return this.http.post(this.baseUrl + 'Conditions/UpdateCommercialConditions?PackageSupliersRevisionID=' + packageSupliersRevisionID+ '&CostConn='+CostConn, formData).pipe(
    map(res => res), catchError(this.handleError)
  );
 }

 getComConditions(packSupId :number,CostConn: string) : Observable<any>
 {
  return this.http.get(this.baseUrl + 'Conditions/GetComConditions?packSupId=' + packSupId+ '&CostConn='+CostConn).pipe(
    map(res => res), catchError(this.handleError)
  );
 }

 getTechConditions(packId : number,CostConn: string ) : Observable<any>
 {
  return this.http.get(this.baseUrl + 'Conditions/GetTechConditions?packId=' + packId+ '&CostConn='+CostConn).pipe(
    map(res => res), catchError(this.handleError)
  );
 }

 addTechConditions(item : TechConditions)
 {
   let headers = {};
    let body = JSON.stringify(item);
    return this.http.post(this.baseUrl + 'Conditions/AddTechConditions', body, {headers: new HttpHeaders().set('Content-Type','application/json')}).pipe(
    map(res => res), catchError(this.handleError)
  );
 }

 updateTechConditions(item : TechConditions)
 {
   let headers = {};
    let body = JSON.stringify(item);
    return this.http.post(this.baseUrl + 'Conditions/UpdateTechConditions', body, {headers: new HttpHeaders().set('Content-Type','application/json')}).pipe(
    map(res => res), catchError(this.handleError)
  );
 }

 delTechConditions(item : TechConditions)
 {
    return this.http.post(this.baseUrl + 'Conditions/DelTechConditions?id=' + item.tcSeq, null).pipe(
    map(res => res), catchError(this.handleError)
  );
 }

  handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

  GetComCondReplyByRevision(revisionId: number,CostConn: string): Observable<any> {
    return this.http.get(this.baseUrl + 'Conditions/GetComCondReplyByRevision?revisionid=' + revisionId+ '&CostConn='+CostConn).pipe(
      map(res => res), catchError(this.handleError)
    );
  }

  GetTechCondReplyByRevision(revisionId: number,CostConn: string    ): Observable<any> {
    return this.http.get(this.baseUrl + 'Conditions/GetTechCondReplyByRevision?revisionid=' + revisionId+ '&CostConn='+CostConn).pipe(
      map(res => res), catchError(this.handleError)
    );
  }

  //AH30012024
  GetSupplierList_NotAssignetPackage(IdPkge: number,CostConn: string): Observable<any> {
    return this.http.get(this.baseUrl + 'Supplier/GetSupplierList_NotAssignetPackage?packID=' + IdPkge+ '&CostConn='+CostConn).pipe(
      map(res => res), catchError(this.handleError)
    );
  }

  getTechConditionsByPackage(packId : number,revisionId :number,CostConn: string ) : Observable<any>
  {
   return this.http.get(this.baseUrl + 'Conditions/GetTechConditionsByPackage?packId=' + packId + '&revisionId=' + revisionId + '&CostConn='+CostConn).pipe(
     map(res => res), catchError(this.handleError)
   );
  }
  //AH30012024

  getRevisionAcceptance(revId : number,CostConn: string)
  {
    return this.http.post(this.baseUrl + 'RevisionDetails/GetRevisionAcceptance?revId=' + revId+ '&CostConn='+CostConn, null).pipe(
      map(res => res), catchError(this.handleError)
    );
  }
}
