import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkillsService, Skill, SkillCategory } from '../../core/services/skills.service';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-skills-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skills-section.html',
  styleUrl: './skills-section.scss',
})
export class SkillsSection implements OnInit, OnDestroy {
  // 📊 STATE
  skillsByCategory: SkillCategory[] = [];
  allSkills: Skill[] = [];
  loading = true;
  error: string | null = null;
  
  // 🔍 FILTERS
  selectedCategory: string | null = null;
  categories: string[] = [];
  
  // 📈 STATS
  totalSkills = 0;
  averageProficiency = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private skillsService: SkillsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSkills();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // 📂 LOAD SKILLS FROM SERVICE
  loadSkills(): void {
    console.log('📂 SkillsSection: Loading skills...');
    this.loading = true;
    this.error = null;

    this.skillsService
      .getSkills()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (skills: Skill[]) => {
          console.log('✅ Skills loaded in component:', skills);
          
          if (!skills || !Array.isArray(skills) || skills.length === 0) {
            console.warn('⚠️ No skills or invalid data received');
            this.allSkills = [];
            this.skillsByCategory = [];
            this.categories = [];
            this.error = 'No skills found. Add some in the admin panel.';
            return;
          }
          
          this.allSkills = skills;
          this.skillsByCategory = this.skillsService.groupByCategory(skills);
          this.categories = this.skillsService.getAllCategories(skills);
          this.updateStats();
          this.error = null;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Error loading skills:', err);
          this.error = 'Failed to load skills. Please try again later.';
          this.cdr.detectChanges();
        },
      });
  }

  // 📊 UPDATE STATISTICS
  private updateStats(): void {
    const stats = this.skillsService.getStatistics(this.allSkills);
    this.totalSkills = stats.totalSkills;
    this.averageProficiency = stats.averageProficiency;
  }

  // 🎨 GET COLOR BY PROFICIENCY
  getColorByProficiency(percentage: number): string {
    return this.skillsService.getColorByProficiency(percentage);
  }

  // 🏷️ GET PROFICIENCY LABEL
  getProficiencyLabel(percentage: number): string {
    if (percentage >= 80) return 'Expert';
    if (percentage >= 60) return 'Proficient';
    if (percentage >= 40) return 'Intermediate';
    return 'Beginner';
  }

  // 🔍 FILTER BY CATEGORY
  filterByCategory(category: string): void {
    this.selectedCategory = this.selectedCategory === category ? null : category;
    this.cdr.detectChanges();
  }

  // 📋 GET FILTERED SKILLS
  getFilteredSkills(): SkillCategory[] {
    if (!this.selectedCategory) {
      return this.skillsByCategory;
    }
    return this.skillsByCategory.filter(
      (cat) => cat.name === this.selectedCategory
    );
  }

  // ✅ CHECK IF CATEGORY IS SELECTED
  isCategorySelected(category: string): boolean {
    return this.selectedCategory === category;
  }

  // 📌 TRACK BY FUNCTION FOR *ngFor
  trackBySkillId(index: number, skill: Skill): string {
    return skill.id || index.toString();
  }

  trackByCategoryName(index: number, category: SkillCategory): string {
    return category.name;
  }
}