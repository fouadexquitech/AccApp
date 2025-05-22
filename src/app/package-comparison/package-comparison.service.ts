import {
  HttpClient,
  HttpHandler,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { SearchInput } from '../assign-package/assign-package.model';
import {
  AssignSupplierGroup,
  AssignSuppliertBoq,
  AssignSuppliertRes,
  SupplierBOQ,
  SupplierGroups,
  SupplierPercent,
  SupplierResrouces,
  TopManagement,
  TopManagementTemplate,
} from './package-comparison.model';

@Injectable({
  providedIn: 'root',
})
export class PackageComparisonService {
  baseUrl = '';

  constructor(private http: HttpClient) {
    this.baseUrl = environment.baseApiUrl + 'api/';
  }

  GetPackageSuppliersPrice(
    IdPkge: number,
    searchInput: SearchInput,
    CostConn: string
  ): Observable<any> {
    const headers = { 'content-type': 'application/json' };
    const body = JSON.stringify(searchInput);
    return this.http
      .post(
        this.baseUrl +
          'Package/GetPackageSuppliersPrice?IdPkge=' +
          IdPkge +
          '&CostConn=' +
          CostConn,
        body,
        { headers: headers }
      )
      .pipe(
        map((res) => res),
        catchError(this.handleError)
      );
  }

  GetSupplierPackagesList(PackId: number, CostConn: string): Observable<any> {
    return this.http
      .get(
        this.baseUrl +
          'SupplierPackages/GetSupplierPackagesList?packageid=' +
          PackId +
          '&CostConn=' +
          CostConn
      )
      .pipe(
        map((res) => res),
        catchError(this.handleError)
      );
  }

  AssignSupplierPackage(
    PackId: number,
    input: SupplierPercent[],
    CostConn: string
  ): Observable<any> {
    return this.http
      .post(
        this.baseUrl +
          'RevisionDetails/AssignSupplierPackage?packId=' +
          PackId +
          '&CostConn=' +
          CostConn,
        input
      )
      .pipe(
        map((res) => res),
        catchError(this.handleError)
      );
  }

  AssignSupplierRessource(
    packId: number,
    isPercent: boolean,
    input: SupplierResrouces[],
    CostConn: string
  ): Observable<any> {
    return this.http
      .post(
        this.baseUrl +
          'RevisionDetails/AssignSupplierRessource?packId=' +
          packId +
          '&isPercent=' +
          isPercent +
          '&CostConn=' +
          CostConn,
        input
      )
      .pipe(
        map((res) => res),
        catchError(this.handleError)
      );
  }

  AssignSupplierBOQ(
    packId: number,
    isPercent: boolean,
    input: SupplierBOQ[],
    CostConn: string
  ): Observable<any> {
    return this.http
      .post(
        this.baseUrl +
          'RevisionDetails/AssignSupplierBOQ?packId=' +
          packId +
          '&isPercent=' +
          isPercent +
          '&CostConn=' +
          CostConn,
        input
      )
      .pipe(
        map((res) => res),
        catchError(this.handleError)
      );
  }

  AssignSupplierGroup(
    packId: number,
    byBoq: boolean,
    isPercent: boolean,
    input: SupplierGroups[],
    CostConn: string
  ): Observable<any> {
    return this.http
      .post(
        this.baseUrl +
          'RevisionDetails/AssignSupplierGroup?packId=' +
          packId +
          '&byBoq=' +
          byBoq +
          '&isPercent=' +
          isPercent +
          '&CostConn=' +
          CostConn,
        input
      )
      .pipe(
        map((res) => res),
        catchError(this.handleError)
      );
  }

  AssignSupplierListRessourceList(
    PackId: number,
    isPercent: boolean,
    item: AssignSuppliertRes,
    CostConn: string
  ): Observable<any> {
    return this.http
      .post(
        this.baseUrl +
          'RevisionDetails/AssignSupplierListRessourceList?packId=' +
          PackId +
          '&isPercent=' +
          isPercent +
          '&CostConn=' +
          CostConn,
        item
      )
      .pipe(
        map((res) => res),
        catchError(this.handleError)
      );
  }

  AssignSupplierListBoqList(
    PackId: number,
    isPercent: boolean,
    item: AssignSuppliertBoq,
    CostConn: string
  ): Observable<any> {
    return this.http
      .post(
        this.baseUrl +
          'RevisionDetails/AssignSupplierListBoqList?packId=' +
          PackId +
          '&isPercent=' +
          isPercent +
          '&CostConn=' +
          CostConn,
        item
      )
      .pipe(
        map((res) => res),
        catchError(this.handleError)
      );
  }

  AssignSupplierListGroupList(
    PackId: number,
    byBoq: boolean,
    isPercent: boolean,
    item: AssignSupplierGroup,
    CostConn: string
  ): Observable<any> {
    return this.http
      .post(
        this.baseUrl +
          'RevisionDetails/AssignSupplierListGroupList?packId=' +
          PackId +
          '&byBoq=' +
          byBoq +
          '&isPercent=' +
          isPercent +
          '&CostConn=' +
          CostConn,
        item
      )
      .pipe(
        map((res) => res),
        catchError(this.handleError)
      );
  }

  getComparisonSheetResourcesByGroup(
    PackId: number,
    input: SearchInput,
    CostConn: string
  ): Observable<any> {
    return this.http
      .post(
        this.baseUrl +
          'RevisionDetails/GetComparisonSheetResourcesByGroup?packageId=' +
          PackId +
          '&CostConn=' +
          CostConn,
        input
      )
      .pipe(
        map((res) => res),
        catchError(this.handleError)
      );
  }

  getComparisonSheetBoqByGroup(
    PackId: number,
    input: SearchInput,
    CostConn: string
  ): Observable<any> {
    return this.http
      .post(
        this.baseUrl +
          'RevisionDetails/GetComparisonSheetBoqByGroup?packageId=' +
          PackId +
          '&CostConn=' +
          CostConn,
        input
      )
      .pipe(
        map((res) => res),
        catchError(this.handleError)
      );
  }

  getTechConditions(packId: number, filter: string, CostConn: string) {
    return this.http
      .get(
        this.baseUrl +
          'Conditions/GetTechConditions?packId=' +
          packId +
          '&filter=' +
          filter +
          '&CostConn=' +
          CostConn
      )
      .pipe(
        map((res) => res),
        catchError(this.handleError)
      );
  }

  getTechCondReplies(packId: number, costDB: string, CostConn: string) {
    return this.http
      .get(
        this.baseUrl +
          'Conditions/getTechCondReplies?packId=' +
          packId +
          '&costDB=' +
          costDB +
          '&CostConn=' +
          CostConn
      )
      .pipe(
        map((res) => res),
        catchError(this.handleError)
      );
  }

  getComCondReplies(packId: number, costDB: string, CostConn: string) {
    return this.http
      .get(
        this.baseUrl +
          'Conditions/GetComCondReplies?packId=' +
          packId +
          '&costDB=' +
          costDB +
          '&CostConn=' +
          CostConn
      )
      .pipe(
        map((res) => res),
        catchError(this.handleError)
      );
  }

  getTechConditionsReply(packageSupliersID: number, CostConn: string) {
    return this.http
      .get(
        this.baseUrl +
          'Conditions/GetTechConditionsReply?packageSupliersID=' +
          packageSupliersID
      )
      .pipe(
        map((res) => res),
        catchError(this.handleError)
      );
  }

  getComConditionsReply(packageSupliersID: number, CostConn: string) {
    return this.http
      .get(
        this.baseUrl +
          'Conditions/GetComConditionsReply?packageSupliersID=' +
          packageSupliersID
      )
      .pipe(
        map((res) => res),
        catchError(this.handleError)
      );
  }

  getManagementEmail(filter: string) {
    return this.http
      .get(this.baseUrl + 'Logon/GetManagementEmail?filter=' + filter)
      .pipe(
        map((res) => res),
        catchError(this.handleError)
      );
  }

  generateSuppliersContractsExcel(
    packId: number,
    searchInput: SearchInput,
    packSuppId: number,
    costDB: string,
    CostConn: string
  ): Observable<any> {
    let body = JSON.stringify(searchInput);
    return this.http
      .post(
        this.baseUrl +
          'RevisionDetails/GenerateSuppliersContracts_Excel?packageId=' +
          packId +
          '&PackageSupliersID=' +
          packSuppId +
          '&costDB=' +
          costDB +
          '&CostConn=' +
          CostConn,
        body,
        { headers: new HttpHeaders().set('Content-Type', 'application/json') }
      )
      .pipe(
        map((res) => res),
        catchError(this.handleError)
      );
  }

  sendCompToManagement(
    topManagementTemplate: TopManagementTemplate,
    attachements: File[],
    CostConn: string
  ) {
    const formData = new FormData();

    formData.append(
      'topManagementTemplate',
      JSON.stringify(topManagementTemplate)
    );
    attachements.forEach((attachement) => {
      formData.append(attachement?.name, attachement, attachement?.name);
    });

    return this.http
      .post(
        this.baseUrl +
          'RevisionDetails/SendCompToManagement?CostConn=' +
          CostConn,
        formData
      )
      .pipe(
        map((res) => res),
        catchError(this.handleError)
      );
  }

  getComparisonSheet(
    packId: number,
    input: SearchInput,
    CostConn: string
  ): Observable<any> {
    return this.http
      .post(
        this.baseUrl +
          'RevisionDetails/GetComparisonSheet?packageId=' +
          packId +
          '&CostConn=' +
          CostConn,
        input
      )
      .pipe(
        map((res) => res),
        catchError(this.handleError)
      );
  }

  getComparisonSheetByBoq(
    packId: number,
    input: SearchInput,
    CostConn: string,
    c: string
  ): Observable<any> {
    return this.http
      .post(
        this.baseUrl +
          'RevisionDetails/GetComparisonSheetByBoq?packageId=' +
          packId +
          '&CostConn=' +
          CostConn +
          '&c=' +
          c,
        input
      )
      .pipe(
        map((res) => res),
        catchError(this.handleError)
      );
  }

  getComparisonSheet_Excel(
    packageId: number,
    input: SearchInput,
    packSuppId: number,
    costDB: string,
    CostConn: string
  ): Observable<any> {
    const headers = { 'content-type': 'application/json' };
    let body = JSON.stringify(input);
    return this.http
      .post(
        this.baseUrl +
          'RevisionDetails/GetComparisonSheet_Excel?packageId=' +
          packageId +
          '&PackageSupliersID=' +
          packSuppId +
          '&costDB=' +
          costDB +
          '&CostConn=' +
          CostConn,
        body,
        { headers: headers }
      )
      .pipe(
        map((res) => res),
        catchError(this.handleError)
      );
  }

  GetComparisonSheetByBoq_Excel(
    packageId: number,
    input: SearchInput,
    packSuppId: number,
    costDB: string,
    CostConn: string
  ): Observable<any> {
    const headers = { 'content-type': 'application/json' };
    let body = JSON.stringify(input);
    return this.http
      .post(
        this.baseUrl +
          'RevisionDetails/GetComparisonSheetByBoq_Excel?packageId=' +
          packageId +
          '&PackageSupliersID=' +
          packSuppId +
          '&costDB=' +
          costDB +
          '&CostConn=' +
          CostConn,
        body,
        { headers: headers }
      )
      .pipe(
        map((res) => res),
        catchError(this.handleError)
      );
  }

  getComparisonSheetResourcesByGroup_Excel(
    packageId: number,
    input: SearchInput,
    packSuppId: number,
    costDB: string,
    CostConn: string
  ): Observable<any> {
    const headers = { 'content-type': 'application/json' };
    let body = JSON.stringify(input);
    return this.http
      .post(
        this.baseUrl +
          'RevisionDetails/GetComparisonSheetResourcesByGroup_Excel?packageId=' +
          packageId +
          '&PackageSupliersID=' +
          packSuppId +
          '&costDB=' +
          costDB +
          '&CostConn=' +
          CostConn,
        body,
        { headers: headers }
      )
      .pipe(
        map((res) => res),
        catchError(this.handleError)
      );
  }

  getComparisonSheetBoqByGroup_Excel(
    packageId: number,
    input: SearchInput,
    packSuppId: number,
    costDB: string,
    CostConn: string
  ): Observable<any> {
    const headers = { 'content-type': 'application/json' };
    let body = JSON.stringify(input);
    return this.http
      .post(
        this.baseUrl +
          'RevisionDetails/GetComparisonSheetBoqByGroup_Excel?packageId=' +
          packageId +
          '&PackageSupliersID=' +
          packSuppId +
          '&costDB=' +
          costDB +
          '&CostConn=' +
          CostConn,
        body,
        { headers: headers }
      )
      .pipe(
        map((res) => res),
        catchError(this.handleError)
      );
  }

  handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

  excludBoq(
    packId: number,
    item: string,
    isNewItem: boolean,
    exclud: boolean,
    CostConn: string
  ): Observable<any> {
    return this.http
      .post(
        this.baseUrl +
          'RevisionDetails/ExcludBoq?packId=' +
          packId +
          '&Item=' +
          item +
          '&isNewItem=' +
          isNewItem +
          '&isExclud=' +
          exclud +
          '&CostConn=' +
          CostConn,
        item
      )
      .pipe(
        map((res) => res),
        catchError(this.handleError)
      );
    // return this.http.post(this.baseUrl + 'RevisionDetails/AssignSupplierListGroupList?packId=' + PackId + '&byBoq=' + byBoq+ '&isPercent=' + isPercent, item).pipe(
    //   map(res => res), catchError(this.handleError)
    // );
  }

  excludRessource(
    packId: number,
    boqSeq: number,
    isNewItem: boolean,
    isAlternative: boolean,
    exclud: boolean,
    CostConn: string
  ): Observable<any> {
    return this.http
      .post(
        this.baseUrl +
          'RevisionDetails/excludRessource?packId=' +
          packId +
          '&boqSeq=' +
          boqSeq +
          '&isNewItem=' +
          isNewItem +
          '&isAlternative=' +
          isAlternative +
          '&isExclud=' +
          exclud +
          '&CostConn=' +
          CostConn,
        boqSeq
      )
      .pipe(
        map((res) => res),
        catchError(this.handleError)
      );
    // return this.http.post(this.baseUrl + 'RevisionDetails/AssignSupplierListGroupList?packId=' + PackId + '&byBoq=' + byBoq+ '&isPercent=' + isPercent, item).pipe(
    //   map(res => res), catchError(this.handleError)
    // );
  }
}
