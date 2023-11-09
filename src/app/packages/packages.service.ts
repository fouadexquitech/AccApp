import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { SearchInput } from '../assign-package/assign-package.model';
import { Package } from './packages.models';
// import { AccConditions, TechConditions, TechCondModel } from '../package-comparison/package-comparison.model';
// import { AssignPackageTemplate, packageInput, packageInputList } from './package-package.model';

@Injectable({
  providedIn: 'root'
})
export class packagesService {
  baseUrl = '';


  constructor(private http: HttpClient) {
    this.baseUrl = environment.baseApiUrl + "api/";
  }

  Getpackages(dataTablesParameters: any): Observable<any> {
    const header = new HttpHeaders()
    .set('Content-type', 'application/json');
    const body = JSON.stringify(dataTablesParameters);
    return this.http.post<any>(environment.baseApiUrl + 'api/package/Getpackages', body, { headers: header });
  }

  addpackage(list : Package[])
  {
    return this.http.post(environment.baseApiUrl + 'api/package/Addpackage', list);
  }

  deletepackage(id : number)
  {
    return this.http.post(environment.baseApiUrl + 'api/package/Deletepackage?id=' + id, null);
  }

  updatepackage(user : Package)
  {
    return this.http.post(environment.baseApiUrl + 'api/package/Updatepackage', user);
  }

  handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
