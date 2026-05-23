import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api';
import { ChangeDetectorRef } from '@angular/core';
import { SkillsSection } from '../skills-section/skills-section'; 

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, SkillsSection],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home implements OnInit {

  featuredProjects: any[] = [];
  loading = true;

  private api = inject(ApiService);
constructor(private cdr: ChangeDetectorRef){}

  ngOnInit(): void {
      console.log('🔥 HOME NGONINIT FIRED');
    this.loadProjects();
    this.cdr.detectChanges(); 
  }

  loadProjects(): void {
  this.loading = true;

  this.api.getProjects().subscribe({
    next: (res: any) => {
      console.log('HOME RESPONSE >>>', res);

      this.featuredProjects = res?.data ?? [];

      console.log('FEATURED >>>', this.featuredProjects);

      this.loading = false;

      this.cdr.detectChanges(); 
    },
    error: (err) => {
      console.error(err);
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}
}