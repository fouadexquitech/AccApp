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

export class SupplierPackagesList {
    public psId: number = 0;
    public psPackId: number = 0;
    public psSuppId: number = 0;
    public psSupName: number = 0;
}

export class SupplierPackagesRevList {
    public prRevId: number = 0;
    public prRevNo: number = 0;
    public prRevDate: any;
    public prTotPrice: number = 0;
    public prPackSuppId: number = 0;
}

export class CurrencyList {
    public curId : number = 0;
    public curCode : string = null;
}