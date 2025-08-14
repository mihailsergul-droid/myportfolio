import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'app-quiz',
  template: `
    <div class="quiz-container">
      <div class="quiz-header">
        <h2>{{ quiz.title }}</h2>
        <div class="quiz-progress">
          <span>Question {{ currentQuestionIndex + 1 }} of {{ quiz.questions.length }}</span>
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="progressPercentage"></div>
          </div>
        </div>
      </div>

      <div class="question-container" *ngIf="currentQuestion">
        <h3>{{ currentQuestion.question }}</h3>
        
        <div class="answers-list">
          <div *ngFor="let answer of currentQuestion.answers; let i = index" 
               class="answer-option"
               [class.selected]="selectedAnswer === i"
               [class.correct]="showResults && answer.correct"
               [class.incorrect]="showResults && selectedAnswer === i && !answer.correct"
               (click)="selectAnswer(i)">
            <span class="answer-letter">{{ getAnswerLetter(i) }}</span>
            <span class="answer-text">{{ answer.text }}</span>
            <span *ngIf="showResults && answer.correct" class="check-mark">✓</span>
          </div>
        </div>

        <div class="question-actions">
          <button *ngIf="!showResults" 
                  (click)="submitAnswer()" 
                  [disabled]="selectedAnswer === null"
                  class="submit-btn">
            Submit Answer
          </button>
          
          <button *ngIf="showResults && !isLastQuestion()" 
                  (click)="nextQuestion()" 
                  class="next-btn">
            Next Question
          </button>
          
          <button *ngIf="showResults && isLastQuestion()" 
                  (click)="finishQuiz()" 
                  class="finish-btn">
            Finish Quiz
          </button>
        </div>

        <div *ngIf="showResults" class="explanation">
          <h4>Explanation:</h4>
          <p>{{ currentQuestion.explanation }}</p>
        </div>
      </div>

      <div *ngIf="quizCompleted" class="quiz-results">
        <h2>Quiz Completed!</h2>
        <div class="score-display">
          <div class="score-circle">
            <span class="score-percentage">{{ scorePercentage }}%</span>
          </div>
          <p>You scored {{ correctAnswers }} out of {{ quiz.questions.length }} questions correctly.</p>
        </div>
        
        <div class="results-breakdown">
          <h3>Results Breakdown:</h3>
          <div *ngFor="let question of quiz.questions; let i = index" class="result-item">
            <span class="question-number">Q{{ i + 1 }}</span>
            <span class="result-status" [class.correct]="userAnswers[i].correct" [class.incorrect]="!userAnswers[i].correct">
              {{ userAnswers[i].correct ? '✓' : '✗' }}
            </span>
            <span class="question-title">{{ question.question }}</span>
          </div>
        </div>

        <div class="quiz-actions">
          <button (click)="retakeQuiz()" class="retake-btn">Retake Quiz</button>
          <button (click)="closeQuiz()" class="close-btn">Close</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .quiz-container {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      max-width: 800px;
      margin: 0 auto;
    }
    .quiz-header {
      margin-bottom: 2rem;
      text-align: center;
    }
    .quiz-header h2 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }
    .quiz-progress {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .progress-bar {
      width: 100%;
      height: 8px;
      background: #ecf0f1;
      border-radius: 4px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #3498db, #2ecc71);
      transition: width 0.3s ease;
    }
    .question-container {
      margin-bottom: 2rem;
    }
    .question-container h3 {
      color: #2c3e50;
      margin-bottom: 1.5rem;
      font-size: 1.3rem;
    }
    .answers-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .answer-option {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border: 2px solid #ecf0f1;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .answer-option:hover {
      border-color: #3498db;
      background: #f8f9fa;
    }
    .answer-option.selected {
      border-color: #3498db;
      background: #e3f2fd;
    }
    .answer-option.correct {
      border-color: #27ae60;
      background: #d5f4e6;
    }
    .answer-option.incorrect {
      border-color: #e74c3c;
      background: #fdeaea;
    }
    .answer-letter {
      background: #3498db;
      color: white;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }
    .answer-text {
      flex: 1;
    }
    .check-mark {
      color: #27ae60;
      font-size: 1.5rem;
      font-weight: bold;
    }
    .question-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
    }
    .submit-btn, .next-btn, .finish-btn {
      background: #3498db;
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      transition: background 0.3s ease;
    }
    .submit-btn:hover, .next-btn:hover, .finish-btn:hover {
      background: #2980b9;
    }
    .submit-btn:disabled {
      background: #bdc3c7;
      cursor: not-allowed;
    }
    .explanation {
      margin-top: 2rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #3498db;
    }
    .quiz-results {
      text-align: center;
    }
    .score-display {
      margin: 2rem 0;
    }
    .score-circle {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3498db, #2ecc71);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
    }
    .score-percentage {
      color: white;
      font-size: 2rem;
      font-weight: bold;
    }
    .results-breakdown {
      margin: 2rem 0;
      text-align: left;
    }
    .result-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem;
      border-bottom: 1px solid #ecf0f1;
    }
    .question-number {
      font-weight: bold;
      color: #7f8c8d;
    }
    .result-status.correct {
      color: #27ae60;
    }
    .result-status.incorrect {
      color: #e74c3c;
    }
    .quiz-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 2rem;
    }
    .retake-btn {
      background: #f39c12;
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 6px;
      cursor: pointer;
    }
    .close-btn {
      background: #95a5a6;
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 6px;
      cursor: pointer;
    }
  `]
})
export class QuizComponent implements OnInit {
  @Input() quiz: any = {};
  @Output() quizCompleted = new EventEmitter<any>();

  currentQuestionIndex = 0;
  selectedAnswer: number | null = null;
  showResults = false;
  quizCompleted = false;
  userAnswers: any[] = [];
  correctAnswers = 0;

  get currentQuestion() {
    return this.quiz.questions[this.currentQuestionIndex];
  }

  get progressPercentage() {
    return ((this.currentQuestionIndex + 1) / this.quiz.questions.length) * 100;
  }

  get scorePercentage() {
    return Math.round((this.correctAnswers / this.quiz.questions.length) * 100);
  }

  ngOnInit() {
    this.userAnswers = new Array(this.quiz.questions.length);
  }

  selectAnswer(index: number) {
    if (!this.showResults) {
      this.selectedAnswer = index;
    }
  }

  submitAnswer() {
    if (this.selectedAnswer !== null) {
      const isCorrect = this.currentQuestion.answers[this.selectedAnswer].correct;
      this.userAnswers[this.currentQuestionIndex] = {
        questionIndex: this.currentQuestionIndex,
        selectedAnswer: this.selectedAnswer,
        correct: isCorrect
      };
      
      if (isCorrect) {
        this.correctAnswers++;
      }
      
      this.showResults = true;
    }
  }

  nextQuestion() {
    this.currentQuestionIndex++;
    this.selectedAnswer = null;
    this.showResults = false;
  }

  isLastQuestion() {
    return this.currentQuestionIndex === this.quiz.questions.length - 1;
  }

  finishQuiz() {
    this.quizCompleted = true;
    this.quizCompleted.emit({
      score: this.correctAnswers,
      total: this.quiz.questions.length,
      percentage: this.scorePercentage,
      answers: this.userAnswers
    });
  }

  retakeQuiz() {
    this.currentQuestionIndex = 0;
    this.selectedAnswer = null;
    this.showResults = false;
    this.quizCompleted = false;
    this.userAnswers = new Array(this.quiz.questions.length);
    this.correctAnswers = 0;
  }

  closeQuiz() {
    this.quizCompleted.emit(null);
  }

  getAnswerLetter(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D...
  }
}