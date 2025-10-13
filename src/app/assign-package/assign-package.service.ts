import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { AssignPackages, SearchInput ,OriginalBoqModel,BoqModel,AddNewBoqRessourceModel} from './assign-package.model';

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

    GetBOQDivList(body : any,CostConn: string): Observable<any> {
        return this.http.post(this.baseUrl + 'Search/GetBOQDivList?CostConn=' + CostConn,body).pipe(
            map(res => res), catchError(this.handleError)
        );
    }

    GetBOQLevel2List(body : any,CostConn: string): Observable<any> {
        return this.http.post(this.baseUrl + 'Search/GetBOQLevel2List?CostConn=' + CostConn,body).pipe(
            map(res => res), catchError(this.handleError)
        );
    }
    
    GetBOQLevel3List(body : any,CostConn: string): Observable<any> {
        return this.http.post(this.baseUrl + 'Search/GetBOQLevel3List?CostConn=' + CostConn,body).pipe(
            map(res => res), catchError(this.handleError)
        );
    }

    GetBOQLevel4List(body : any,CostConn: string): Observable<any> {
        return this.http.post(this.baseUrl + 'Search/GetBOQLevel4List?CostConn=' + CostConn,body).pipe(
            map(res => res), catchError(this.handleError)
        );
    }

    GetRESTypeList(body : any,CostConn: string): Observable<any> {
        return this.http.post(this.baseUrl + 'Search/GetResTypeList?CostConn=' + CostConn, body).pipe(
            map(res => res), catchError(this.handleError)
        );
    }

    GetRessourcesList(body : any,CostConn: string): Observable<any> {
        return this.http.post(this.baseUrl + 'Search/GetRessourcesList?CostConn=' + CostConn, body).pipe(
            map(res => res), catchError(this.handleError)
        );
    }


    
    GetBOQLevel2ListBy(body : any,CostConn: string): Observable<any> {
        return this.http.post(this.baseUrl + 'Search/GetBOQLevel2ListBy?CostConn=' + CostConn,body).pipe(
            map(res => res), catchError(this.handleError)
        );
    }

    GetBOQLevel3ListByLevel2(body : any,CostConn: string): Observable<any> {
        return this.http.post(this.baseUrl + 'Search/GetBOQLevel3ListByLevel2?CostConn=' + CostConn, body).pipe(
            map(res => res), catchError(this.handleError)
        );
    }
    
    GetBOQLevel4ListByLevel3(body : any,CostConn: string): Observable<any> {
        return this.http.post(this.baseUrl + 'Search/GetBOQLevel4ListByLevel3?CostConn=' + CostConn, body).pipe(
            map(res => res), catchError(this.handleError)
        );
    }

    GetRessourcesListByLevels(body : any,CostConn: string): Observable<any> {
        return this.http.post(this.baseUrl + 'Search/GetRessourcesListByLevels?CostConn=' + CostConn, body).pipe(
            map(res => res), catchError(this.handleError)
        );
    }

    GetRESDivList(CostConn: string): Observable<any> {
        return this.http.get(this.baseUrl + 'Search/GetRESDivList?CostConn=' + CostConn).pipe(
            map(res => res), catchError(this.handleError)
        );
    }

    GetPackageList(usedPack : boolean,CostConn: string): Observable<any> {
        return this.http.get(this.baseUrl + 'Search/GetPackagesList?usedPackages='+ usedPack+ '&CostConn='+CostConn).pipe(
            map(res => res), catchError(this.handleError)
        );
    }

    GetRESPackageList(CostConn: string): Observable<any> {
        return this.http.get(this.baseUrl + 'Search/GetRESPackageList?CostConn=' + CostConn).pipe(
            map(res => res), catchError(this.handleError)
        );
    }

    GetSheetDescList(CostConn: string): Observable<any> {
        return this.http.get(this.baseUrl + 'Search/GetSheetDescList?CostConn=' + CostConn).pipe(
            map(res => res), catchError(this.handleError)
        );
    }

    GetOriginalBoqList(input: SearchInput , costDB :string,CostConn: string): Observable<any> {
        return this.http.post(
            this.baseUrl + 'Package/GetOriginalBoqList?costDB=' + costDB+ '&CostConn='+CostConn, input).pipe(
                map(res => res), catchError(this.handleError)
            );
    }

    GetBoqList(itemO: string, input: SearchInput,CostConn: string): Observable<any> {
        return this.http.post(this.baseUrl + 'Package/GetBoqList?ItemO=' + itemO+ '&CostConn='+CostConn, input).pipe(
            map(res => res), catchError(this.handleError)
        );
    }

    GetAllBoqList(input: SearchInput,CostConn: string): Observable<any> {
        return this.http.post(this.baseUrl + 'Package/GetAllBoqList?CostConn=' + CostConn, input).pipe(
            map(res => res), catchError(this.handleError)
        );
    }

    AssignPackage(input: AssignPackages,CostConn: string): Observable<any> {
        return this.http.post(this.baseUrl + 'Package/AssignPackages?CostConn=' + CostConn, input).pipe(
            map(res => res), catchError(this.handleError)
        );
    }
 
    handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }

    ExportBoqExcel(input: SearchInput , costDB :string,CostConn: string) : Observable<any> 
    {
      return this.http.post(this.baseUrl + 'Package/ExportBoqExcel?costDB=' + costDB+ '&CostConn='+CostConn, input).pipe(
        map(res => res), catchError(this.handleError)
    );
    }

    ExportExcelVerification(input: SearchInput , costDB :string,userName:string,CostConn: string) : Observable<any> 
    {
      return this.http.post(this.baseUrl + 'Package/ExportExcelVerification?costDB=' + costDB+'&userName='+userName+ '&CostConn='+CostConn, input).pipe(
        map(res => res), catchError(this.handleError)
    );
    }

    ExportNotAssigned(costDB :string,CostConn: string) : Observable<any> 
    {
      return this.http.post(this.baseUrl + 'Package/ExportNotAssigned?costDB=' + costDB+ '&CostConn='+CostConn, costDB).pipe(
        map(res => res), catchError(this.handleError)
    );
    }

    ExportExcelPackagesCost(withBoq:number, costDB :string, input: SearchInput,CostConn: string) : Observable<any> 
    {
      return this.http.post(this.baseUrl + 'Package/ExportExcelPackagesCost?costDB='+costDB+'&withBoq='+withBoq+ '&CostConn='+CostConn,input).pipe(
        map(res => res), catchError(this.handleError)
    );
    }

    AddNewBoqRessource(item: AddNewBoqRessourceModel,CostConn: string,userName:string): Observable<any> {
        return this.http.post(this.baseUrl + 'Package/AddNewBoqRessource?CostConn=' + CostConn +'&userName='+userName,item).pipe(
          map(res => res), catchError(this.handleError)
        );
      }

    updateOriginalBoqQty(item : OriginalBoqModel,CostConn: string)
    {
      return this.http.post(this.baseUrl + 'Package/updateOriginalBoqQty?CostConn=' + CostConn, item).pipe(
        map(res => res), catchError(this.handleError)
    );
    }

    updateBoqRes(item : BoqModel,CostConn: string,type : number)
    {
      return this.http.post(this.baseUrl + 'Package/updateBoqRes?CostConn=' + CostConn+ '&type='+type, item).pipe(
        map(res => res), catchError(this.handleError)
    );
    }
    
    updateBoqTradeDesc(originalBoqList: OriginalBoqModel[], tradeDesc:string,CostConn: string): Observable<any> 
    {
        return this.http.post(this.baseUrl + 'Package/updateBoqTradeDesc?tradeDesc=' + tradeDesc+ '&CostConn='+CostConn, originalBoqList).pipe(
            map(res => res), catchError(this.handleError)
        );
    }

    getBoqResourceRecords(dataTablesParameters: any,CostConn: string) : Observable<any>
    {
        const header = new HttpHeaders()
        .set('Content-type', 'application/json');
        const body = JSON.stringify(dataTablesParameters);
        return this.http.post<any>(this.baseUrl + 'Package/GetBoqResourceRecords?CostConn=' + CostConn,body, { headers: header }
        );
    }

    updateComment(boqItem: string, comment: string,CostConn: string) {
        console.log(boqItem)
        console.log(comment)
        return this.http.get(this.baseUrl + 'Package/updateBoqComment?boqItem=' + boqItem+ '&comments='+comment+'&CostConn=' + CostConn);
      }
}
