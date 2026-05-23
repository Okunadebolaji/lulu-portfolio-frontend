import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api';

interface Project {
  id: number;
  title: string;
  category: string;
  description: string;
  completedDate: Date;
  thumbnailUrl?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  stats = {
    totalProjects: 0,
    totalSkills: 0,
    avgProficiency: 0,
    totalCategories: 0,
  };

  recentProjects: Project[] = [];
  loading = true;
  loadingProjects = false;
  loadingSkills = false;
  lastUpdated: Date | null = null;

  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadDashboardData();
    setInterval(() => this.loadDashboardData(), 5 * 60 * 1000);
  }

  loadDashboardData(): void {
    this.loading = true;
    this.lastUpdated = new Date();
    this.cdr.detectChanges();

    // Load projects
    this.loadingProjects = true;
    this.api.getProjects().subscribe({
      next: (response: any) => {
        const projects = this.extractDataArray(response);
        this.stats.totalProjects = projects.length;
        this.recentProjects = projects.slice(0, 5).map((p: any) => ({
          id: p.id,
          title: p.title,
          category: p.category || 'Uncategorized',
          description: p.description || '',
          completedDate: new Date(p.completedDate || p.createdAt),
          thumbnailUrl: p.thumbnailUrl,
        }));
        this.loadingProjects = false;
        this.updateLoadingState();
        this.cdr.detectChanges();
        console.log('Projects loaded:', this.stats.totalProjects);
      },
      error: (err) => {
        console.error('Failed to load projects:', err);
        this.stats.totalProjects = 0;
        this.recentProjects = [];
        this.loadingProjects = false;
        this.updateLoadingState();
        this.cdr.detectChanges();
      },
    });

    // Load skills
    this.loadingSkills = true;
    this.api.getSkills().subscribe({
      next: (response: any) => {
        const skills = this.extractDataArray(response);
        this.stats.totalSkills = skills.length;
        if (skills.length > 0) {
          const totalPercentage = skills.reduce((sum, s) => sum + (s.percentage || 0), 0);
          this.stats.avgProficiency = Math.round(totalPercentage / skills.length);
          this.stats.totalCategories = new Set(skills.map((s: any) => s.category)).size;
        }
        this.loadingSkills = false;
        this.updateLoadingState();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load skills:', err);
        this.stats.totalSkills = 0;
        this.stats.avgProficiency = 0;
        this.stats.totalCategories = 0;
        this.loadingSkills = false;
        this.updateLoadingState();
        this.cdr.detectChanges();
      },
    });
  }

  private extractDataArray(response: any): any[] {
    if (Array.isArray(response)) return response;
    if (response?.data && Array.isArray(response.data)) return response.data;
    if (response?.items && Array.isArray(response.items)) return response.items;
    console.warn('Unexpected API response structure:', response);
    return [];
  }

  private updateLoadingState(): void {
    this.loading = this.loadingProjects || this.loadingSkills;
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'Web Development': 'primary',
      'Mobile': 'tertiary',
      'UI/UX': 'secondary',
      'Design': 'secondary',
      'Backend': 'primary',
      'Frontend': 'primary',
      'Fullstack': 'primary',
    };
    return colors[category] || 'secondary';
  }

  refreshDashboard(): void {
    this.loadDashboardData();
  }
}