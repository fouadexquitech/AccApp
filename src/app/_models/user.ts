export class User {
    usrAdmin: boolean = false;
    usrDesc: string = null;
    usrEmail: string = null;
    usrId: string = null;
    usrPwd: string = null;
    token: string = null;

    // AH
    usrLoggedProjectName: string = null;
    usrLoggedConnString: string = null;
    usrLoggedCostDB: string = null;
    usrLoggedTSConnString: string = null;
}

export class LoginResponse {
    success: boolean = false;
    user : User = null;
    message: string = "";
}