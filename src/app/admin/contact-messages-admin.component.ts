import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/services/api';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contact-messages-admin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="messages-container">
      <div class="messages-header">
        <h2>Contact Messages</h2>
        <span class="total-badge">{{ messages.length }}</span>
      </div>

      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading messages...</p>
      </div>

      <div *ngIf="!loading && messages.length === 0" class="empty-state">
        <p>No messages yet</p>
      </div>

      <div *ngIf="!loading && messages.length > 0" class="messages-list">
        <div *ngFor="let msg of messages" class="message-item">
          <div class="msg-left">
            <h4>{{ msg.fullName }}</h4>
            <p class="msg-email">{{ msg.email }}</p>
            <p class="msg-date">{{ msg.createdAt | date: 'MMM d, y • h:mm a' }}</p>
          </div>
          <div class="msg-middle">
            <p class="msg-subject">{{ msg.subject }}</p>
            <p class="msg-preview">{{ msg.message | slice:0:100 }}{{ msg.message.length > 100 ? '...' : '' }}</p>
          </div>
          <div class="msg-actions">
            <button (click)="viewMessage(msg)" class="btn-view" title="View">
              <i class="bi bi-eye"></i>
            </button>
            <button (click)="deleteMessage(msg.id)" class="btn-delete" title="Delete">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .messages-container {
      padding: 24px;
      background: #fbf9f8;
      min-height: 100vh;
    }

    .messages-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 2px solid #c3c5d9;
    }

    .messages-header h2 {
      margin: 0;
      color: #1b1c1c;
      font-size: 28px;
      font-weight: 700;
    }

    .total-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 32px;
      height: 32px;
      background: #003ec7;
      color: white;
      border-radius: 50%;
      font-weight: 700;
      font-size: 14px;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 24px;
      gap: 16px;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #efeded;
      border-top-color: #003ec7;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-state {
      text-align: center;
      padding: 80px 24px;
      color: #434656;
      font-size: 16px;
    }

    .messages-list {
      display: grid;
      gap: 12px;
    }

    .message-item {
      display: grid;
      grid-template-columns: 1fr 2fr 120px;
      gap: 24px;
      align-items: center;
      padding: 20px;
      background: white;
      border: 1px solid #c3c5d9;
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .message-item:hover {
      border-color: #003ec7;
      box-shadow: 0 4px 16px rgba(0, 62, 199, 0.1);
    }

    .msg-left h4 {
      margin: 0 0 8px 0;
      color: #1b1c1c;
      font-size: 16px;
      font-weight: 700;
    }

    .msg-email {
      margin: 0 0 8px 0;
      color: #003ec7;
      font-size: 14px;
      text-decoration: none;
    }

    .msg-date {
      margin: 0;
      color: #999;
      font-size: 12px;
    }

    .msg-subject {
      margin: 0 0 8px 0;
      color: #1b1c1c;
      font-size: 15px;
      font-weight: 600;
    }

    .msg-preview {
      margin: 0;
      color: #434656;
      font-size: 14px;
      line-height: 1.5;
    }

    .msg-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }

    .btn-view, .btn-delete {
      width: 40px;
      height: 40px;
      border: 1px solid #c3c5d9;
      background: white;
      border-radius: 8px;
      font-size: 18px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #434656;
    }

    .btn-view:hover {
      border-color: #003ec7;
      background: #dde1ff;
      color: #003ec7;
    }

    .btn-delete:hover {
      border-color: #ba1a1a;
      background: #ffdad6;
      color: #ba1a1a;
    }

    @media (max-width: 768px) {
      .message-item {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .msg-actions {
        justify-content: flex-start;
      }
    }
  `]
})
export class ContactMessagesAdminComponent implements OnInit {
  messages: any[] = [];
  loading = true;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadMessages();
  }

  loadMessages() {
    this.loading = true;
    this.cdr.detectChanges();
    
    this.api.getContactMessages().subscribe({
      next: (response: any) => {
        console.log('API Response:', response);
        
        const data = response?.data || response || [];
        
        this.messages = (Array.isArray(data) ? data : []).sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('API Error:', err);
        this.loading = false;
        this.cdr.detectChanges();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || 'Failed to load messages',
          confirmButtonColor: '#ba1a1a'
        });
      }
    });
  }

  viewMessage(msg: any) {
    Swal.fire({
      title: msg.fullName,
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <p><strong>Email:</strong> ${msg.email}</p>
          <p><strong>Subject:</strong> ${msg.subject}</p>
          <p><strong>Date:</strong> ${new Date(msg.createdAt).toLocaleString()}</p>
          <hr style="margin: 15px 0;">
          <p style="white-space: pre-wrap; line-height: 1.6;">${msg.message}</p>
        </div>
      `,
      confirmButtonColor: '#003ec7',
      confirmButtonText: 'Close'
    });
  }

  deleteMessage(id: number) {
    Swal.fire({
      title: 'Delete Message?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ba1a1a',
      cancelButtonColor: '#999',
      confirmButtonText: 'Delete'
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.deleteContactMessage(id.toString()).subscribe({
          next: () => {
            this.messages = this.messages.filter(m => m.id !== id);
            this.cdr.detectChanges();
            Swal.fire({
              icon: 'success',
              title: 'Deleted',
              text: 'Message deleted successfully',
              confirmButtonColor: '#003ec7'
            });
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to delete message',
              confirmButtonColor: '#ba1a1a'
            });
          }
        });
      }
    });
  }
}