import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SearchInput } from '../assign-package/assign-package.model';
import { ComparisonPackageGroup, GroupingBoq, GroupingResource } from './package-groups.model';
@Injectable({
  providedIn: 'root'
})
export class PackageGroupsService {
  baseUrl: string = '';

  constructor(private http: HttpClient) { 
    this.baseUrl = environment.baseApiUrl + "api/";

  }

  getGroupBoqList(packageId : number, groupId : number, searchInput : SearchInput) : Observable<any>
  {     
        return this.http.post(this.baseUrl + 'Package/GetGroupBoqList?packageId=' + packageId + '&groupId=' + groupId, searchInput);
  }

  getGroupBoqListOnly(packageId : number, groupId : number, searchInput : SearchInput) : Observable<any>
  {      
        return this.http.post(this.baseUrl + 'Package/GetGroupBoqListOnly?packageId=' + packageId + '&groupId=' + groupId, searchInput);
  }

  getGroups(packageId : number) : Observable<any>
  { 
        return this.http.get(this.baseUrl + 'Package/GetGroups?packageId=' + packageId);
  }

  addGroup(group : ComparisonPackageGroup) : Observable<any>
  {
    return this.http.post(this.baseUrl + 'Package/AddGroup', group);
  }

  attachToGroup(groupId : number, lst : GroupingResource[]) : Observable<any>
  {
    return this.http.post(this.baseUrl + 'Package/AttachToGroup?groupId=' + groupId, lst);
  }

  detachFromGroup(groupId : number, lst : GroupingResource[]) : Observable<any>
  {
    return this.http.post(this.baseUrl + 'Package/DetachFromGroup?groupId=' + groupId, lst);
  }

  attachToGroupByBoq(groupId : number, lst : GroupingBoq[]) : Observable<any>
  {
    return this.http.post(this.baseUrl + 'Package/AttachToGroupByBoq?groupId=' + groupId, lst);
  }

  detachFromGroupByBoq(groupId : number, lst : GroupingBoq[]) : Observable<any>
  {
    return this.http.post(this.baseUrl + 'Package/DetachFromGroupByBoq?groupId=' + groupId, lst);
  }


}