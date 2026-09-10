import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private baseUrl = environment.baseApiUrl + 'api/Dashboard/';

  constructor(private http: HttpClient) {}

  getProjectTotalBudget(costConn: string) {
    return this.http.get<number>(this.baseUrl + 'GetProjectTotalBudget?costConn=' + encodeURIComponent(costConn));
  }

  getPackagesBudget(costConn: string) {
    return this.http.get<any[]>(this.baseUrl + 'GetPackagesBudget?costConn=' + encodeURIComponent(costConn));
  }

  getMissingByDivision(costConn: string) {
    return this.http.get<any[]>(this.baseUrl + 'GetMissingByDivision?costConn=' + encodeURIComponent(costConn));
  }

  getMissingResourcesForDivision(costConn: string, division: string) {
    return this.http.get<any[]>(
      this.baseUrl + 'GetMissingResourcesForDivision?costConn=' + encodeURIComponent(costConn) +
      '&division=' + encodeURIComponent(division)
    );
  }

  getQuotationBudget(costConn: string) {
    return this.http.get<any[]>(this.baseUrl + 'GetQuotationBudget?costConn=' + encodeURIComponent(costConn));
  }

  getBudgetByDivision(costConn: string) {
    return this.http.get<any[]>(this.baseUrl + 'GetBudgetByDivision?costConn=' + encodeURIComponent(costConn));
  }
}
