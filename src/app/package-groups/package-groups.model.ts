import { FixedSizeVirtualScrollStrategy } from "@angular/cdk/scrolling";
import { PackageList } from "../package-list/package-list.model";

export class ResourceGroup
{
    public id : number = 0;
    public resourceSeq : string = null;
}

export class ComparisonPackageGroup 
{
    public id : number = 0;
    public name : string = null;
    public package : PackageList = null;
    public userId : string = null;
    
}

export class GroupingResource
{
    public boqSeq : number = 0;
    public resourceSeq : string = null;
    public resourceDescription : string = null;
    public unit : string = null;
    public isSelected : boolean = false;
    public isChecked : boolean = false;
    public qty : number = 0;
    public unitPrice : number = 0;
    public totalPrice : number = 0;
    public validPerc : boolean = true;
    public groupingPackageSuppliersPrices : GroupingPackageSupplierPrice[] = [];
}

export class GroupingBoq
{
    public itemO : string = null;
    public descriptionO : string = null;
    public groupingResources : GroupingResource[] = [];
    public isSelected : boolean = false;
    public isChecked : boolean = false;
    public unit : string = null;
    public qty : number = 0;
    public unitPrice : number = 0;
    public totalPrice : number = 0;
    public validPerc : boolean = true;
    public groupingPackageSuppliersPrices : GroupingPackageSupplierPrice[] = [];
}

export class GroupingBoqGroup
{
    public id : number = 0;
    public name : string = null;
    public totalPrice : number = 0;
    public isChecked : boolean = false;
    public validPerc : boolean = true;
    public groupingPackageSuppliersPrices : GroupingPackageSupplierPrice[] = [];
}

export class GroupingPackageSupplierPrice
{
    public supplierId : number = 0;
    public supplierName : string = null;
    public unitPrice : number = 0;
    public qty : number = 0;
    public lastRevisionDate : Date = null;
    public totalPrice : number = 0;
    public originalCurrencyPrice : number = 0;
    public missedPrice : number = 0;
    public assignedPercentage : number = 0;
}