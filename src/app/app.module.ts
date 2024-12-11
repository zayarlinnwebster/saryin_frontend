import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminComponent } from './layout/admin/admin.component';
import { NavigationComponent } from './layout/admin/navigation/navigation.component';
import {
  NgbDateAdapter,
  NgbDateParserFormatter,
  NgbModule,
} from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SharedModule } from './shared/shared.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ErrorHandlingInterceptor } from './interceptors/error-handling/error-handling.interceptor';
import { CustomDateAdapterFormatter } from './adapters/custom-date-adapter-formatter/custom-date-adapter-formatter';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { AuthInterceptor } from './interceptors/auth/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    AdminComponent,
    NavigationComponent,
    LoginComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    HttpClientModule,
    NgbModule,
    FontAwesomeModule,
    SharedModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorHandlingInterceptor,
      multi: true,
    },
    { provide: NgbDateAdapter, useClass: CustomDateAdapterFormatter },
    { provide: NgbDateParserFormatter, useClass: CustomDateAdapterFormatter },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
