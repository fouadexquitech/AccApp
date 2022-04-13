import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { LoginService } from '../login/login.service';
import Swal from 'sweetalert2';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private loginService: LoginService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            if (err.status === 401) {
                // auto logout if 401 response returned from api
                this.loginService.logout();
            }
            
            const error = err.error.message || err.statusText;
            this.showError(error);
            return throwError(error);
        }))
    }

    showError(msg : any) {
        Swal.fire(
          {
            title : 'Error', 
            text : msg,
            showConfirmButton: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
            icon: 'error',
            confirmButtonColor : '#dc3545',
            confirmButtonText : 'Ok'
          }
        ).then(()=>  {
          
        }
        );
      }
}