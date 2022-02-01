import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { User } from '../_models';
import {ProjectCurrency} from '../login/login.model'

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  baseUrl = '';
  private userSubject: BehaviorSubject<User>;
  private projectCurrencySubject : BehaviorSubject<ProjectCurrency>;
  public user: Observable<User>;
  public projectCurrency : Observable<ProjectCurrency>;

  constructor( private router: Router, private http: HttpClient) { 
      this.baseUrl = environment.baseApiUrl + "api/";
      this.userSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('user')));
      this.projectCurrencySubject = new BehaviorSubject<ProjectCurrency>(JSON.parse(localStorage.getItem('currency')));
      this.user = this.userSubject.asObservable();
      this.projectCurrency = this.projectCurrencySubject.asObservable();
    }

    public get userValue(): User {
      return this.userSubject.value;
  }

  public get projectCurrencyValue() : ProjectCurrency 
  {
    return this.projectCurrencySubject.value;
  }

  login(username : string, password : string, projSeq : number) {
    return this.http.post<User>(environment.baseApiUrl + 'api/Logon/GetLogin?user=' + username + '&pass=' + password + '&projSeq=' + projSeq, null)
        .pipe(map(user => {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('user', JSON.stringify(user));
            this.userSubject.next(user);
            return user;
        }));
  }

  logout(){
      // remove user from local storage and set current user to null
      localStorage.removeItem('user');
      localStorage.removeItem('currency');
      this.userSubject.next(null);
      this.projectCurrencySubject.next(null);
      this.router.navigate(['/login']);
  }

  getProjectCountries(): Observable<any> 
  {
    return this.http.get(this.baseUrl + 'Logon/GetProjectCountries').pipe(
        map(res => res), catchError(this.handleError)
    );
  }

  getProjectCurrency()
  {
    return this.http.get<ProjectCurrency>(environment.baseApiUrl + 'api/Logon/GetProjectCurrency')
    .pipe(map(currency => {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem('currency', JSON.stringify(currency));
        this.projectCurrencySubject.next(currency);
        return currency;
    }));
  }

  getProjects(dbSeq : number): Observable<any> 
  {
    return this.http.get(this.baseUrl + 'Logon/GetProjects?dbSeq=' + dbSeq).pipe(
        map(res => res), catchError(this.handleError)
    );
  }

  handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}


