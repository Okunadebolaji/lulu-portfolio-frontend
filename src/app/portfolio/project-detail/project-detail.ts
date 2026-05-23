import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api';
import { ChangeDetectorRef } from '@angular/core';

interface Project {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  liveUrl: string;
  githubUrl: string;
  isFeatured: boolean;
  createdDate: string;
  content?: string;
  technologies?: string[];
  images?: string[];
}

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './project-detail.html',
  styleUrls: ['./project-detail.scss']
})
export class ProjectDetail implements OnInit {
  // 🔧 Dependencies
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  // 📊 Component State
  project: Project | null = null;
  loading = true;
  error: string | null = null;
  projectId: string | null = null;

  ngOnInit(): void {
    this.loadProject();
  }

  /**
   * Load project by ID from URL params
   */
  loadProject(): void {
    // 1️⃣ GET ID FROM URL
    this.projectId = this.route.snapshot.paramMap.get('id');

    // 2️⃣ VALIDATE ID EXISTS
    if (!this.projectId) {
      this.error = 'Project ID not found';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    // 3️⃣ FETCH PROJECT FROM API
    this.loading = true;
    this.error = null;

    this.api.getProjectById(this.projectId).subscribe({
      // ✅ SUCCESS
      next: (res: any) => {
        console.log('📥 Project loaded:', res);

        // IMPORTANT: API returns { success, message, data, errors }
        // We need res.data, not res directly
        this.project = res?.data ?? null;

        if (!this.project) {
          this.error = 'Project not found';
        }

        this.loading = false;
        this.cdr.detectChanges();
      },

      // ❌ ERROR
      error: (err: any) => {
        console.error('❌ Error loading project:', err);
        this.error = 'Failed to load project. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Go back to projects page
   */
  goBack(): void {
    this.router.navigate(['/projects']);
  }

  /**
   * Open live project in new tab
   */
  openLive(): void {
    if (this.project?.liveUrl) {
      window.open(this.project.liveUrl, '_blank');
    }
  }

  /**
   * Open GitHub repo in new tab
   */
  openGithub(): void {
    if (this.project?.githubUrl) {
      window.open(this.project.githubUrl, '_blank');
    }
  }
}