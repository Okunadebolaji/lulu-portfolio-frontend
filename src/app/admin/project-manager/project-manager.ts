import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-project-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './project-manager.html',
  styleUrl: './project-manager.scss',
})
export class ProjectManager implements OnInit {
  // 📋 Form state
  projectForm!: FormGroup;
  projects: any[] = [];
  pagedProjects: any[] = [];
  isLoading = false;
  selectedProject: any = null;
  isEditing = false;

  // 🖼️ Image upload state
  uploadProgress = 0;
  uploadError = '';
  uploadedImageUrl = '';
  isImageUploaded = false;

  // 📖 PAGINATION
  currentPage = 1;
  pageSize = 3;
  totalPages = 0;

  // 📊 UI state
  showForm = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private auth: Auth,
    private cdr: ChangeDetectorRef  // ✅ NEW: For change detection
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  // ==================== FORM SETUP ====================

  private initializeForm(): void {
    this.projectForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      thumbnailUrl: [''],
     liveUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+\..+/)]],
      githubUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+\..+/)]],
      isFeatured: [false],
    });
  }

  // ==================== PROJECT CRUD ====================

  private loadProjects(): void {
    this.isLoading = true;
    this.api.getProjects().subscribe({
      next: (response) => {
        this.projects = response.data || [];
        this.currentPage = 1;
        this.updatePagedProjects();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = 'Failed to load projects';
        this.isLoading = false;
        console.error(error);
      }
    });
  }

  updatePagedProjects(): void {
    this.totalPages = Math.ceil(this.projects.length / this.pageSize);
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedProjects = this.projects.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagedProjects();
      this.cdr.detectChanges();
    }
  }

  nextPage(): void { this.goToPage(this.currentPage + 1); }
  prevPage(): void { this.goToPage(this.currentPage - 1); }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  openCreateForm(): void {
    this.showForm = true;
    this.isEditing = false;
    this.selectedProject = null;
    this.projectForm.reset();
    
    // ✅ FIX #4: Clear image upload state completely
    this.uploadedImageUrl = '';
  this.isImageUploaded = false;
  this.uploadError = '';
  this.uploadProgress = 0;
  this.successMessage = ''; // ✅ Explicit clear
  this.errorMessage = '';

  this.cdr.detectChanges();
  }

  openEditForm(project: any): void {
    this.showForm = true;
    this.isEditing = true;
    this.selectedProject = project;
    
    // ✅ Pre-fill form with existing project data
    this.projectForm.patchValue({
      title: project.title,
      description: project.description,
      thumbnailUrl: project.thumbnailUrl,
      liveUrl: project.liveUrl,
      githubUrl: project.githubUrl,
      isFeatured: project.isFeatured ?? false,
    });
    
    // ✅ FIX #2: Mark existing image as already uploaded
    this.uploadedImageUrl = project.thumbnailUrl;
  this.isImageUploaded = true;
  this.uploadError = '';
  this.successMessage = ''; // ✅ Explicit clear
  this.errorMessage = '';

  this.cdr.detectChanges();
 
}

  closeForm(): void {
    this.showForm = false;
    this.projectForm.reset();
    
    // ✅ FIX #4: Clear all upload state
    this.uploadedImageUrl = '';
    this.isImageUploaded = false;
    this.uploadError = '';
    this.uploadProgress = 0;
    
    this.clearMessages();
    
    // ✅ FIX #8: Reload projects after form closes
    this.loadProjects();
    this.cdr.detectChanges();
  }

  // ==================== IMAGE UPLOAD ====================

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    
    if (!file) {
      return;
    }

    // ✅ Clear previous errors
    this.uploadError = '';
    this.isImageUploaded = false;

    // ✅ Validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.uploadError = 'Invalid file type. Allowed: JPG, PNG, GIF, WebP';
      this.cdr.detectChanges();
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.uploadError = 'File size exceeds 5MB limit';
      this.cdr.detectChanges();
      return;
    }

    // ✅ Upload immediately
    this.uploadProgress = 30;
    this.cdr.detectChanges();

    this.api.uploadProjectImage(file).subscribe({
      next: (response) => {
        this.uploadProgress = 100;
        
        // ✅ Validate response has URL
        if (!response || !response.url) {
          this.uploadError = 'Server returned invalid response';
          this.uploadProgress = 0;
          this.isImageUploaded = false;
          this.cdr.detectChanges();
          return;
        }
        
        // ✅ Store URL in form AND mark as uploaded
        this.uploadedImageUrl = response.url;
        this.isImageUploaded = true;
        
        this.projectForm.patchValue({
          thumbnailUrl: response.url
        });
        
        this.successMessage = 'Image uploaded successfully';
        
        // Reset progress after 2 seconds
        setTimeout(() => {
          this.uploadProgress = 0;
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 2000);
        
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Upload error:', error);
        
        // ✅ Better error messages based on status code
        let errorMsg = 'Failed to upload image';
        
        if (error.status === 401) {
          errorMsg = 'Session expired. Please login again.';
          // Optionally logout user
          setTimeout(() => {
            this.auth.logout();
          }, 1500);
        } else if (error.status === 403) {
          errorMsg = 'You do not have permission to upload files. Contact administrator.';
        } else if (error.status === 413) {
          errorMsg = 'File too large (max 5MB)';
        } else if (error.status === 415) {
          errorMsg = 'Unsupported file type (JPG, PNG, GIF, WebP allowed)';
        } else if (error.status === 400) {
          errorMsg = error.error?.message || 'Invalid file. Please try again.';
        } else if (error.error?.message) {
          errorMsg = error.error.message;
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        this.uploadError = errorMsg;
        this.uploadProgress = 0;
        this.isImageUploaded = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ==================== FORM SUBMISSION ====================

  onSubmit(): void {
    if (!this.projectForm.valid) {
      this.errorMessage = 'Please fill all required fields correctly';
      return;
    }

   if (!this.isEditing) {  // Only check for new projects
    if (!this.isImageUploaded || !this.uploadedImageUrl) {
      this.errorMessage = 'Please upload an image first';
      return;
    }
  }

    this.isLoading = true;
    this.clearMessages();

    const payload = this.projectForm.value;

    if (this.isEditing && this.selectedProject) {
      // ✅ FIX #2: UPDATE existing project
      this.api.updateProject(this.selectedProject.id, payload).subscribe({
        next: (response) => {
          this.successMessage = 'Project updated successfully';
          this.isLoading = false;
          this.loadProjects();
          this.closeForm();
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to update project';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      // ✅ CREATE new project
      this.api.createProject(payload).subscribe({
        next: (response) => {
          this.successMessage = 'Project created successfully';
          this.isLoading = false;
          this.loadProjects();
          this.closeForm();
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to create project';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  // ==================== DELETE ====================

  deleteProject(projectId: number): void {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }

    this.isLoading = true;
    this.api.deleteProject(projectId.toString()).subscribe({
      next: (response) => {
        this.successMessage = 'Project deleted successfully';
        this.isLoading = false;
        this.loadProjects();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to delete project';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ==================== HELPERS ====================

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  hasImage(): boolean {
  return !!this.uploadedImageUrl;
}
  // ✅ FIX #2: Updated validation logic
  isFormValid(): boolean {
  if (this.isEditing) {
    // When editing: form valid + (new image uploaded OR existing image)
    return (
      this.projectForm.valid &&
      (this.isImageUploaded || this.hasImage())
    );
  }

  // When creating: form valid + image uploaded
  return (
    this.projectForm.valid &&
    this.isImageUploaded
  );
}
}