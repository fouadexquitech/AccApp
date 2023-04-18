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

  GetSuppliers(filter : string): Observable<any> {
    return this.http.get(this.baseUrl + 'Supplier/GetSuppliers?filter=' + filter).pipe(
      map(res => res), catchError(this.handleError)
    );
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

  handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
