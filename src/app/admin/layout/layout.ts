import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Auth } from '../../core/services/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class AdminLayout implements OnInit {

  private auth = inject(Auth);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  
  currentUser$ = this.auth.currentUser$;
  sidebarOpen = true;

  ngOnInit(): void {
    console.log('🛠️ AdminLayout ngOnInit');
    
    const isAuth = this.auth.isAuthenticated();
    const user = this.auth.getCurrentUser();
    
    console.log('✅ AdminLayout auth check:', { isAuth, user });
    
    if (!isAuth || !user) {
      console.log('❌ AdminLayout: Not authenticated, redirecting to login');
      this.router.navigate(['/auth/login']);
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout(): void {
    Swal.fire({
      title: 'Logout?',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ba1a1a',
      cancelButtonColor: '#999',
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.auth.logout();
        this.cdr.detectChanges();
        
        Swal.fire({
          icon: 'success',
          title: 'Logged Out',
          text: 'You have logged out successfully.',
          confirmButtonColor: '#003ec7',
          confirmButtonText: 'OK'
        }).then(() => {
          this.router.navigate(['/auth/login']);
        });
      }
    });
  }
}