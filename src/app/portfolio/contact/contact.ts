import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  contactForm: FormGroup;
  submitted = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private api: ApiService
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.contactForm.invalid) return;

    this.loading = true;

    const payload = {
      fullName: this.contactForm.get('name')?.value,
      email: this.contactForm.get('email')?.value,
      subject: this.contactForm.get('subject')?.value,
      message: this.contactForm.get('message')?.value,
    };

    this.api.createContactMessage(payload).subscribe({
      next: () => {
        this.loading = false;
        this.contactForm.reset();
        this.submitted = false;
        this.cdr.detectChanges();
        Swal.fire({
          icon: 'success',
          title: 'Message Sent!',
          text: 'Thank you for reaching out. I\'ll get back to you within 24 hours.',
          confirmButtonColor: '#003ec7',
          confirmButtonText: 'OK'
        });
      },
      error: (err) => {
        this.loading = false;
        this.cdr.detectChanges();
        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: err.error?.message || 'Failed to send message. Please try again.',
          confirmButtonColor: '#ba1a1a',
          confirmButtonText: 'Try Again'
        });
      }
    });
  }

  get name() { return this.contactForm.get('name'); }
  get email() { return this.contactForm.get('email'); }
  get subject() { return this.contactForm.get('subject'); }
  get message() { return this.contactForm.get('message'); }
}