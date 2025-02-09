import { Component } from '@angular/core';
import { LoginService } from './login/login.service';
import { User} from './_models';

import { BnNgIdleService } from 'bn-ng-idle'; // import it to your component
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
  export class AppComponent {
    title = 'AccApp';
    user: User;

  constructor(private loginService: LoginService,
    private bnIdle: BnNgIdleService,
    private router: Router,) 
  { 
    this.loginService.user.subscribe(x => this.user = x);

    this.bnIdle.startWatching(1200).subscribe((res) => {
      if(res) {
          console.log("session expired");
          this.loginService.logout();
      }
    })
  }
}
