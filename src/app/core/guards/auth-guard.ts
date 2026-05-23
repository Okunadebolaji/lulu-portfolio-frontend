import { Injectable, inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Auth } from '../services/auth';
import { firstValueFrom } from 'rxjs';
import { filter, take } from 'rxjs/operators';

// ✅ ASYNC GUARD - Must wait for initialization
export const authGuard: CanActivateFn = async (route, state) => {
  console.log('🔐🔐🔐 GUARD RUNNING 🔐🔐🔐', { path: state.url });
  
  const authService = inject(Auth);
  const router = inject(Router);

  console.log('🔐 Auth guard checking... (async)', { isInitialized: authService.isInitialized() });

  // ✅ WAIT for initialization to complete
  if (!authService.isInitialized()) {
    console.log('⏳ Waiting for auth initialization...');
    try {
      await firstValueFrom(
        authService.initialized$.pipe(
          filter(val => val === true),
          take(1)
        )
      );
      console.log('✅ Guard: Auth initialization complete');
    } catch (e) {
      console.error('❌ Guard: Auth initialization error:', e);
      router.navigate(['/auth/login']);
      return false;
    }
  }

  // ✅ NOW check authentication
  const isAuth = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();
  
  console.log('🔍 Auth check result:', { isAuth, user: currentUser });

  if (isAuth) {
    console.log('✅ User authenticated, allowing access');
    return true;
  }

  // Not authenticated, redirect to login
  console.log('❌ User not authenticated, redirecting to login');
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
  
  return false;
};