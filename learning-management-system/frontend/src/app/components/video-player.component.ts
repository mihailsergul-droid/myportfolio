import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ProgressService } from '../services/progress.service';

@Component({
  selector: 'app-video-player',
  template: `
    <div class="video-player-container">
      <div class="video-wrapper">
        <video #videoPlayer 
               [src]="videoUrl" 
               controls 
               (timeupdate)="onTimeUpdate()"
               (ended)="onVideoEnded()"
               (loadedmetadata)="onVideoLoaded()">
        </video>
        
        <div class="video-controls">
          <div class="playback-speed">
            <label>Speed:</label>
            <select (change)="changeSpeed($event)">
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1" selected>1x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>
          </div>
          
          <div class="bookmark-controls">
            <button (click)="addBookmark()" class="bookmark-btn">
              Add Bookmark
            </button>
          </div>
        </div>
      </div>
      
      <div class="bookmarks-panel">
        <h3>Bookmarks</h3>
        <div class="bookmark-list">
          <div *ngFor="let bookmark of bookmarks" class="bookmark-item">
            <span class="bookmark-time" (click)="seekTo(bookmark.time)">
              {{ formatTime(bookmark.time) }}
            </span>
            <span class="bookmark-note">{{ bookmark.note }}</span>
            <button (click)="removeBookmark(bookmark)" class="remove-btn">×</button>
          </div>
        </div>
      </div>
      
      <div class="progress-bar">
        <div class="progress-fill" [style.width.%]="watchProgress"></div>
      </div>
      <p class="progress-text">Progress: {{ watchProgress.toFixed(1) }}%</p>
    </div>
  `,
  styles: [`
    .video-player-container { 
      background: white; 
      border-radius: 10px; 
      padding: 1.5rem; 
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .video-wrapper { position: relative; margin-bottom: 1rem; }
    video { 
      width: 100%; 
      max-height: 500px; 
      border-radius: 8px; 
    }
    .video-controls { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-top: 1rem; 
      padding: 1rem; 
      background: #f8f9fa; 
      border-radius: 8px;
    }
    .playback-speed select { 
      padding: 0.5rem; 
      border-radius: 5px; 
      border: 1px solid #ddd; 
    }
    .bookmark-btn { 
      background: #3498db; 
      color: white; 
      border: none; 
      padding: 0.5rem 1rem; 
      border-radius: 5px; 
      cursor: pointer;
    }
    .bookmarks-panel { 
      margin: 1rem 0; 
      padding: 1rem; 
      background: #f8f9fa; 
      border-radius: 8px;
    }
    .bookmark-item { 
      display: flex; 
      align-items: center; 
      gap: 1rem; 
      padding: 0.5rem; 
      border-bottom: 1px solid #eee;
    }
    .bookmark-time { 
      color: #3498db; 
      cursor: pointer; 
      font-weight: bold; 
    }
    .bookmark-note { flex: 1; }
    .remove-btn { 
      background: #e74c3c; 
      color: white; 
      border: none; 
      border-radius: 50%; 
      width: 25px; 
      height: 25px; 
      cursor: pointer;
    }
    .progress-bar { 
      width: 100%; 
      height: 8px; 
      background: #ecf0f1; 
      border-radius: 4px; 
      overflow: hidden; 
      margin: 1rem 0;
    }
    .progress-fill { 
      height: 100%; 
      background: linear-gradient(90deg, #3498db, #2ecc71); 
      transition: width 0.3s ease;
    }
    .progress-text { 
      text-align: center; 
      color: #7f8c8d; 
      font-weight: bold;
    }
  `]
})
export class VideoPlayerComponent implements OnInit {
  @Input() videoUrl: string = '';
  @Input() courseId: string = '';
  @Input() lessonId: string = '';
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  bookmarks: any[] = [];
  watchProgress: number = 0;
  videoDuration: number = 0;

  constructor(private progressService: ProgressService) {}

  ngOnInit() {
    this.loadBookmarks();
    this.loadProgress();
  }

  onVideoLoaded() {
    this.videoDuration = this.videoPlayer.nativeElement.duration;
  }

  onTimeUpdate() {
    const currentTime = this.videoPlayer.nativeElement.currentTime;
    this.watchProgress = (currentTime / this.videoDuration) * 100;
    
    if (Math.floor(currentTime) % 10 === 0) {
      this.saveProgress();
    }
  }

  onVideoEnded() {
    this.watchProgress = 100;
    this.saveProgress();
    this.progressService.markLessonComplete(this.courseId, this.lessonId);
  }

  changeSpeed(event: any) {
    this.videoPlayer.nativeElement.playbackRate = parseFloat(event.target.value);
  }

  addBookmark() {
    const currentTime = this.videoPlayer.nativeElement.currentTime;
    const note = prompt('Add a note for this bookmark:') || '';
    
    const bookmark = {
      id: Date.now(),
      time: currentTime,
      note: note,
      timestamp: new Date()
    };
    
    this.bookmarks.push(bookmark);
    this.saveBookmarks();
  }

  removeBookmark(bookmark: any) {
    this.bookmarks = this.bookmarks.filter(b => b.id !== bookmark.id);
    this.saveBookmarks();
  }

  seekTo(time: number) {
    this.videoPlayer.nativeElement.currentTime = time;
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  private loadBookmarks() {
    const saved = localStorage.getItem(`bookmarks_${this.lessonId}`);
    this.bookmarks = saved ? JSON.parse(saved) : [];
  }

  private saveBookmarks() {
    localStorage.setItem(`bookmarks_${this.lessonId}`, JSON.stringify(this.bookmarks));
  }

  private loadProgress() {
    const saved = localStorage.getItem(`progress_${this.lessonId}`);
    if (saved) {
      this.watchProgress = parseFloat(saved);
    }
  }

  private saveProgress() {
    localStorage.setItem(`progress_${this.lessonId}`, this.watchProgress.toString());
    this.progressService.updateProgress(this.courseId, this.lessonId, this.watchProgress);
  }
}