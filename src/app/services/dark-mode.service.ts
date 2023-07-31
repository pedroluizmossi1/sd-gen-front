// theme.service.ts
import { Injectable, HostListener } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkMode: boolean = false;

  constructor() {
    this.detectThemePreference();
  }

  @HostListener('window:scroll', [])
  private detectThemePreference() {
    this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.applyTheme();
  }

  private applyTheme() {
    if (this.isDarkMode) {
      // Definir as variáveis do tema escuro
      document.documentElement.style.setProperty('--background-color', '#111111');
      document.documentElement.style.setProperty('--text-color', '#ffffff');
    } else {
      // Definir as variáveis do tema claro
      document.documentElement.style.setProperty('--background-color', '#ffffff');
      document.documentElement.style.setProperty('--text-color', '#333333');
    }
  }

  public setDarkMode(isDarkMode: boolean) {
    this.isDarkMode = isDarkMode;
    this.applyTheme();
  }
}
