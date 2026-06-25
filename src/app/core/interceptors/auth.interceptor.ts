import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Auth } from '../services/auth';
import Swal from 'sweetalert2';

let isShowingExpiredAlert = false; // prevent duplicate popups

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);
  const router = inject(Router);

  const token = authService.getToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isShowingExpiredAlert) {
        isShowingExpiredAlert = true;
        authService.logout();
        Swal.fire({
          icon: 'warning',
          title: 'Session Expired',
          text: 'Your session has expired. Please log in again.',
          confirmButtonColor: '#003ec7',
          confirmButtonText: 'Login',
          allowOutsideClick: false,
        }).then(() => {
          isShowingExpiredAlert = false;
          router.navigate(['/auth/login']);
        });
      }
      return throwError(() => error);
    })
  );
};