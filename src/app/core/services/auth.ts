import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: {
      token: string;
      expiration: string;
    };
    email: string;
    fullName: string;
    role: string;
  };
  errors: any[];
}

export interface AuthResponseSimple {
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = `${environment.apiUrl}/api/Auth`;
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';
  
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private initialized = false;
  private initializationSubject = new BehaviorSubject<boolean>(false);
  public initialized$ = this.initializationSubject.asObservable();

  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.restoreAuthFromStorage();
    } else {
      this.markInitialized();
    }
  }

  private restoreAuthFromStorage(): void {
    console.log('🔄 Auth constructor: Restoring auth from storage...');
    
    const storedToken = this.getToken();
    const storedUser = this.getStoredUser();
    
    console.log('📦 Storage check:', { 
      token: storedToken ? 'EXISTS' : 'MISSING',
      user: storedUser ? 'EXISTS' : 'MISSING'
    });
    
    if (storedToken && storedUser) {
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        
        if (!this.isTokenExpired(payload)) {
          console.log('✅ Token valid, restoring user...');
          this.currentUserSubject.next(storedUser);
          console.log('✅ User restored:', storedUser);
        } else {
          console.warn('⚠️ Token expired');
          this.logout();
        }
      } catch (e) {
        console.error('❌ Error parsing token:', e);
        this.logout();
      }
    } else {
      console.log('ℹ️ No complete auth data in storage');
    }
    
    this.markInitialized();
  }

  private markInitialized(): void {
    this.initialized = true;
    this.initializationSubject.next(true);
    console.log('✅ Auth.constructor: Marked as initialized');
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          const token = response?.data?.token?.token;
          const userData = response?.data;
          
          if (token) {
            this.saveToken(token);
            console.log('✅ Token saved to localStorage');
          }
          
          if (userData) {
            const userToStore = {
              email: userData.email,
              fullName: userData.fullName,
              role: userData.role
            };
            
            this.saveUser(userToStore);
            this.currentUserSubject.next(userToStore);
            console.log('✅ User saved and broadcast:', userToStore);
          }
        })
      );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data)
      .pipe(
        tap(response => {
          const token = response?.data?.token?.token;
          const userData = response?.data;
          
          if (token) {
            this.saveToken(token);
            console.log('✅ Token saved successfully');
          }
          
          if (userData) {
            const userToStore = {
              email: userData.email,
              fullName: userData.fullName,
              role: userData.role
            };
            
            this.saveUser(userToStore);
            this.currentUserSubject.next(userToStore);
            console.log('✅ User saved and broadcast:', userToStore);
          }
        })
      );
  }

  private saveToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  private saveUser(user: any): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  private getStoredUser(): any {
    if (isPlatformBrowser(this.platformId)) {
      const user = localStorage.getItem(this.userKey);
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.currentUserSubject.value;
    
    console.log('🔍 isAuthenticated():', { 
      hasToken: !!token, 
      hasUser: !!user, 
      result: !!(token && user)
    });
    
    return !!token && !!user;
  }

  logout(): void {
    console.log('🚪 Logout called');
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  private isTokenExpired(payload: any): boolean {
    if (!payload.exp) {
      return false;
    }
    const expirationTime = payload.exp * 1000;
    return Date.now() >= expirationTime;
  }
}