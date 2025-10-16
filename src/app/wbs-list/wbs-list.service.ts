import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { SearchInput } from '../assign-package/assign-package.model';

@Injectable({
  providedIn: 'root'
})

export class WbsListService {

  baseUrl = '';


  constructor(private http: HttpClient) {
    this.baseUrl = environment.baseApiUrl + "api/";
  }

  GetWbsList(dataTablesParameters: any,CostConn: string): Observable<any> 
  {
    const header = new HttpHeaders()
    .set('Content-type', 'application/json');
    const body = JSON.stringify(dataTablesParameters);

    return this.http.post<any>(environment.baseApiUrl + 'api/Search/GetWbsList?CostConn='+CostConn, body, { headers: header });
  }


  handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }




}
