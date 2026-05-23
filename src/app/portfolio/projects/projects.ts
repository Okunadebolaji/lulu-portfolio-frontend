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

  constructor(private api: ApiService, private cdr: ChangeDetectorRef, private auth : Auth,  private router: Router ) {}

  ngOnInit(): void {
    this.loadProjects();
  }
loadProjects(): void {
  this.api.getProjects().subscribe({
    next: (res: any) => {
      console.log('FULL API RESPONSE >>>', res);

      this.projects = res?.data ?? [];

      console.log('ASSIGNED PROJECTS >>>', this.projects);

      this.cdr.detectChanges(); // 🔥 THIS IS THE FIX
    },
    error: (err) => {
      console.error(err);
      this.projects = [];
      this.cdr.detectChanges();
    }
  });
}

goToProjectDetail(projectId: string): void {
    this.router.navigate(['/projects', projectId]);
  }

 // ← ADD THIS METHOD
  onProjectClick(projectId: string): void {
    this.router.navigate(['/projects', projectId]);
  }

  // ← ADD THESE IF YOU WANT SEPARATE HANDLERS
  onLiveClick(url?: string): void {
    if (url) window.open(url, '_blank');
  }

  onGithubClick(url?: string): void {
    if (url) window.open(url, '_blank');
  }

}