import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface ProjectCard {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  liveUrl?: string;
  githubUrl?: string;
}

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './project-card.html',
  styleUrls: ['./project-card.scss']
})
export class ProjectCard {
  @Input() project!: ProjectCard;
  @Output() projectClick = new EventEmitter<string>();
  @Output() liveClick = new EventEmitter<string>();
  @Output() githubClick = new EventEmitter<string>();

  isHovered = false;

  onCardClick(): void {
    this.projectClick.emit(this.project.id);
  }

  onLiveClick(event: Event): void {
    event.stopPropagation();
    this.liveClick.emit(this.project.liveUrl);
    if (this.project.liveUrl) {
      window.open(this.project.liveUrl, '_blank');
    }
  }

  onGithubClick(event: Event): void {
    event.stopPropagation();
    this.githubClick.emit(this.project.githubUrl);
    if (this.project.githubUrl) {
      window.open(this.project.githubUrl, '_blank');
    }
  }

  // Get featured status from project data
  get isFeatured(): boolean {
    return this.project?.isFeatured ?? false;
  }

  // Truncate description to 120 chars
  get truncatedDescription(): string {
    const desc = this.project?.description ?? '';
    if (desc.length > 120) {
      return desc.substring(0, 120) + '...';
    }
    return desc;
  }
}