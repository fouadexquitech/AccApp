export class Country {
    public dbSeq : number = 0;
    public byte : number = 0;
    public dbLocation : string = null;
    public dbServer : string = null;
    public dbUserId : string = null;
    public dbPass : string = null;
    public dbName : string = null;
    public dbDescription : string = null;
}

export class Project 
{
    public seq : number = 0;
    public prjCostDatabase : string = null;
}

export class ProjectCurrency 
{
    public curId : number = 0;
    public curCode : string = null;
}