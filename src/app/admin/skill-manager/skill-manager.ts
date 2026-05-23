import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SkillsService, Skill } from '../../core/services/skills.service';
import { Subject } from 'rxjs';
import { takeUntil, finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-skill-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './skill-manager.html',
  styleUrl: './skill-manager.scss',
})
export class SkillManager implements OnInit, OnDestroy {
  // 📊 STATE
  allSkills: Skill[] = [];
  displayedSkills: Skill[] = [];
  loading = false;
  error: string | null = null;
  success: string | null = null;

  // 📖 PAGINATION
  currentPage = 1;
  pageSize = 10;
  totalSkills = 0;
  totalPages = 0;

  // 🎯 FORM
  skillForm!: FormGroup;
  editingId: string | null = null;
  isFormVisible = false;

  // 🔍 FILTERS & SEARCH
  searchQuery = '';
  selectedCategory = '';
  categories: string[] = [];

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private skillsService: SkillsService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef   // ✅ FIX 1: Force change detection
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadSkills();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 1;
      this.updatePaginatedView();
      this.cdr.detectChanges(); // force view update after filter
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.skillForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      category: ['Frontend', Validators.required],
      percentage: [50, [Validators.required, Validators.min(0), Validators.max(100)]],
    });
  }

  loadSkills(): void {
    console.log('📂 Loading all skills...');
    this.loading = true;
    this.error = null;

    this.skillsService
      .getSkills()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges(); // ✅ FIX 2: update UI after loading finishes
        })
      )
      .subscribe({
        next: (skills: Skill[]) => {
          console.log('✅ Skills loaded:', skills.length);
          this.allSkills = skills;
          this.categories = this.skillsService.getAllCategories(skills);
          this.updatePaginatedView();
          this.cdr.detectChanges(); // ✅ FIX 3: ensure table renders immediately
        },
        error: (err) => {
          console.error('❌ Error loading skills:', err);
          this.error = 'Failed to load skills';
          this.cdr.detectChanges();
        },
      });
  }

  updatePaginatedView(): void {
    const filtered = this.getFilteredSkills();
    this.totalSkills = filtered.length;
    this.totalPages = Math.ceil(this.totalSkills / this.pageSize);

    // Reset current page if out of bounds
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
    if (this.currentPage < 1) this.currentPage = 1;

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedSkills = filtered.slice(startIndex, endIndex);
    
    console.log(`📖 Page ${this.currentPage} of ${this.totalPages} (${this.displayedSkills.length} items)`);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedView();
      this.cdr.detectChanges();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedView();
      this.cdr.detectChanges();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedView();
      this.cdr.detectChanges();
    }
  }

  getFilteredSkills(): Skill[] {
    return this.allSkills.filter(skill => {
      const matchesSearch =
        skill.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        skill.category.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesCategory = !this.selectedCategory || skill.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  onSearch(): void {
    this.searchSubject.next(this.searchQuery);
  }

  onCategoryFilter(): void {
    this.currentPage = 1;
    this.updatePaginatedView();
    this.cdr.detectChanges();
  }

  // ✅ Start adding a new skill
  startAddSkill(): void {
    console.log('➕ Creating new skill');
    this.editingId = null;
    this.skillForm.reset({ name: '', category: 'Frontend', percentage: 50 });
    this.isFormVisible = true;
    this.success = null;
    this.error = null;
    this.cdr.detectChanges();
  }

  // ✅ FIX 4: Edit button – ensure skill has id, and form opens
  editSkill(skill: Skill): void {
    console.log('✏️ Editing skill:', skill);
    if (!skill || !skill.id) {
      console.error('Cannot edit: skill missing id', skill);
      this.error = 'Cannot edit: skill ID missing';
      return;
    }
    this.editingId = skill.id;
    this.skillForm.patchValue({
      name: skill.name,
      category: skill.category,
      percentage: skill.percentage,
    });
    this.isFormVisible = true;
    this.success = null;
    this.error = null;
    this.cdr.detectChanges(); // ensure form shows
  }

  saveSkill(): void {
    if (!this.skillForm.valid) {
      this.error = 'Please fill in all required fields correctly';
      return;
    }

    const skillData: Skill = this.skillForm.value;
    this.loading = true;
    this.error = null;

    const operation$ = this.editingId
      ? this.skillsService.updateSkill(this.editingId, skillData)
      : this.skillsService.createSkill(skillData);

    operation$
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          console.log('✅ Skill saved successfully');
          this.success = this.editingId ? 'Skill updated successfully!' : 'Skill created successfully!';
          this.loadSkills();
          this.cancelForm();
          this.showSuccessMessage();
        },
        error: (err) => {
          console.error('❌ Error saving skill:', err);
          this.error = 'Failed to save skill: ' + (err?.error?.message || 'Unknown error');
          this.cdr.detectChanges();
        },
      });
  }

  deleteSkill(id: string | undefined): void {
    if (!id) return;
    
    if (confirm('Are you sure you want to delete this skill?')) {
      console.log('🗑️ Deleting skill:', id);
      this.loading = true;

      this.skillsService
        .deleteSkill(id)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => {
            this.loading = false;
            this.cdr.detectChanges();
          })
        )
        .subscribe({
          next: () => {
            console.log('✅ Skill deleted successfully');
            this.success = 'Skill deleted successfully!';
            this.loadSkills();
            this.showSuccessMessage();
          },
          error: (err) => {
            console.error('❌ Error deleting skill:', err);
            this.error = 'Failed to delete skill: ' + (err?.error?.message || 'Unknown error');
            this.cdr.detectChanges();
          },
        });
    }
  }

  cancelForm(): void {
    this.isFormVisible = false;
    this.editingId = null;
    this.skillForm.reset({ name: '', category: 'Frontend', percentage: 50 });
    this.cdr.detectChanges();
  }

  refreshSkills(): void {
    this.currentPage = 1;
    this.searchQuery = '';
    this.selectedCategory = '';
    this.loadSkills();
  }

  private showSuccessMessage(): void {
    setTimeout(() => {
      this.success = null;
      this.cdr.detectChanges();
    }, 3000);
  }

  isFormValid(): boolean {
    return this.skillForm.valid;
  }

  isEditing(): boolean {
    return this.editingId !== null;
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  trackBySkillId(index: number, skill: Skill): string {
    return skill.id || index.toString();
  }
}