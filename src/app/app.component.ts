import { Component } from '@angular/core';
import { LoginService } from './login/login.service';
import { User} from './_models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
  export class AppComponent {
    title = 'AccApp';
    user: User;

  constructor(private loginService: LoginService) 
  { 
    this.loginService.user.subscribe(x => this.user = x);
  }
}
