import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <nav class="navbar" *ngIf="authService.isAuthenticated()">
        <div class="nav-brand">
          <h2>{{ 'LMS_TITLE' | translate }}</h2>
        </div>
        <div class="nav-menu">
          <a routerLink="/dashboard" routerLinkActive="active">{{ 'DASHBOARD' | translate }}</a>
          <a routerLink="/courses" routerLinkActive="active">{{ 'COURSES' | translate }}</a>
          <a routerLink="/progress" routerLinkActive="active">{{ 'PROGRESS' | translate }}</a>
          <a routerLink="/certificates" routerLinkActive="active">{{ 'CERTIFICATES' | translate }}</a>
          <div class="language-selector">
            <select (change)="changeLanguage($event)">
              <option value="en">English</option>
              <option value="ru">Русский</option>
              <option value="es">Español</option>
            </select>
          </div>
          <button (click)="logout()" class="logout-btn">{{ 'LOGOUT' | translate }}</button>
        </div>
      </nav>
      
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container { min-height: 100vh; background: #f5f7fa; }
    .navbar { 
      background: #2c3e50; 
      color: white; 
      padding: 1rem 2rem; 
      display: flex; 
      justify-content: space-between; 
      align-items: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .nav-brand h2 { margin: 0; color: #3498db; }
    .nav-menu { 
      display: flex; 
      gap: 2rem; 
      align-items: center; 
    }
    .nav-menu a { 
      color: white; 
      text-decoration: none; 
      padding: 0.5rem 1rem; 
      border-radius: 5px; 
      transition: background 0.3s;
    }
    .nav-menu a:hover, .nav-menu a.active { background: #3498db; }
    .language-selector select {
      padding: 0.5rem;
      border-radius: 5px;
      border: none;
      background: #34495e;
      color: white;
    }
    .logout-btn { 
      background: #e74c3c; 
      color: white; 
      border: none; 
      padding: 0.5rem 1rem; 
      border-radius: 5px; 
      cursor: pointer;
    }
    .main-content { padding: 2rem; }
  `]
})
export class AppComponent implements OnInit {
  constructor(
    public authService: AuthService,
    private translate: TranslateService
  ) {
    translate.setDefaultLang('en');
  }

  ngOnInit() {
    const savedLang = localStorage.getItem('language') || 'en';
    this.translate.use(savedLang);
  }

  changeLanguage(event: any) {
    const language = event.target.value;
    this.translate.use(language);
    localStorage.setItem('language', language);
  }

  logout() {
    this.authService.logout();
  }
}