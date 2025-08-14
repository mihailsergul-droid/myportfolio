const mongoose = require('mongoose');

const lessonProgressSchema = new mongoose.Schema({
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  watchTime: {
    type: Number,
    default: 0 // in seconds
  },
  totalDuration: {
    type: Number,
    default: 0 // in seconds
  },
  watchPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  bookmarks: [{
    time: Number, // in seconds
    note: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: [{
    content: String,
    timestamp: Number, // video timestamp in seconds
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  quizAttempts: [{
    attemptedAt: {
      type: Date,
      default: Date.now
    },
    score: Number,
    totalQuestions: Number,
    correctAnswers: Number,
    answers: [{
      questionId: String,
      selectedAnswer: Number,
      isCorrect: Boolean,
      timeSpent: Number // in seconds
    }],
    timeSpent: Number, // total time in seconds
    isPassed: Boolean
  }],
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
});

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  startedAt: Date,
  completedAt: Date,
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  studyTime: {
    type: Number,
    default: 0 // total study time in minutes
  },
  lessonsProgress: [lessonProgressSchema],
  overallQuizScore: {
    type: Number,
    default: 0
  },
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateId: String,
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    ratedAt: Date
  },
  studyStreak: {
    current: {
      type: Number,
      default: 0
    },
    longest: {
      type: Number,
      default: 0
    },
    lastStudyDate: Date
  },
  achievements: [{
    type: {
      type: String,
      enum: ['first_lesson', 'half_complete', 'course_complete', 'perfect_quiz', 'speed_learner', 'consistent_learner']
    },
    earnedAt: {
      type: Date,
      default: Date.now
    },
    metadata: mongoose.Schema.Types.Mixed
  }],
  studySessions: [{
    startTime: Date,
    endTime: Date,
    duration: Number, // in minutes
    lessonsStudied: [mongoose.Schema.Types.ObjectId],
    activitiesCompleted: Number
  }],
  preferences: {
    playbackSpeed: {
      type: Number,
      default: 1.0,
      min: 0.5,
      max: 2.0
    },
    autoplay: {
      type: Boolean,
      default: true
    },
    subtitles: {
      type: Boolean,
      default: false
    },
    language: {
      type: String,
      default: 'en'
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
progressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
progressSchema.index({ userId: 1 });
progressSchema.index({ courseId: 1 });
progressSchema.index({ completionPercentage: 1 });
progressSchema.index({ isCompleted: 1 });
progressSchema.index({ lastAccessedAt: 1 });

// Virtual for average quiz score
progressSchema.virtual('averageQuizScore').get(function() {
  const allAttempts = this.lessonsProgress.reduce((acc, lesson) => {
    return acc.concat(lesson.quizAttempts);
  }, []);
  
  if (allAttempts.length === 0) return 0;
  
  const totalScore = allAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
  return Math.round(totalScore / allAttempts.length);
});

// Virtual for total lessons completed
progressSchema.virtual('completedLessonsCount').get(function() {
  return this.lessonsProgress.filter(lesson => lesson.isCompleted).length;
});

// Virtual for total watch time
progressSchema.virtual('totalWatchTime').get(function() {
  return this.lessonsProgress.reduce((total, lesson) => total + lesson.watchTime, 0);
});

// Method to update lesson progress
progressSchema.methods.updateLessonProgress = function(lessonId, progressData) {
  let lessonProgress = this.lessonsProgress.find(lp => lp.lessonId.toString() === lessonId.toString());
  
  if (!lessonProgress) {
    lessonProgress = {
      lessonId,
      watchTime: 0,
      totalDuration: progressData.totalDuration || 0,
      watchPercentage: 0,
      bookmarks: [],
      notes: [],
      quizAttempts: []
    };
    this.lessonsProgress.push(lessonProgress);
    lessonProgress = this.lessonsProgress[this.lessonsProgress.length - 1];
  }
  
  // Update progress data
  if (progressData.watchTime !== undefined) {
    lessonProgress.watchTime = Math.max(lessonProgress.watchTime, progressData.watchTime);
  }
  
  if (progressData.totalDuration !== undefined) {
    lessonProgress.totalDuration = progressData.totalDuration;
  }
  
  // Calculate watch percentage
  if (lessonProgress.totalDuration > 0) {
    lessonProgress.watchPercentage = Math.min(100, (lessonProgress.watchTime / lessonProgress.totalDuration) * 100);
  }
  
  // Mark as completed if watched 90% or more
  if (lessonProgress.watchPercentage >= 90 && !lessonProgress.isCompleted) {
    lessonProgress.isCompleted = true;
    lessonProgress.completedAt = new Date();
  }
  
  lessonProgress.lastAccessedAt = new Date();
  this.lastAccessedAt = new Date();
  
  // Update overall progress
  this.updateOverallProgress();
  
  return this.save();
};

// Method to add bookmark
progressSchema.methods.addBookmark = function(lessonId, time, note) {
  let lessonProgress = this.lessonsProgress.find(lp => lp.lessonId.toString() === lessonId.toString());
  
  if (!lessonProgress) {
    lessonProgress = {
      lessonId,
      watchTime: 0,
      totalDuration: 0,
      watchPercentage: 0,
      bookmarks: [],
      notes: [],
      quizAttempts: []
    };
    this.lessonsProgress.push(lessonProgress);
    lessonProgress = this.lessonsProgress[this.lessonsProgress.length - 1];
  }
  
  lessonProgress.bookmarks.push({
    time,
    note,
    createdAt: new Date()
  });
  
  return this.save();
};

// Method to add note
progressSchema.methods.addNote = function(lessonId, content, timestamp) {
  let lessonProgress = this.lessonsProgress.find(lp => lp.lessonId.toString() === lessonId.toString());
  
  if (!lessonProgress) {
    lessonProgress = {
      lessonId,
      watchTime: 0,
      totalDuration: 0,
      watchPercentage: 0,
      bookmarks: [],
      notes: [],
      quizAttempts: []
    };
    this.lessonsProgress.push(lessonProgress);
    lessonProgress = this.lessonsProgress[this.lessonsProgress.length - 1];
  }
  
  lessonProgress.notes.push({
    content,
    timestamp,
    createdAt: new Date()
  });
  
  return this.save();
};

// Method to record quiz attempt
progressSchema.methods.recordQuizAttempt = function(lessonId, quizData) {
  let lessonProgress = this.lessonsProgress.find(lp => lp.lessonId.toString() === lessonId.toString());
  
  if (!lessonProgress) {
    lessonProgress = {
      lessonId,
      watchTime: 0,
      totalDuration: 0,
      watchPercentage: 0,
      bookmarks: [],
      notes: [],
      quizAttempts: []
    };
    this.lessonsProgress.push(lessonProgress);
    lessonProgress = this.lessonsProgress[this.lessonsProgress.length - 1];
  }
  
  const attempt = {
    score: quizData.score,
    totalQuestions: quizData.totalQuestions,
    correctAnswers: quizData.correctAnswers,
    answers: quizData.answers,
    timeSpent: quizData.timeSpent,
    isPassed: quizData.score >= 70, // 70% passing score
    attemptedAt: new Date()
  };
  
  lessonProgress.quizAttempts.push(attempt);
  
  // Update overall quiz score
  this.updateOverallQuizScore();
  
  return this.save();
};

// Method to update overall progress
progressSchema.methods.updateOverallProgress = function() {
  if (this.lessonsProgress.length === 0) {
    this.completionPercentage = 0;
    return;
  }
  
  const completedLessons = this.lessonsProgress.filter(lp => lp.isCompleted).length;
  this.completionPercentage = Math.round((completedLessons / this.lessonsProgress.length) * 100);
  
  // Mark course as completed if all lessons are done
  if (this.completionPercentage === 100 && !this.isCompleted) {
    this.isCompleted = true;
    this.completedAt = new Date();
  }
};

// Method to update overall quiz score
progressSchema.methods.updateOverallQuizScore = function() {
  const allAttempts = this.lessonsProgress.reduce((acc, lesson) => {
    return acc.concat(lesson.quizAttempts);
  }, []);
  
  if (allAttempts.length === 0) {
    this.overallQuizScore = 0;
    return;
  }
  
  const totalScore = allAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
  this.overallQuizScore = Math.round(totalScore / allAttempts.length);
};

// Method to start study session
progressSchema.methods.startStudySession = function() {
  const session = {
    startTime: new Date(),
    lessonsStudied: [],
    activitiesCompleted: 0
  };
  
  this.studySessions.push(session);
  
  if (!this.startedAt) {
    this.startedAt = new Date();
  }
  
  return this.save();
};

// Method to end study session
progressSchema.methods.endStudySession = function(lessonsStudied = [], activitiesCompleted = 0) {
  const currentSession = this.studySessions[this.studySessions.length - 1];
  
  if (currentSession && !currentSession.endTime) {
    currentSession.endTime = new Date();
    currentSession.duration = Math.round((currentSession.endTime - currentSession.startTime) / (1000 * 60)); // in minutes
    currentSession.lessonsStudied = lessonsStudied;
    currentSession.activitiesCompleted = activitiesCompleted;
    
    // Update total study time
    this.studyTime += currentSession.duration;
  }
  
  return this.save();
};

// Method to add achievement
progressSchema.methods.addAchievement = function(type, metadata = {}) {
  // Check if achievement already exists
  const exists = this.achievements.some(a => a.type === type);
  if (!exists) {
    this.achievements.push({
      type,
      metadata,
      earnedAt: new Date()
    });
  }
  
  return this.save();
};

// Static method to get course statistics
progressSchema.statics.getCourseStats = async function(courseId) {
  const stats = await this.aggregate([
    { $match: { courseId: mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: null,
        totalEnrollments: { $sum: 1 },
        completedCount: {
          $sum: { $cond: [{ $eq: ['$isCompleted', true] }, 1, 0] }
        },
        avgCompletionPercentage: { $avg: '$completionPercentage' },
        avgQuizScore: { $avg: '$overallQuizScore' },
        totalStudyTime: { $sum: '$studyTime' }
      }
    }
  ]);
  
  return stats.length > 0 ? stats[0] : {
    totalEnrollments: 0,
    completedCount: 0,
    avgCompletionPercentage: 0,
    avgQuizScore: 0,
    totalStudyTime: 0
  };
};

// Static method to get user learning analytics
progressSchema.statics.getUserAnalytics = async function(userId) {
  const analytics = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalCourses: { $sum: 1 },
        completedCourses: {
          $sum: { $cond: [{ $eq: ['$isCompleted', true] }, 1, 0] }
        },
        totalStudyTime: { $sum: '$studyTime' },
        avgCompletionPercentage: { $avg: '$completionPercentage' },
        avgQuizScore: { $avg: '$overallQuizScore' }
      }
    }
  ]);
  
  return analytics.length > 0 ? analytics[0] : {
    totalCourses: 0,
    completedCourses: 0,
    totalStudyTime: 0,
    avgCompletionPercentage: 0,
    avgQuizScore: 0
  };
};

module.exports = mongoose.model('Progress', progressSchema);