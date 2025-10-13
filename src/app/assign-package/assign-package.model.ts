export class OriginalBoqModel {
    public rowNumber: number = 0;
    public sectionO: string = "";
    public itemO: string = "";
    public descriptionO: string = "";
    public unitO: string = "";
    public unitRateO: number = 0;
    public scopeO: number = 0;
    public assignedPackage: string = "";
    public qtyO: number = 0;  //Final Qty
    public billQtyO: number = 0;
    public scopeQtyO: number = 0;
    public obTradeDesc : string = null;
    public isSelected : boolean = false;
    public boqStatus: string = "";
    public l2: string = "";
    public l3: string = "";
    public l4: string = "";
    public c1: string = "";
    public c2: string = "";
    public c3: string = "";
    public c4: string = "";
    public boqRefNumber: string = "";
    public comment: string = "";
}

export class BoqModel {
    public boqSeq: number = 0;
    public boqResSeq: string = "";
    public boqCtg: string = "";
    public boqUnitMesure: string = "";
    public boqUprice: number = 0;
    public boqDiv: string = "";
    public boqPackage: string = "";
    public boqScope: number = 0;
    public resDescription: string = "";
    public isSelected : boolean = true;
    public boqItem : string = null;
    public totalUnitPrice : number = 0;
    public assignedPackage: string = "";
    public boqQty: number = 0;  //Final Qty
    public boqBillQty: number = 0;
    public boqScopeQty: number = 0;
    public boqUpriceDisc: number = 0;
    public boqInsertedFromVendan: number = 0;
    public boqWBS: string = "";
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
    public boqLevel3:  string[] = [];
    public boqLevel4: string[] = [];
    public obTradeDesc: string = null;
    public isItemsAssigned: number = 0;
    public boqResourceSeq: string[] = [];
    public isRessourcesAssigned: number = 0;
    public costDB :string='';
    public boqStatus: string = "";
    public boqRefNumber: string = "";
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

export class RessourceList {
    public resSeq: number = 0;
    public resDesc: string = null;
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
    public tradeDesc  : string = null;
    public itemO: string = null;
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
    public boqSeqs : number[] = [];
    public packageId : number = 0;
}

export class AddNewBoqRessourceModel {
    public newRessource: BoqModel;
    public boqList: AssignPackages;
}



