import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, finalize, map } from 'rxjs/operators';
import { ApiService } from './api';

// 🎯 TYPE DEFINITIONS
export interface Skill {
  id?: string;
  name: string;
  percentage: number;
  category: string;
}

export interface SkillCategory {
  name: string;
  skills: Skill[];
  averagePercentage?: number;
}

export interface SkillsStatistics {
  totalSkills: number;
  averageProficiency: number;
  byCategory: {
    category: string;
    count: number;
    average: number;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class SkillsService {
  // 📋 STATE MANAGEMENT
  private skillsSubject = new BehaviorSubject<Skill[]>([]);
  public skills$ = this.skillsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor(private api: ApiService) {}

  // ✅ FETCH ALL SKILLS
  getSkills(): Observable<Skill[]> {
    console.log('📂 SkillsService: Fetching all skills...');
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.api.getSkills().pipe(
      tap((skills: Skill[]) => {
        console.log('✅ Skills fetched:', skills);
        this.skillsSubject.next(skills);
      }),
      finalize(() => {
        this.loadingSubject.next(false);
      })
    );
  }

  // ✅ GET SKILLS BY CATEGORY
 getSkillsByCategory(): Observable<SkillCategory[]> {
  return this.api.getSkills().pipe(
    map((skills: Skill[]) => {
      const grouped = this.groupByCategory(skills);
      console.log('📊 Skills grouped by category:', grouped);
      return grouped;
    })
  );
}

  // 🔧 HELPER: Group skills by category
  groupByCategory(skills: Skill[]): SkillCategory[] {
    const grouped = skills.reduce((acc: any, skill: Skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {});

    return Object.keys(grouped).map(category => ({
      name: category,
      skills: grouped[category],
      averagePercentage: this.calculateAverage(grouped[category]),
    }));
  }

  // 🔧 HELPER: Calculate average proficiency
  private calculateAverage(skills: Skill[]): number {
    if (skills.length === 0) return 0;
    const sum = skills.reduce((acc, skill) => acc + skill.percentage, 0);
    return Math.round(sum / skills.length);
  }

  // ✅ GET SINGLE SKILL
  getSkillById(id: string): Observable<Skill> {
    return this.api.getSkillById(id);
  }

  // ✅ CREATE SKILL
  createSkill(skill: Skill): Observable<Skill> {
    console.log('🆕 Creating skill:', skill);
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.api.createSkill(skill).pipe(
      tap((newSkill: Skill) => {
        console.log('✅ Skill created:', newSkill);
        // Add to current skills
        const current = this.skillsSubject.value;
        this.skillsSubject.next([...current, newSkill]);
      }),
      finalize(() => {
        this.loadingSubject.next(false);
      })
    );
  }

  // ✅ UPDATE SKILL
  updateSkill(id: string, skill: Skill): Observable<Skill> {
    console.log('✏️ Updating skill:', id, skill);
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.api.updateSkill(id, skill).pipe(
      tap((updatedSkill: Skill) => {
        console.log('✅ Skill updated:', updatedSkill);
        // Update in current skills
        const current = this.skillsSubject.value;
        const index = current.findIndex(s => s.id === id);
        if (index > -1) {
          current[index] = updatedSkill;
          this.skillsSubject.next([...current]);
        }
      }),
      finalize(() => {
        this.loadingSubject.next(false);
      })
    );
  }

  // ✅ DELETE SKILL
  deleteSkill(id: string): Observable<any> {
    console.log('🗑️ Deleting skill:', id);
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.api.deleteSkill(id).pipe(
      tap(() => {
        console.log('✅ Skill deleted:', id);
        // Remove from current skills
        const current = this.skillsSubject.value;
        this.skillsSubject.next(current.filter(s => s.id !== id));
      }),
      finalize(() => {
        this.loadingSubject.next(false);
      })
    );
  }

  // 📊 GET STATISTICS
  getStatistics(skills: Skill[] = this.skillsSubject.value): SkillsStatistics {
    const totalSkills = skills.length;
    const averageProficiency = this.calculateAverage(skills);

    const byCategory = Object.entries(
      skills.reduce((acc: any, skill) => {
        if (!acc[skill.category]) {
          acc[skill.category] = [];
        }
        acc[skill.category].push(skill.percentage);
        return acc;
      }, {})
    ).map(([category, percentages]: any) => ({
      category,
      count: percentages.length,
      average: Math.round(
        percentages.reduce((a: number, b: number) => a + b, 0) / percentages.length
      ),
    }));

    return {
      totalSkills,
      averageProficiency,
      byCategory,
    };
  }

  // 🎨 GET COLOR BY PROFICIENCY LEVEL
  getColorByProficiency(percentage: number): string {
    if (percentage >= 80) return '#0052ff'; // Blue - Expert
    if (percentage >= 60) return '#20c997'; // Green - Proficient
    if (percentage >= 40) return '#ff9800'; // Orange - Intermediate
    return '#e74c3c'; // Red - Beginner
  }

  // 📋 GET ALL CATEGORIES
  getAllCategories(skills: Skill[] = this.skillsSubject.value): string[] {
    return [...new Set(skills.map(s => s.category))];
  }

  // 🔄 REFRESH SKILLS FROM SERVER
  refreshSkills(): Observable<Skill[]> {
    console.log('🔄 Refreshing skills from server...');
    return this.getSkills();
  }
}