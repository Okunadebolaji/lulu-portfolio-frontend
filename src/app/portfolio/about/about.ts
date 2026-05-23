import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Experience {
  year: string;
  title: string;
  company: string;
  description: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  experiences: Experience[] = [
    {
      year: '2023 - Present',
      title: 'Senior UI/UX Designer',
      company: 'Creative Studios',
      description: 'Leading design systems and digital experiences for enterprise clients'
    },
    {
      year: '2021 - 2023',
      title: 'Full Stack Developer',
      company: 'Tech Innovations Ltd',
      description: 'Built scalable applications using Angular, Node.js, and cloud technologies'
    },
    {
      year: '2019 - 2021',
      title: 'Frontend Developer',
      company: 'Digital Agency Pro',
      description: 'Developed responsive web applications and interactive user interfaces'
    }
  ];

  skills = [
    { category: 'Design', items: ['UI/UX Design', 'Figma', 'Prototyping', 'User Research'] },
    { category: 'Frontend', items: ['Angular', 'TypeScript', 'SCSS', 'Responsive Design'] },
    { category: 'Backend', items: ['Node.js', 'Express', 'SQL', 'MongoDB'] },
    { category: 'Tools', items: ['Git', 'Docker', 'AWS', 'Jira'] }
  ];
}