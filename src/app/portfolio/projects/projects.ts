import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api';
import { ChangeDetectorRef } from '@angular/core';
import { Auth } from '../../core/services/auth';
import { Router } from '@angular/router';
import { ProjectCard } from '../../shared/project-card/project-card'; 


@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, ProjectCard],
  templateUrl: './projects.html',
styleUrls: ['./projects.scss']
})
export class ProjectsComponent implements OnInit {

  projects: any[] = [];
  pagedProjects: any[] = [];

  // Pagination
  currentPage = 1;
  pageSize = 3;
  totalPages = 0;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef, private auth : Auth,  private router: Router ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.api.getProjects().subscribe({
      next: (res: any) => {
        this.projects = res?.data ?? [];
        this.currentPage = 1;
        this.updatePagedProjects();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.projects = [];
        this.pagedProjects = [];
        this.cdr.detectChanges();
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage(): void { this.goToPage(this.currentPage + 1); }
  prevPage(): void { this.goToPage(this.currentPage - 1); }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToProjectDetail(projectId: string): void {
    this.router.navigate(['/projects', projectId]);
  }

  onProjectClick(projectId: string): void {
    this.router.navigate(['/projects', projectId]);
  }

  onLiveClick(url?: string): void {
    if (url) window.open(url, '_blank');
  }

  onGithubClick(url?: string): void {
    if (url) window.open(url, '_blank');
  }

}