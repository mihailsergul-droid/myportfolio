import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private apiUrl = 'http://localhost:3000/api';
  private progressSubject = new BehaviorSubject<any>({});
  public progress$ = this.progressSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadProgress();
  }

  updateProgress(courseId: string, lessonId: string, progress: number): Observable<any> {
    const data = { courseId, lessonId, progress, timestamp: new Date() };
    
    const currentProgress = this.getLocalProgress();
    if (!currentProgress[courseId]) {
      currentProgress[courseId] = {};
    }
    currentProgress[courseId][lessonId] = {
      progress,
      timestamp: new Date(),
      completed: progress >= 100
    };
    
    localStorage.setItem('courseProgress', JSON.stringify(currentProgress));
    this.progressSubject.next(currentProgress);
    
    return this.http.post(`${this.apiUrl}/progress/update`, data);
  }

  markLessonComplete(courseId: string, lessonId: string): Observable<any> {
    const data = { courseId, lessonId, completed: true, completedAt: new Date() };
    
    const currentProgress = this.getLocalProgress();
    if (!currentProgress[courseId]) {
      currentProgress[courseId] = {};
    }
    currentProgress[courseId][lessonId] = {
      ...currentProgress[courseId][lessonId],
      progress: 100,
      completed: true,
      completedAt: new Date()
    };
    
    localStorage.setItem('courseProgress', JSON.stringify(currentProgress));
    this.progressSubject.next(currentProgress);
    
    return this.http.post(`${this.apiUrl}/progress/complete`, data);
  }

  getCourseProgress(courseId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/progress/course/${courseId}`);
  }

  calculateCourseCompletion(courseId: string): number {
    const progress = this.getLocalProgress();
    const courseProgress = progress[courseId];
    
    if (!courseProgress) return 0;
    
    const lessons = Object.keys(courseProgress);
    const completedLessons = lessons.filter(lessonId => 
      courseProgress[lessonId].completed
    ).length;
    
    return lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0;
  }

  private loadProgress() {
    const saved = this.getLocalProgress();
    this.progressSubject.next(saved);
  }

  private getLocalProgress(): any {
    const saved = localStorage.getItem('courseProgress');
    return saved ? JSON.parse(saved) : {};
  }
}