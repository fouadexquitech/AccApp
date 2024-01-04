export class Supplier {
    public supID: number = 0;
    public supName: string = null;
    public supEmail: string = null;
    public isAccountCreated: boolean = false;
    public checked : boolean = false;
}

export class RegisterModel
    {
       public  FirstName : string="";
       public  LastName : string="";
       public  PhoneNumber : string="";
       public  DisplayName : string="";
       public  Email : string="";
       public  SupplierId : number = 0;
    }