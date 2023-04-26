export class SupplierList {
    public supID: number = 0;
    public supName: string = null;
    public supEmail: string = null;
}

export class PackageDetailsModel {
    public packageName: string = null;
}

export class SupplierInput {
    public supID: number = 0;
}

export class ComercialCond 
{
    public id : number = 0;
    public description : string = null;
}

export class SupplierInputList
{
    public supplierInput : SupplierInput = null;
    public comercialCondList : ComercialCond[] = [];
    public filePath : string = null;
    public emailTemplate : string = null;
}

export class ExchangeRate {
    public curCode : string = null;
    public curRate : number = 0;
}

export class SupplierPackagesList {
    public psId: number = 0;
    public psPackId: number = 0;
    public psSuppId: number = 0;
    public psSupName: string = '';
    public psByBoq : number = 0;
    public tecCondSent : boolean = false;
}

export class SupplierPackagesRevList {
    public prRevId: number = 0;
    public prRevNo: number = 0;
    public prRevDate: Date;
    public prTotPrice: number = 0;
    public prCurrency : number = 0;
    public currency : string = null;
    public prPackSuppId: number = 0;
}

export class RevisionDetailsList {
    public rdRevisionId: number = 0;
    public rdResourceSeq: number = 0;
    public rdPrice: number = 0;
    public rdMissedPrice: number = 0;
    public rdBoqItem : string = null;
    public rdBoqItemDescription : string = null;
    public rdItemDescription : string = null;
    public rdQty: number = 0;
    public rdMissedPriceReason : string = null;
    public rdDiscount : number = 0;
    public rdPriceAfterDiscount : number = 0;
    public rdTotalPrice : number = 0;
    public rdAddedItem : number = 0;
    public rdAddedItemOn : Date = null;
}

export class CurrencyList {
    public curId : number = 0;
    public curCode : string = null;
}

export class RevisionFieldsList
{
    public id : number = 0;  
    public revisionId : number = 0;
    public label : string = null;
    public value : number = 0;
    public type? : number = null;
}

export class AssignPackageTemplate
{
    public supInputList : SupplierInputList[] = [];
    public packId : number = 0;
    public byBoq : number = 0;
    public userName : string = null;
    listCC : string[] = [];
    public listAttach : string[] = [];
}


