const express = require('express');
const Progress = require('../models/Progress');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all progress for current user
router.get('/', auth, async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user._id });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching progress', error: error.message });
  }
});

// Get progress for a specific module
router.get('/module/:moduleId', auth, async (req, res) => {
  try {
    const progress = await Progress.findOne({ 
      userId: req.user._id,
      moduleId: req.params.moduleId 
    });
    
    if (!progress) {
      return res.json({
        moduleId: req.params.moduleId,
        userId: req.user._id,
        completed: false,
        progress: 0,
        exercises: []
      });
    }
    
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching module progress', error: error.message });
  }
});

// Create or update module progress
router.post('/module/:moduleId', auth, async (req, res) => {
  try {
    const { completed, progress, exercises } = req.body;
    
    // Find and update, or create if doesn't exist
    const updatedProgress = await Progress.findOneAndUpdate(
      { userId: req.user._id, moduleId: req.params.moduleId },
      {
        $set: {
          completed: completed || false,
          progress: progress || 0,
          lastAccessed: Date.now(),
          ...(completed ? { completedAt: Date.now() } : {})
        },
        $setOnInsert: {
          userId: req.user._id,
          moduleId: req.params.moduleId,
          startedAt: Date.now()
        }
      },
      { 
        new: true, 
        upsert: true 
      }
    );
    
    res.json(updatedProgress);
  } catch (error) {
    res.status(400).json({ message: 'Error updating module progress', error: error.message });
  }
});

// Update exercise progress within a module
router.post('/module/:moduleId/exercise/:exerciseId', auth, async (req, res) => {
  try {
    const { completed, completedSteps } = req.body;
    const moduleId = req.params.moduleId;
    const exerciseId = req.params.exerciseId;
    
    // Find the module progress or create if it doesn't exist
    let moduleProgress = await Progress.findOne({
      userId: req.user._id,
      moduleId
    });
    
    if (!moduleProgress) {
      moduleProgress = new Progress({
        userId: req.user._id,
        moduleId,
        exercises: []
      });
    }
    
    // Add new exercise progress entry if it doesn't exist yet
    const addExerciseIfMissing = (exerciseId) => {
      if (!moduleProgress.exercises.some(ex => ex.exerciseId === exerciseId)) {
        moduleProgress.exercises.push({
          exerciseId,
          completed: false,
          completedSteps: [],
          startedAt: Date.now()
        });
      }
    };
    
    // If this is a new exercise being tracked, add it
    addExerciseIfMissing(exerciseId);
    
    // Find the exercise in the progress
    const exerciseIndex = moduleProgress.exercises.findIndex(ex => ex.exerciseId === exerciseId);
    
    if (exerciseIndex >= 0) {
      // Update existing exercise
      moduleProgress.exercises[exerciseIndex].completed = completed || moduleProgress.exercises[exerciseIndex].completed;
      
      if (completedSteps) {
        moduleProgress.exercises[exerciseIndex].completedSteps = completedSteps;
      }
      
      if (completed && !moduleProgress.exercises[exerciseIndex].completedAt) {
        moduleProgress.exercises[exerciseIndex].completedAt = Date.now();
      }
    }
    
    // Calculate overall progress percentage
    if (moduleProgress.exercises.length > 0) {
      const totalExercises = moduleProgress.exercises.length;
      const completedExercises = moduleProgress.exercises.filter(ex => ex.completed).length;
      
      // Calculate progress based on completed exercises (1 of 2 = 50%)
      moduleProgress.progress = Math.round((completedExercises / totalExercises) * 100);
      
      // If all exercises are completed, mark the module as completed
      if (completedExercises === totalExercises) {
        moduleProgress.completed = true;
        moduleProgress.completedAt = Date.now();
      } else if (completedExercises > 0) {
        // Module is partially completed
        moduleProgress.completed = false;
        moduleProgress.completedAt = null;
      }
    }
    
    moduleProgress.lastAccessed = Date.now();
    await moduleProgress.save();
    
    res.json(moduleProgress);
  } catch (error) {
    res.status(400).json({ message: 'Error updating exercise progress', error: error.message });
  }
});

module.exports = router; 