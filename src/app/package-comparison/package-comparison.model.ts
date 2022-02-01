export class PackageSuppliersPrice {
    public supplierId: number = 0;
    public supplierName: string = null;
    public revisionDetails: RevisionDetails[];
    public fieldLists: FieldList[];
    public totalprice: number = 0;
}

export class FieldList {
    public label: string = null;
    public value: number = 0;
}

export class RevisionDetails {
    public resourceID: number = 0;
    public resourceName: string = null;
    public resourceUnit: string = null
    public resourceQty: number = 0;
    public price: number = 0;
    public perc: number = 0;
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

