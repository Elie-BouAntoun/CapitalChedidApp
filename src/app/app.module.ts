import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';

import { AppRoutingModule } from './app-routing.module';

import { SharedFunctions } from './_shared/shared-functions';
import { ClickOutsideDirective } from './_shared/directives/click-outside.directive';
import { TransformPipe } from './_shared/pipes/transform-data.pipe';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,

    ClickOutsideDirective,
    TransformPipe
  ],
  imports: [
    FormsModule,
    BrowserModule,
    HttpClientModule,
    MatIconModule,
    AppRoutingModule
  ],
  providers: [SharedFunctions],
  bootstrap: [AppComponent],
})
export class AppModule { }
