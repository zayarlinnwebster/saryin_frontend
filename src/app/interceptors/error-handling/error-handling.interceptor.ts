import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AlertModalConfig } from 'src/app/shared/alert-modal/alert-modal.config';
import { AlertModalService } from 'src/app/services/alert-modal/alert-modal.service';
import { AuthService } from 'src/app/services/auth/auth.service';

@Injectable()
export class ErrorHandlingInterceptor implements HttpInterceptor {
  alertModalConfig: AlertModalConfig = {
    modalTitle: 'စာရင်း',
    hideFooter: true,
  };

  constructor(
    private alertModalService: AlertModalService,
    private authService: AuthService
  ) {
    this.alertModalService.setAlertModalConfig(this.alertModalConfig);
  }

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.error instanceof ErrorEvent) {
          // A client-side or network error occurred. Handle it accordingly.
          console.error('An error occurred:', error.error);
          return throwError(error.error);
        } else {
          // The backend returned an unsuccessful response code.
          if (error.status === 0) {
            return throwError('Connection Time Out.');
          } else if (error.status === 504) {
            this.alertModalService.open(
              'ဆာဗာကို ချိတ်ဆက်ရန် မရရှိနိုင်ပါ။ ကျေးဇူးပြု၍ သင်၏စီမံခန့်ခွဲသူကို ဆက်သွယ်ပါ။',
              'warning'
            );
            return throwError(
              'The server is unavailable. Please contact your administrator.'
            );
          } else if (error.status === 401) {
            // Unauthorized error: You may want to log the user out or handle it as needed
            this.authService.logout();
            return throwError(error.error);
          } else if (error.status === 440) {
            // Session expired error: You may want to log the user out or handle it as needed
            this.alertModalService.open(
              'အကောင့် သက်တမ်းကုန်သွားပါပြီ။ ကျေးဇူးပြု၍ သင့်အကောင့်ကိုထပ်မံဝင်ရောက်ပါ။',
              'warning'
            );
            this.authService.logout();
            return throwError(error.error);
          } else {
            console.error(
              `Backend returned code ${error.status}, ` +
                `body was: ${error.error}`
            );
            return throwError(error.error);
          }
        }
      })
    );
  }
}
