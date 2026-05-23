import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../core/services/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  email = '';
  password = '';
  loading = false;

  private auth = inject(Auth);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  login(): void {
    if (!this.email || !this.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please enter email and password',
        confirmButtonColor: '#003ec7',
        confirmButtonText: 'OK'
      });
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    this.auth.login({ email: this.email, password: this.password })
      .subscribe({
        next: (response) => {
          console.log('Login successful', response);
          console.log('Token saved:', this.auth.getToken());
          
          this.loading = false;
          this.cdr.detectChanges();

          Swal.fire({
            icon: 'success',
            title: 'Welcome!',
            text: 'Login successful. Redirecting to dashboard...',
            confirmButtonColor: '#003ec7',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
            allowEscapeKey: false
          }).then(() => {
            this.router.navigate(['/admin/dashboard']);
          });
        },
        error: (err) => {
          console.error('Login error:', err);
          this.loading = false;
          this.cdr.detectChanges();

          const errorMessage = err.error?.message || 'Invalid credentials. Please try again.';
          
          Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: errorMessage,
            confirmButtonColor: '#ba1a1a',
            confirmButtonText: 'Try Again'
          });
        }
      });
  }
}