import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { SearchInput } from '../assign-package/assign-package.model';
import { Supplier } from './suppliers.models';
// import { AccConditions, TechConditions, TechCondModel } from '../package-comparison/package-comparison.model';
// import { AssignPackageTemplate, SupplierInput, SupplierInputList } from './package-supplier.model';

@Injectable({
  providedIn: 'root'
})
export class SuppliersService {
  baseUrl = '';


  constructor(private http: HttpClient) {
    this.baseUrl = environment.baseApiUrl + "api/";
  }

  GetSuppliers(dataTablesParameters: any): Observable<any> {

    const header = new HttpHeaders()
    .set('Content-type', 'application/json');
    const body = JSON.stringify(dataTablesParameters);

    return this.http.post<any>(environment.baseApiUrl + 'api/Supplier/GetSuppliers', body, { headers: header });
  }

  addSupplier(list : Supplier[])
  {
    return this.http.post(environment.baseApiUrl + 'api/Supplier/AddSupplier', list);
  }

  deleteSupplier(id : number)
  {
    return this.http.post(environment.baseApiUrl + 'api/Supplier/DeleteSupplier?id=' + id, null);
  }

  updateSupplier(user : Supplier)
  {
    return this.http.post(environment.baseApiUrl + 'api/Supplier/UpdateSupplier', user);
  }

  createPortalAccount(list : any[])
  {
    return this.http.post(environment.portalApiUrl + 'api/Account/Register', list);
  }

  updatePortalAccountFlag(model : any)
  {
    return this.http.post(environment.baseApiUrl + 'api/Supplier/UpdatePortalAccountFlag', model);
  }

  handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
