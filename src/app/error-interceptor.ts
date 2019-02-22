import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ErrorComponent } from './error/error.component';

@Injectable()
export class ErrorInterCeptor implements HttpInterceptor {

  constructor(private dialog: MatDialog) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {

    return next.handle(req).pipe(
      catchError( (err: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occured';
        if (err.error.message) {
          errorMessage = err.error.message;
        }
        console.log(err);
        this.dialog.open( ErrorComponent, {data: errorMessage} );
        return throwError(err);
      })
    );
  }

}
