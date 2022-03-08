export class PackageSuppliersPrice {
    public supplierId: number = 0;
    public supplierName: string = null;
    public revisionDetails: RevisionDetails[];
    public fieldLists: FieldList[];
    public totalprice: number = 0;
    public totalAdditionalPrice: number = 0;
    public totalNetPrice: number = 0;
    public byBoq : number = 0;
    public lastRevisionDate : Date = null;
}

export class FieldList {
    public label: string = null;
    public value: number = 0;
    public type : number = 0;
}

export class RevisionDetails {
    public resourceID: number = 0;
    public resourceName: string = null;
    public resourceUnit: string = null
    public resourceQty: number = 0;
    public price: number = 0;
    public perc: number = 0;
    public itemO : string = null;
    public descriptionO : string = null;
    public missedPrice : number = 0;
}

export class SupplierPercent {
    public supID: number = 0;
    public percent: number = 0;
}

export class SupplierResrouces 
{
    public resourceID : number = 0;
    public supplierPercents : SupplierPercent[] = [];
}

export class SupplierBOQ
{
    public boqItemID : string = null;
    public supplierPercents : SupplierPercent[] = [];
}

export class ressourceItem
{
    public resId : number = 0;
}

export class boqItem
{
    public boqItemID : string = null;
}

export class AssignSuppliertRes
{
    public supplierPercentList : SupplierPercent[] = [];
    public supplierResItemList : ressourceItem[] = [];
}


export class AssignSuppliertBoq
{
    public supplierPercentList : SupplierPercent[] = [];
    public supplierBoqItemList : boqItem[] = [];
}

export class TblTechCond
{
    public tcSeq : number = 0;
    public tcPackId : number = 0;
    public tcDescription : string = null;
    public tcSelected : number;

}

export class TblComCond
{
    public cmSeq : number = 0;
    public cmDescription : string = null;
    public cmSelected : number;
    public checked : boolean = false;
}

export class TblSuppTechCondReply
{
    public tcPackageSupliersId : number = 0;
    public tcComConID : number = 0;
    public tcSuppReply : string = null;
}

export class TblSuppComCondReply
{
    public cdPackageSupliersID : number = 0;
    public cdComConID : number = 0;
    public cdSuppReply : string = null;
}

export class ConditionsReply
{
    public condId : number = 0;
    public condDesc : string = null;
    public condReply : string = null;
    public supId : number = 0;
    public supName : string = null;
}



