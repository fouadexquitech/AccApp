import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { AssignPackages, SearchInput ,OriginalBoqModel,BoqModel} from './assign-package.model';

@Injectable()
export class AssignPackageService {
    baseUrl = '';


    constructor(private http: HttpClient) {
        this.baseUrl = environment.baseApiUrl + "api/";
    }

    ConnectToDB(connString: string): Observable<any> {
        return this.http.get(this.baseUrl + 'Logon/ConnectToDB?connString='+connString).pipe(
            map(res => res), catchError(this.handleError)
        );
    }

    GetBOQDivList(): Observable<any> {
        return this.http.get(this.baseUrl + 'Search/GetBOQDivList').pipe(
            map(res => res), catchError(this.handleError)
        );
    }

    GetBOQLevel2List(): Observable<any> {
        return this.http.get(this.baseUrl + 'Search/GetBOQLevel2List').pipe(
            map(res => res), catchError(this.handleError)
        );
    }

    
    GetBOQLevel3List(): Observable<any> {
        return this.http.get(this.baseUrl + 'Search/GetBOQLevel3List').pipe(
            map(res => res), catchError(this.handleError)
        );
    }

    GetBOQLevel4List(): Observable<any> {
        return this.http.get(this.baseUrl + 'Search/GetBOQLevel4List').pipe(
            map(res => res), catchError(this.handleError)
        );
    }

    GetBOQLevel3ListByLevel2(body : any): Observable<any> {
        return this.http.post(this.baseUrl + 'Search/GetBOQLevel3ListByLevel2', body).pipe(
            map(res => res), catchError(this.handleError)
        );
    }
    
    GetBOQLevel4ListByLevel3(body : any): Observable<any> {
        return this.http.post(this.baseUrl + 'Search/GetBOQLevel4ListByLevel3', body).pipe(
            map(res => res), catchError(this.handleError)
        );
    }

    GetRessourcesListByLevels(body : any): Observable<any> {
        return this.http.post(this.baseUrl + 'Search/GetRessourcesListByLevels', body).pipe(
            map(res => res), catchError(this.handleError)
        );
    }

    GetRESDivList(): Observable<any> {
        return this.http.get(this.baseUrl + 'Search/GetRESDivList').pipe(
            map(res => res), catchError(this.handleError)
        );
    }

    GetRESTypeList(): Observable<any> {
        return this.http.get(this.baseUrl + 'Search/GetRESTypeList').pipe(
            map(res => res), catchError(this.handleError)
        );
    }

    GetPackageList(): Observable<any> {
        return this.http.get(this.baseUrl + 'Search/PackageList').pipe(
            map(res => res), catchError(this.handleError)
        );
    }

    GetRESPackageList(): Observable<any> {
        return this.http.get(this.baseUrl + 'Search/GetRESPackageList').pipe(
            map(res => res), catchError(this.handleError)
        );
    }

    GetRessourcesList(): Observable<any> {
        return this.http.get(this.baseUrl + 'Search/GetRessourcesList').pipe(
            map(res => res), catchError(this.handleError)
        );
    }

    GetSheetDescList(): Observable<any> {
        return this.http.get(this.baseUrl + 'Search/GetSheetDescList').pipe(
            map(res => res), catchError(this.handleError)
        );
    }

    GetOriginalBoqList(input: SearchInput , costDB :string): Observable<any> {
        return this.http.post(
            this.baseUrl + 'Package/GetOriginalBoqList?costDB=' + costDB, input).pipe(
                map(res => res), catchError(this.handleError)
            );
    }

    GetBoqList(itemO: string, input: SearchInput): Observable<any> {
        return this.http.post(this.baseUrl + 'Package/GetBoqList?ItemO=' + itemO, input).pipe(
            map(res => res), catchError(this.handleError)
        );
    }

    GetAllBoqList(input: SearchInput): Observable<any> {
        return this.http.post(this.baseUrl + 'Package/GetAllBoqList', input).pipe(
            map(res => res), catchError(this.handleError)
        );
    }

    AssignPackage(input: AssignPackages): Observable<any> {
        return this.http.post(this.baseUrl + 'Package/AssignPackages', input).pipe(
            map(res => res), catchError(this.handleError)
        );
    }
 
    handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }

    ExportBoqExcel(input: SearchInput , costDB :string) : Observable<any> 
    {
      return this.http.post(this.baseUrl + 'Package/ExportBoqExcel?costDB=' + costDB, input).pipe(
        map(res => res), catchError(this.handleError)
    );
    }

    ExportNotAssigned(input: SearchInput , costDB :string) : Observable<any> 
    {
      return this.http.post(this.baseUrl + 'Package/ExportNotAssigned?costDB=' + costDB, input).pipe(
        map(res => res), catchError(this.handleError)
    );
    }

    ExportExcelPackagesCost() : Observable<any> 
    {
      return this.http.get(this.baseUrl + 'Package/ExportExcelPackagesCost').pipe(
        map(res => res), catchError(this.handleError)
    );
    }

    updateOriginalBoqQty(item : OriginalBoqModel)
    {
      return this.http.post(this.baseUrl + 'Package/updateOriginalBoqQty', item).pipe(
        map(res => res), catchError(this.handleError)
    );
    }

    updateBoqResQty(item : BoqModel)
    {
      return this.http.post(this.baseUrl + 'Package/updateBoqResQty', item).pipe(
        map(res => res), catchError(this.handleError)
    );
    }
    
    updateBoqTradeDesc(originalBoqList: OriginalBoqModel[], tradeDesc:string): Observable<any> 
    {
        return this.http.post(this.baseUrl + 'Package/updateBoqTradeDesc?tradeDesc=' + tradeDesc, originalBoqList).pipe(
            map(res => res), catchError(this.handleError)
        );
    }

    getBoqResourceRecords(dataTablesParameters: any) : Observable<any>
    {
        const header = new HttpHeaders()
        .set('Content-type', 'application/json');
        const body = JSON.stringify(dataTablesParameters);
        return this.http.post<any>(this.baseUrl + 'Package/GetBoqResourceRecords',body, { headers: header }
        );
    }
}
