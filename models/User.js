import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: false // Optional for OAuth users
  },
  provider: {
    type: String,
    enum: ['local', 'google', 'github'],
    default: 'local'
  },
  googleId: {
    type: String,
    required: false
  },
  githubId: {
    type: String,
    required: false
  },
  avatar: {
    type: String,
    required: false
  },
  // User progress data
  quizResults: [{
    userId: Number,
    courseKey: String,
    lessonId: String,
    quizTitle: String,
    score: Number,
    totalQuestions: Number,
    percentage: Number,
    passed: Boolean,
    date: Date,
    attemptNumber: Number
  }],
  lessonProgress: {
    type: Map,
    of: {
      completed: Boolean,
      unlocked: Boolean
    },
    default: {}
  },
  streak: {
    current: {
      type: Number,
      default: 0
    },
    lastLogin: {
      type: String,
      default: null
    }
  },
  notifications: [{
    id: Number,
    type: String,
    title: String,
    message: String,
    time: String,
    isRead: Boolean,
    iconType: String,
    lessonId: Number,
    courseKey: String
  }],
  completedCourses: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
userSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

export default mongoose.model('User', userSchema);
