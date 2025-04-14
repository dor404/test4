const mongoose = require('mongoose');

// Schema for an individual exercise progress
const exerciseProgressSchema = new mongoose.Schema({
  exerciseId: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedSteps: {
    type: [Number],
    default: []
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
});

// Schema for module progress
const moduleProgressSchema = new mongoose.Schema({
  moduleId: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  exercises: [exerciseProgressSchema],
  startedAt: {
    type: Date,
    default: Date.now
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
}, {
  timestamps: true
});

// Create a compound index to ensure a user can't have duplicate progress entries for the same module
moduleProgressSchema.index({ userId: 1, moduleId: 1 }, { unique: true });

const Progress = mongoose.model('Progress', moduleProgressSchema);

module.exports = Progress; 