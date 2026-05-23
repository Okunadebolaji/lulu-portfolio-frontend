import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  
  private themeSubject = new BehaviorSubject<Theme>('light');
  public theme$: Observable<Theme> = this.themeSubject.asObservable();
  
  private readonly THEME_KEY = 'theme_preference';

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeTheme();
    }
  }

  /**
   * Initialize theme from localStorage or system preference
   */
  private initializeTheme(): void {
    // ✅ Check localStorage first
    const savedTheme = this.getThemeFromStorage();
    if (savedTheme) {
      this.setTheme(savedTheme);
      return;
    }

    // ✅ Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const systemTheme: Theme = prefersDark ? 'dark' : 'light';
    this.setTheme(systemTheme);
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): Theme {
    return this.themeSubject.value;
  }

  /**
   * Toggle between light and dark theme
   */
  toggleTheme(): void {
    const newTheme: Theme = this.getCurrentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Set specific theme
   */
  setTheme(theme: Theme): void {
    this.themeSubject.next(theme);
    this.applyTheme(theme);
    this.saveThemeToStorage(theme);
  }

  /**
   * Apply theme to DOM
   * Sets both data-theme attribute and body classes for maximum compatibility
   */
  private applyTheme(theme: Theme): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    
    if (theme === 'dark') {
      htmlElement.setAttribute('data-theme', 'dark');
      bodyElement.classList.remove('light-theme');
      bodyElement.classList.add('dark-theme');
      console.log('✅ Theme applied: dark');
    } else {
      htmlElement.setAttribute('data-theme', 'light');
      bodyElement.classList.remove('dark-theme');
      bodyElement.classList.add('light-theme');
      console.log('✅ Theme applied: light');
    }
  }

  /**
   * Save theme preference to localStorage
   */
  private saveThemeToStorage(theme: Theme): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.THEME_KEY, theme);
    }
  }

  /**
   * Get theme preference from localStorage
   */
  private getThemeFromStorage(): Theme | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const saved = localStorage.getItem(this.THEME_KEY);
    return saved === 'dark' || saved === 'light' ? saved : null;
  }

  /**
   * Check if dark theme is active
   */
  isDarkMode(): boolean {
    return this.getCurrentTheme() === 'dark';
  }
}