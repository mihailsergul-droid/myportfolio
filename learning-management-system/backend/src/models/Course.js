const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  videoUrl: String,
  duration: Number, // in seconds
  order: { type: Number, required: true },
  quiz: {
    title: String,
    questions: [{
      question: String,
      answers: [{
        text: String,
        correct: Boolean
      }],
      explanation: String
    }]
  },
  resources: [{
    title: String,
    url: String,
    type: { type: String, enum: ['pdf', 'link', 'download'] }
  }]
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructor: {
    name: String,
    email: String,
    bio: String,
    avatar: String
  },
  category: { type: String, required: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  language: { type: String, default: 'en' },
  price: { type: Number, default: 0 },
  thumbnail: String,
  lessons: [lessonSchema],
  totalDuration: Number, // calculated field
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  tags: [String],
  isPublished: { type: Boolean, default: false },
  certificate: {
    template: String,
    requirements: {
      minCompletionRate: { type: Number, default: 80 },
      minQuizScore: { type: Number, default: 70 }
    }
  }
}, {
  timestamps: true
});

// Calculate total duration before saving
courseSchema.pre('save', function(next) {
  if (this.lessons && this.lessons.length > 0) {
    this.totalDuration = this.lessons.reduce((total, lesson) => {
      return total + (lesson.duration || 0);
    }, 0);
  }
  next();
});

module.exports = mongoose.model('Course', courseSchema);