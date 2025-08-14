const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    default: 'student'
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  dateOfBirth: Date,
  phone: String,
  address: {
    street: String,
    city: String,
    country: String,
    zipCode: String
  },
  preferences: {
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    }
  },
  socialLinks: {
    linkedin: String,
    github: String,
    twitter: String,
    website: String
  },
  skills: [String],
  interests: [String],
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLoginAt: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'premium', 'enterprise'],
      default: 'free'
    },
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: false
    }
  },
  achievements: [{
    title: String,
    description: String,
    icon: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  certificates: [{
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    certificateId: String,
    issuedAt: {
      type: Date,
      default: Date.now
    },
    score: Number
  }],
  learningStreak: {
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
  totalStudyTime: {
    type: Number,
    default: 0 // in minutes
  },
  completedCourses: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ 'subscription.plan': 1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
    };
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1
    }
  });
};

// Method to update learning streak
userSchema.methods.updateLearningStreak = function() {
  const today = new Date();
  const lastStudy = this.learningStreak.lastStudyDate;
  
  if (!lastStudy) {
    // First time studying
    this.learningStreak.current = 1;
    this.learningStreak.lastStudyDate = today;
  } else {
    const daysDiff = Math.floor((today - lastStudy) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      // Consecutive day
      this.learningStreak.current += 1;
      this.learningStreak.lastStudyDate = today;
      
      if (this.learningStreak.current > this.learningStreak.longest) {
        this.learningStreak.longest = this.learningStreak.current;
      }
    } else if (daysDiff > 1) {
      // Streak broken
      this.learningStreak.current = 1;
      this.learningStreak.lastStudyDate = today;
    }
    // If daysDiff === 0, same day, no change needed
  }
  
  return this.save();
};

// Method to add achievement
userSchema.methods.addAchievement = function(achievement) {
  // Check if achievement already exists
  const exists = this.achievements.some(a => a.title === achievement.title);
  if (!exists) {
    this.achievements.push(achievement);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to add certificate
userSchema.methods.addCertificate = function(courseId, score) {
  const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  this.certificates.push({
    courseId,
    certificateId,
    score,
    issuedAt: new Date()
  });
  
  return this.save();
};

// Static method to find users by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Static method to get user statistics
userSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        avgStudyTime: { $avg: '$totalStudyTime' },
        avgCompletedCourses: { $avg: '$completedCourses' }
      }
    }
  ]);
  
  const totalUsers = await this.countDocuments({ isActive: true });
  const premiumUsers = await this.countDocuments({ 
    'subscription.plan': { $in: ['premium', 'enterprise'] },
    'subscription.isActive': true 
  });
  
  return {
    roleStats: stats,
    totalUsers,
    premiumUsers,
    freeUsers: totalUsers - premiumUsers
  };
};

module.exports = mongoose.model('User', userSchema);