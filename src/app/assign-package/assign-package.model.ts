export class OriginalBoqModel {
    public rowNumber: number = 0;
    public sectionO: string = "";
    public itemO: string = "";
    public descriptionO: string = "";
    public unitO: string = "";
    public qtyO: number = 0;
    public unitRate: number = 0;
    public scope: number = 0;
    public assignedPackage: string = "";
    public qtyScope: number = 0;
}

export class BoqModel {
    public boqSeq: number = 0;
    public boqResSeq: string = "";
    public boqCtg: string = "";
    public boqUnitMesure: string = "";
    public boqQty: number = 0;
    public boqUprice: number = 0;
    public boqDiv: string = "";
    public boqPackage: string = "";
    public boqScope: number = 0;
    public resDescription: string = "";
    public isSelected : boolean = true;
    public boqItem : string = null;
    public totalUnitPrice : number = 0;
    public assignedPackage: string = "";
    public qtyScope: number = 0;
}

export class SearchInput {
    public bOQDiv: string[] = [];
    public rESDiv: string[] = [];
    public bOQItem: string = null;
    public rESType: string[] = [];
    public bOQDesc: string = null;
    public rESDesc: string = null;
    public package: number = 0;
    public rESPackage: string = null;
    public fromRow: string = null;
    public toRow: string = null;
    public sheetDesc: string = null;
    public itemO: string = null;
    public boqLevel2: string[] = [];
    public boqLevel3: string = null;
}

export class BOQDivList {
    public sectionO: string = null;
}

export class BOQLevelList {
    public level: string = null;
}

export class PackageList {
    public idPkge: number = 0;
    public pkgeName: string = null;
}

export class RESDivList {
    public boqDiv: string = null;
}

export class RESTypeList {
    public boqCtg: string = null;
}

export class RESPackageList {
    public boqPackage: string = null;
}

export class SheetDescList {
    public obSheetDesc: string = null;
}

export class AssignOriginalBoqList {
    public rowNumber: number = 0;
    public scope: number = 0;
}

export class AssignBoqList {
    public boqSeq: number = 0;
    public boqScope: number = 0;
    public boqResSeq : string = null;
    public boqItem : string = null;
}

export class AssignPackages {
    public assignOriginalBoqList: AssignOriginalBoqList[] = [];
    public assignBoqList: AssignBoqList[] = [];
}

