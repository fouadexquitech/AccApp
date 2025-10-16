import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TopManagement } from '../package-comparison/package-comparison.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class ManagementUsersService {
  baseUrl: string = '';

  constructor(private http: HttpClient) { 
    this.baseUrl = environment.baseApiUrl + "api/";

  }

  addManagementEmail(list : TopManagement[])
  {
    return this.http.post(environment.baseApiUrl + 'api/Logon/AddManagementEmail', list);
  }

  deleteManagementEmail(id : number)
  {
    return this.http.post(environment.baseApiUrl + 'api/Logon/DeleteManagementEmail?id=' + id, null);
  }

  updateManagementEmail(user : TopManagement)
  {
    return this.http.post(environment.baseApiUrl + 'api/Logon/UpdateManagementEmail', user);
  }
}
