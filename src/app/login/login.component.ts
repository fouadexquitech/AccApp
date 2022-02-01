﻿import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { LoginService } from './login.service';
import { Country, Project, ProjectCurrency } from './login.model';
import { ToastrService } from 'ngx-toastr';

@Component({ templateUrl: 'login.component.html' })
export class LoginComponent implements OnInit {
    form: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;
    countries : Country[] = [];
    projects : Project[] = [];
   
    public selectedProject : number = 0

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private loginService: LoginService,
        private spinner: NgxSpinnerService,
        private toastr: ToastrService
    ) { }

    ngOnInit() {
        this.form = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required],
            country: ['', Validators.required],
            project: ['', Validators.required]
        });

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

        this.getProjectCountries();
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }
        this.loading = true;
        //this.spinner.show();
        let projSeq = this.selectedProject;
        this.loginService.login(this.f.username.value, this.f.password.value, projSeq)
            .pipe(first())
            .subscribe(data => {
                this.loading = false;
                
                    if(data)
                    {
                        this.loginService.getProjectCurrency().pipe(first())
                        .subscribe(data => {
                            if(data)
                            {
                               this.router.navigate([this.returnUrl]);
                                
                            }
                            else
                            {
                                this.toastr.error('Please set project currency');
                                
                            }
                        },
                        error => {
                            this.toastr.error('Error getting project currency:' + error);
                            this.loading = false;
                        });
                       
                    }
                    else
                    {
                        
                        this.toastr.error('Invalid credentials');
                        this.form.patchValue({
                            password: ''
                         });
                    }
                },
                error => {
                    this.toastr.error('Error :' + error);
                    this.loading = false;
                });
    }

    
    getProjectCountries() 
    {
        this.loginService.getProjectCountries().subscribe((data) => {
          if (data) {
            this.countries = data;
          }
        });
    }

    getProjects(event: any)
    {
        let select = event.target as HTMLSelectElement;
        let dbSeq = Number(select.options[select.selectedIndex].getAttribute("ng-reflect-ng-value"));
        this.loginService.getProjects(dbSeq).subscribe((data) => {
            if (data) {
              this.projects = data;
            }
        });
    }


}