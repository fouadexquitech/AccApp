import { Component, OnInit } from '@angular/core';
import { LoginService } from '../login/login.service';
import { User } from '../_models';
@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  public user : User;
  constructor(private loginService: LoginService) { 

    this.loginService.user.subscribe(x => this.user = x);
  }

  ngOnInit(): void {
    
  }

  logout()
  {
    this.loginService.logout();
  }
  

}
