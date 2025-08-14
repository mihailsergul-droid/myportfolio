import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:3000/api/admin';

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  getUserDetails(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${userId}`);
  }

  updateUserRole(userId: string, role: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/role`, { role });
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`);
  }

  getCourseAnalytics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics/courses`);
  }

  getUserAnalytics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics/users`);
  }

  getSystemAnalytics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics/system`);
  }

  updateSettings(settings: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/settings`, settings);
  }

  getSettings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/settings`);
  }

  exportData(type: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/${type}`, { 
      responseType: 'blob' 
    });
  }

  sendBulkNotification(notification: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/notifications/bulk`, notification);
  }

  getSystemLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/logs`);
  }

  backupDatabase(): Observable<any> {
    return this.http.post(`${this.apiUrl}/backup`, {});
  }

  restoreDatabase(backupFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('backup', backupFile);
    return this.http.post(`${this.apiUrl}/restore`, formData);
  }
}