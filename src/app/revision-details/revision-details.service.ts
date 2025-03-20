import { HttpClient, HttpHandler, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { RevisionDetails } from '../package-comparison/package-comparison.model';
import { RevisionDetailsList } from '../package-supplier/package-supplier.model';


@Injectable({
  providedIn: 'root'
})
export class RevisionDetailsService {
    baseUrl = '';


    constructor(private http: HttpClient) {
      this.baseUrl = environment.baseApiUrl + "api/";
    }

    
    UpdateRevisionDetailsPrice(revisionDetails : RevisionDetailsList[],CostConn: string)
    {
        let body = JSON.stringify(revisionDetails);
        
        return this.http.post(this.baseUrl + 'RevisionDetails/UpdateRevisionDetailsPrice?CostConn=' + CostConn, body, {
          headers:new HttpHeaders()
          .set('Content-Type','application/json')
          }).pipe(
        map(res => res), catchError(this.handleError)
      );
    }

    UpdateRevisionDetailsPriceByBoq(revisionDetails : RevisionDetailsList[],CostConn: string)
    {
      
        let body = JSON.stringify(revisionDetails);
        
        return this.http.post(this.baseUrl + 'RevisionDetails/UpdateRevisionDetailsPriceByBoq?CostConn=' + CostConn, body, {
          headers:new HttpHeaders()
          .set('Content-Type','application/json')
          }).pipe(
        map(res => res), catchError(this.handleError)
      );
    }

    handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
      }

}