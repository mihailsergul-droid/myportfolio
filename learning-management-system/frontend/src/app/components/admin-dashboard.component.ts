import { Component, OnInit } from '@angular/core';
import { AdminService } from '../services/admin.service';
import { CourseService } from '../services/course.service';

@Component({
  selector: 'app-admin-dashboard',
  template: `
    <div class="admin-dashboard">
      <div class="admin-header">
        <h1>Административная панель</h1>
        <div class="admin-stats">
          <div class="stat-card">
            <i class="fas fa-users"></i>
            <div class="stat-info">
              <span class="stat-number">{{ stats.totalStudents }}</span>
              <span class="stat-label">Студентов</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-book"></i>
            <div class="stat-info">
              <span class="stat-number">{{ stats.totalCourses }}</span>
              <span class="stat-label">Курсов</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-chart-line"></i>
            <div class="stat-info">
              <span class="stat-number">{{ stats.completionRate }}%</span>
              <span class="stat-label">Завершено</span>
            </div>
          </div>
        </div>
      </div>

      <div class="admin-tabs">
        <button *ngFor="let tab of tabs" 
                [class.active]="activeTab === tab.id"
                (click)="setActiveTab(tab.id)"
                class="tab-button">
          <i [class]="tab.icon"></i>
          {{ tab.label }}
        </button>
      </div>

      <div class="admin-content">
        <!-- Course Management -->
        <div *ngIf="activeTab === 'courses'" class="tab-content">
          <div class="content-header">
            <h2>Управление курсами</h2>
            <button (click)="openCourseModal()" class="btn btn-primary">
              <i class="fas fa-plus"></i> Создать курс
            </button>
          </div>
          
          <div class="courses-grid">
            <div *ngFor="let course of courses" class="course-admin-card">
              <div class="course-header">
                <h3>{{ course.title }}</h3>
                <div class="course-actions">
                  <button (click)="editCourse(course)" class="btn btn-sm btn-warning">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button (click)="deleteCourse(course)" class="btn btn-sm btn-danger">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <p>{{ course.description }}</p>
              <div class="course-stats">
                <span>Студентов: {{ course.enrolledCount }}</span>
                <span>Уроков: {{ course.lessonsCount }}</span>
                <span>Рейтинг: {{ course.rating }}/5</span>
              </div>
            </div>
          </div>
        </div>

        <!-- User Management -->
        <div *ngIf="activeTab === 'users'" class="tab-content">
          <div class="content-header">
            <h2>Управление пользователями</h2>
            <div class="search-bar">
              <input [(ngModel)]="userSearchTerm" 
                     placeholder="Поиск пользователей..."
                     class="search-input">
            </div>
          </div>
          
          <div class="users-table">
            <table>
              <thead>
                <tr>
                  <th>Имя</th>
                  <th>Email</th>
                  <th>Роль</th>
                  <th>Курсы</th>
                  <th>Прогресс</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of filteredUsers">
                  <td>{{ user.name }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span [class]="'role-badge role-' + user.role.toLowerCase()">
                      {{ user.role }}
                    </span>
                  </td>
                  <td>{{ user.enrolledCourses }}</td>
                  <td>
                    <div class="progress-bar">
                      <div class="progress-fill" [style.width.%]="user.overallProgress"></div>
                    </div>
                    {{ user.overallProgress }}%
                  </td>
                  <td>
                    <button (click)="viewUserDetails(user)" class="btn btn-sm btn-info">
                      <i class="fas fa-eye"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Analytics -->
        <div *ngIf="activeTab === 'analytics'" class="tab-content">
          <div class="content-header">
            <h2>Аналитика и отчеты</h2>
          </div>
          
          <div class="analytics-grid">
            <div class="analytics-card">
              <h3>Популярные курсы</h3>
              <div class="chart-container">
                <canvas #popularCoursesChart></canvas>
              </div>
            </div>
            
            <div class="analytics-card">
              <h3>Активность студентов</h3>
              <div class="chart-container">
                <canvas #studentActivityChart></canvas>
              </div>
            </div>
            
            <div class="analytics-card">
              <h3>Статистика завершения</h3>
              <div class="completion-stats">
                <div *ngFor="let stat of completionStats" class="completion-item">
                  <span class="course-name">{{ stat.courseName }}</span>
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="stat.completionRate"></div>
                  </div>
                  <span class="percentage">{{ stat.completionRate }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Settings -->
        <div *ngIf="activeTab === 'settings'" class="tab-content">
          <div class="content-header">
            <h2>Настройки системы</h2>
          </div>
          
          <div class="settings-grid">
            <div class="settings-card">
              <h3>Общие настройки</h3>
              <form (ngSubmit)="saveGeneralSettings()">
                <div class="form-group">
                  <label>Название платформы</label>
                  <input [(ngModel)]="settings.platformName" name="platformName" class="form-control">
                </div>
                <div class="form-group">
                  <label>Email администратора</label>
                  <input [(ngModel)]="settings.adminEmail" name="adminEmail" type="email" class="form-control">
                </div>
                <div class="form-group">
                  <label>
                    <input [(ngModel)]="settings.allowRegistration" name="allowRegistration" type="checkbox">
                    Разрешить регистрацию новых пользователей
                  </label>
                </div>
                <button type="submit" class="btn btn-primary">Сохранить</button>
              </form>
            </div>
            
            <div class="settings-card">
              <h3>Уведомления</h3>
              <form (ngSubmit)="saveNotificationSettings()">
                <div class="form-group">
                  <label>
                    <input [(ngModel)]="settings.emailNotifications" name="emailNotifications" type="checkbox">
                    Email уведомления
                  </label>
                </div>
                <div class="form-group">
                  <label>
                    <input [(ngModel)]="settings.pushNotifications" name="pushNotifications" type="checkbox">
                    Push уведомления
                  </label>
                </div>
                <div class="form-group">
                  <label>
                    <input [(ngModel)]="settings.weeklyReports" name="weeklyReports" type="checkbox">
                    Еженедельные отчеты
                  </label>
                </div>
                <button type="submit" class="btn btn-primary">Сохранить</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      padding: 2rem;
      background: #f8f9fa;
      min-height: 100vh;
    }
    
    .admin-header {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .admin-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 2rem;
    }
    
    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border-radius: 10px;
    }
    
    .stat-card i {
      font-size: 2rem;
    }
    
    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      display: block;
    }
    
    .stat-label {
      font-size: 0.9rem;
      opacity: 0.9;
    }
    
    .admin-tabs {
      display: flex;
      background: white;
      border-radius: 10px;
      padding: 0.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .tab-button {
      flex: 1;
      padding: 1rem;
      border: none;
      background: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    
    .tab-button:hover {
      background: #f8f9fa;
    }
    
    .tab-button.active {
      background: #667eea;
      color: white;
    }
    
    .admin-content {
      background: white;
      border-radius: 10px;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .content-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #f8f9fa;
    }
    
    .courses-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    
    .course-admin-card {
      border: 1px solid #e9ecef;
      border-radius: 10px;
      padding: 1.5rem;
      transition: transform 0.3s ease;
    }
    
    .course-admin-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    }
    
    .course-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .course-actions {
      display: flex;
      gap: 0.5rem;
    }
    
    .course-stats {
      display: flex;
      justify-content: space-between;
      margin-top: 1rem;
      font-size: 0.9rem;
      color: #6c757d;
    }
    
    .users-table {
      overflow-x: auto;
    }
    
    .users-table table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .users-table th,
    .users-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #e9ecef;
    }
    
    .users-table th {
      background: #f8f9fa;
      font-weight: 600;
    }
    
    .role-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
    }
    
    .role-student {
      background: #d4edda;
      color: #155724;
    }
    
    .role-instructor {
      background: #d1ecf1;
      color: #0c5460;
    }
    
    .progress-bar {
      width: 100px;
      height: 8px;
      background: #e9ecef;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea, #764ba2);
      transition: width 0.3s ease;
    }
    
    .analytics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
    }
    
    .analytics-card {
      border: 1px solid #e9ecef;
      border-radius: 10px;
      padding: 1.5rem;
    }
    
    .chart-container {
      height: 300px;
      margin-top: 1rem;
    }
    
    .completion-stats {
      margin-top: 1rem;
    }
    
    .completion-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    
    .course-name {
      flex: 1;
      font-weight: 500;
    }
    
    .percentage {
      min-width: 50px;
      text-align: right;
      font-weight: 600;
    }
    
    .settings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
    }
    
    .settings-card {
      border: 1px solid #e9ecef;
      border-radius: 10px;
      padding: 1.5rem;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ced4da;
      border-radius: 5px;
      font-size: 1rem;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.25);
    }
    
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.3s ease;
    }
    
    .btn-primary {
      background: #667eea;
      color: white;
    }
    
    .btn-primary:hover {
      background: #5a67d8;
    }
    
    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
    }
    
    .btn-warning {
      background: #f6ad55;
      color: white;
    }
    
    .btn-danger {
      background: #fc8181;
      color: white;
    }
    
    .btn-info {
      background: #63b3ed;
      color: white;
    }
    
    .search-input {
      width: 300px;
      padding: 0.75rem;
      border: 1px solid #ced4da;
      border-radius: 5px;
      font-size: 1rem;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  activeTab = 'courses';
  userSearchTerm = '';
  
  tabs = [
    { id: 'courses', label: 'Курсы', icon: 'fas fa-book' },
    { id: 'users', label: 'Пользователи', icon: 'fas fa-users' },
    { id: 'analytics', label: 'Аналитика', icon: 'fas fa-chart-bar' },
    { id: 'settings', label: 'Настройки', icon: 'fas fa-cog' }
  ];
  
  stats = {
    totalStudents: 0,
    totalCourses: 0,
    completionRate: 0
  };
  
  courses: any[] = [];
  users: any[] = [];
  completionStats: any[] = [];
  
  settings = {
    platformName: 'LMS Platform',
    adminEmail: 'admin@lms.com',
    allowRegistration: true,
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true
  };

  constructor(
    private adminService: AdminService,
    private courseService: CourseService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  get filteredUsers() {
    if (!this.userSearchTerm) return this.users;
    return this.users.filter(user => 
      user.name.toLowerCase().includes(this.userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(this.userSearchTerm.toLowerCase())
    );
  }

  setActiveTab(tabId: string) {
    this.activeTab = tabId;
  }

  loadDashboardData() {
    this.adminService.getDashboardStats().subscribe(stats => {
      this.stats = stats;
    });
    
    this.courseService.getAllCourses().subscribe(courses => {
      this.courses = courses;
    });
    
    this.adminService.getAllUsers().subscribe(users => {
      this.users = users;
    });
  }

  openCourseModal() {
    // Open course creation modal
  }

  editCourse(course: any) {
    // Open course edit modal
  }

  deleteCourse(course: any) {
    if (confirm(`Удалить курс "${course.title}"?`)) {
      this.courseService.deleteCourse(course.id).subscribe(() => {
        this.loadDashboardData();
      });
    }
  }

  viewUserDetails(user: any) {
    // Open user details modal
  }

  saveGeneralSettings() {
    this.adminService.updateSettings(this.settings).subscribe(() => {
      alert('Настройки сохранены!');
    });
  }

  saveNotificationSettings() {
    this.adminService.updateSettings(this.settings).subscribe(() => {
      alert('Настройки уведомлений сохранены!');
    });
  }
}