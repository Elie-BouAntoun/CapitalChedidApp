import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { SharedFunctions } from '../_shared/shared-functions';

@Component({
  selector: 'login',
  templateUrl: './login.html'
})
export class LoginComponent implements AfterViewInit {
  constructor(
    public router: Router,
    public shared_functions: SharedFunctions
  ) { }

  @ViewChild("frmLogin", { read: NgForm }) form_login: any;

  public login_data: { username: string; password: string } = { username: "", password: "" };

  ngAfterViewInit() {
    this.shared_functions.AnimatePageOnLoad();
  }

  Login() {
    if (this.form_login.valid) {
      this.shared_functions.FadePageOnClose();

      setTimeout(() => {
        this.router.navigate(['home']);
      }, 400);
    }
  }
}
