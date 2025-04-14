import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LightbulbOutlined as HintIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { trainingModules } from '../../data/trainingModules';
import { Exercise, ExerciseStep, ModuleProgress } from '../../types/training';
import BranchVisualization from './BranchVisualization';
import progressService from '../../services/progressService';

const ModuleViewer: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const module = trainingModules.find((m) => m.id === moduleId);

  const [activeStep, setActiveStep] = useState(0);
  const [showHints, setShowHints] = useState<boolean[]>([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [stepAnswers, setStepAnswers] = useState<string[]>([]);
  const [currentExerciseStep, setCurrentExerciseStep] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [stepFeedback, setStepFeedback] = useState<Array<{ type: 'success' | 'error'; message: string } | null>>([]);
  const [loading, setLoading] = useState(true);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [moduleProgressData, setModuleProgressData] = useState<ModuleProgress | null>(null);

  // Reset state when moduleId changes
  useEffect(() => {
    setActiveStep(0);
    setUserAnswer('');
    setStepAnswers([]);
    setCurrentExerciseStep(0);
    setFeedback(null);
    setStepFeedback([]);
    
    // Fetch module progress if moduleId is available
    if (moduleId) {
      fetchModuleProgress();
    } else {
      setLoading(false);
    }
  }, [moduleId]);

  // Fetch module progress data
  const fetchModuleProgress = async () => {
    try {
      const progressData = await progressService.getModuleProgress(moduleId || '');
      
      // Store the progress data for displaying progress
      setModuleProgressData(progressData);
      
      // Check if the progress data needs to be initialized with all exercises
      let needsUpdate = false;
      const exercisesToAdd: string[] = [];
      
      // Find exercises that exist in the module but not in progress data
      if (module && module.exercises) {
        module.exercises.forEach(exercise => {
          const existingExercise = progressData.exercises?.find(ex => ex.exerciseId === exercise.id);
          if (!existingExercise) {
            exercisesToAdd.push(exercise.id);
            needsUpdate = true;
          }
        });
      }
      
      // If we need to initialize exercises, update the progress for each missing exercise
      if (needsUpdate && exercisesToAdd.length > 0) {
        for (const exerciseId of exercisesToAdd) {
          await progressService.updateExerciseProgress(
            moduleId || '',
            exerciseId,
            { completed: false }
          );
        }
        
        // Fetch the updated progress data
        const updatedProgressData = await progressService.getModuleProgress(moduleId || '');
        setModuleProgressData(updatedProgressData);
        
        // Initialize completedExercises set from the updated progress data
        const completedExerciseIds = new Set<string>();
        if (updatedProgressData && updatedProgressData.exercises) {
          updatedProgressData.exercises.forEach(exercise => {
            if (exercise.completed) {
              completedExerciseIds.add(exercise.exerciseId);
            }
          });
        }
        
        setCompletedExercises(completedExerciseIds);
        
        // Resume progress - find the right exercise and step to resume from
        resumeUserProgress(updatedProgressData, completedExerciseIds);
      } else {
        // Initialize completedExercises set from the existing progress data
        const completedExerciseIds = new Set<string>();
        if (progressData && progressData.exercises) {
          progressData.exercises.forEach(exercise => {
            if (exercise.completed) {
              completedExerciseIds.add(exercise.exerciseId);
            }
          });
        }
        
        setCompletedExercises(completedExerciseIds);
        
        // Resume progress - find the right exercise and step to resume from
        resumeUserProgress(progressData, completedExerciseIds);
      }
    } catch (error) {
      console.error('Error fetching module progress:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine where to resume the user's progress
  const resumeUserProgress = (progressData: ModuleProgress, completedExerciseIds: Set<string>) => {
    if (!module || !progressData || progressData.progress === 0) return;
    
    // If the module is partially completed, find where to resume
    if (progressData.progress > 0 && progressData.progress < 100) {
      // First, find any incomplete exercise
      const incompleteExerciseIndex = module.exercises.findIndex(
        ex => !completedExerciseIds.has(ex.id)
      );
      
      if (incompleteExerciseIndex >= 0) {
        const incompleteExercise = module.exercises[incompleteExerciseIndex];
        const exerciseProgress = progressData.exercises.find(ex => ex.exerciseId === incompleteExercise.id);
        
        // Set the active step to this exercise
        setActiveStep(incompleteExerciseIndex + 1); // +1 because step 0 is content
        
        // If it's a step-by-step exercise and has partially completed steps
        if (incompleteExercise.isStepByStep && incompleteExercise.steps && exerciseProgress?.completedSteps?.length) {
          // Find the last completed step
          const lastCompletedStepIndex = Math.max(...exerciseProgress.completedSteps);
          
          // Resume from the next step after the last completed one
          if (lastCompletedStepIndex < incompleteExercise.steps.length - 1) {
            setCurrentExerciseStep(lastCompletedStepIndex + 1);
            
            // Also populate any previous step answers from the completed steps
            if (lastCompletedStepIndex >= 0) {
              const newStepAnswers = [...Array(incompleteExercise.steps.length)].map(() => '');
              
              // For completed steps, put their solution as the answer
              for (let i = 0; i <= lastCompletedStepIndex; i++) {
                if (incompleteExercise.steps[i]) {
                  newStepAnswers[i] = incompleteExercise.steps[i].solution;
                }
              }
              
              setStepAnswers(newStepAnswers);
              
              // Set feedback for all completed steps
              const newStepFeedback: Array<{ type: 'success' | 'error'; message: string } | null> = 
                Array(incompleteExercise.steps.length).fill(null);
              
              for (let i = 0; i <= lastCompletedStepIndex; i++) {
                newStepFeedback[i] = {
                  type: 'success',
                  message: 'Correct! Proceed to the next step.'
                };
              }
              
              setStepFeedback(newStepFeedback);
            }
          }
        }
      }
    } else if (progressData.progress === 100) {
      // If the module is completed, show the content view
      setActiveStep(0);
    }
  };

  // Update exercise progress in the backend
  const updateExerciseProgress = async (exerciseId: string, completed: boolean, completedSteps?: number[]) => {
    try {
      const updatedProgress = await progressService.updateExerciseProgress(
        moduleId || '', 
        exerciseId, 
        { completed, completedSteps }
      );
      
      // Update module progress data with latest from server
      setModuleProgressData(updatedProgress);
      
      // Update local state if successful
      if (completed) {
        setCompletedExercises(prev => new Set([...Array.from(prev), exerciseId]));
      }
    } catch (error) {
      console.error('Error updating exercise progress:', error);
    }
  };

  if (!module) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h4">Module not found</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleBack = () => {
    if (activeStep === 0) {
      navigate('/training');
    } else {
      setActiveStep((prev) => prev - 1);
      setUserAnswer('');
      setStepAnswers([]);
      setCurrentExerciseStep(0);
      setFeedback(null);
      setStepFeedback([]);
    }
  };

  const handleNext = () => {
    if (activeStep < module.exercises.length) {
      setActiveStep((prev) => prev + 1);
      setUserAnswer('');
      setStepAnswers([]);
      setCurrentExerciseStep(0);
      setFeedback(null);
      setStepFeedback([]);
    }
  };

  const toggleHint = (index: number) => {
    setShowHints((prev) => {
      const newHints = [...prev];
      newHints[index] = !newHints[index];
      return newHints;
    });
  };

  const validateAnswer = (exercise: Exercise) => {
    // In a real implementation, this would run the validation command
    // For now, we'll just check if the answer matches the solution
    if (userAnswer.trim() === exercise.solution.trim()) {
      setFeedback({
        type: 'success',
        message: 'Correct! Well done!',
      });
      
      // Update exercise progress
      updateExerciseProgress(exercise.id, true);
      
      // Update local state to immediately reflect progress
      setCompletedExercises(prev => {
        const newSet = new Set([...Array.from(prev), exercise.id]);
        return newSet;
      });
      
      return true;
    }
    setFeedback({
      type: 'error',
      message: 'Not quite right. Try again or check the hints for help.',
    });
    return false;
  };

  const validateStepAnswer = (step: ExerciseStep, answer: string, stepIndex: number, exerciseId: string) => {
    // Check if the answer matches the solution for this step
    if (answer.trim() === step.solution.trim()) {
      setStepFeedback((prev) => {
        const newFeedback = [...prev];
        newFeedback[stepIndex] = {
          type: 'success',
          message: 'Correct! Proceed to the next step.',
        };
        return newFeedback;
      });
      
      // Get the current exercise
      const currentExercise = module.exercises[activeStep - 1];
      
      // If this is the last step, mark the exercise as completed
      if (currentExercise && currentExercise.steps && stepIndex === currentExercise.steps.length - 1) {
        updateExerciseProgress(exerciseId, true, Array.from({ length: stepIndex + 1 }, (_, i) => i));
      } else {
        // Otherwise just update the completed steps
        updateExerciseProgress(exerciseId, false, Array.from({ length: stepIndex + 1 }, (_, i) => i));
      }
      
      return true;
    }
    
    setStepFeedback((prev) => {
      const newFeedback = [...prev];
      newFeedback[stepIndex] = {
        type: 'error',
        message: 'Not quite right. For this exercise, you need to use the exact command shown in the hint below.',
      };
      return newFeedback;
    });
    return false;
  };

  const handleStepNext = () => {
    const exercise = module.exercises[activeStep - 1];
    if (!exercise.steps || currentExerciseStep >= exercise.steps.length - 1) return;
    
    setCurrentExerciseStep((prev) => prev + 1);
  };

  // Find the index of the current module and the next module
  const currentModuleIndex = trainingModules.findIndex((m) => m.id === moduleId);
  
  // Find modules that have this module as a prerequisite
  const nextModulesByPrereq = trainingModules.filter(m => 
    m.prerequisites && m.prerequisites.includes(moduleId || '')
  );
  
  // If modules that have this as a prerequisite exist, use the first one
  // Otherwise, fall back to the next module in the array
  const nextModuleId = nextModulesByPrereq.length > 0 
    ? nextModulesByPrereq[0].id 
    : (currentModuleIndex < trainingModules.length - 1 
        ? trainingModules[currentModuleIndex + 1].id 
        : null);

  // Navigation functions
  const navigateToHome = () => {
    navigate('/');
  };

  const navigateToNextModule = () => {
    // Mark current module as completed
    if (moduleId) {
      progressService.updateModuleProgress(moduleId, { completed: true, progress: 100 })
        .catch(err => console.error('Error updating module completion:', err));
    }
    
    if (nextModuleId) {
      navigate(`/training/${nextModuleId}`);
    } else {
      navigateToHome();
    }
  };

  // Calculate module progress
  const getModuleProgress = (): number => {
    // Use the progress value from the API if available
    if (moduleProgressData && typeof moduleProgressData.progress === 'number') {
      return moduleProgressData.progress;
    }
    
    // Fall back to calculating based on completed exercises
    if (!module?.exercises || module.exercises.length === 0) return 100;
    
    const totalExercises = module.exercises.length;
    const completed = completedExercises.size;
    
    // Using Math.round to ensure 2/3 becomes 67%
    return Math.round((completed / totalExercises) * 100);
  };

  // Format progress percentage text
  const getProgressText = (): string => {
    return `${getModuleProgress()}%`;
  };

  const renderStepByStepExercise = (exercise: Exercise) => {
    if (!exercise.steps || exercise.steps.length === 0) return null;
    
    const currentStep = exercise.steps[currentExerciseStep];
    
    return (
      <Box>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
          Step {currentExerciseStep + 1} of {exercise.steps.length}:
        </Typography>
        
        <Typography variant="h6" gutterBottom>
          {currentStep.instruction}
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            value={stepAnswers[currentExerciseStep] || ''}
            onChange={(e) => {
              const newAnswers = [...stepAnswers];
              newAnswers[currentExerciseStep] = e.target.value;
              setStepAnswers(newAnswers);
            }}
            placeholder="Enter your Git command here..."
            variant="outlined"
            InputProps={{
              sx: {
                backgroundColor: '#010409', // Darker terminal background
                color: '#e6edf3', // Light terminal text
                fontFamily: '"Roboto Mono", "Consolas", monospace',
                '&::placeholder': {
                  color: '#8b949e',
                },
                '&:focus': {
                  borderColor: '#58a6ff',
                },
                '&::before': {
                  content: '"$ "',
                  color: '#f05133',
                  fontWeight: 'bold',
                  marginRight: '0.5rem',
                },
                padding: '12px',
              },
            }}
          />
          <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
            <Button
              variant="contained"
              onClick={() => validateStepAnswer(currentStep, stepAnswers[currentExerciseStep] || '', currentExerciseStep, exercise.id)}
              sx={{
                bgcolor: '#F05133', // Changed to Git orange
                '&:hover': {
                  bgcolor: '#d03b1f',
                },
              }}
            >
              Check Answer
            </Button>
            {currentExerciseStep < exercise.steps.length - 1 && stepFeedback[currentExerciseStep]?.type === 'success' && (
              <Button
                variant="contained"
                onClick={handleStepNext}
                sx={{
                  bgcolor: '#2ea44f',
                  color: '#ffffff',
                  '&:hover': {
                    bgcolor: '#2c974b',
                  },
                }}
              >
                Next Step
              </Button>
            )}
            
            {stepFeedback[currentExerciseStep]?.type === 'success' && currentExerciseStep === exercise.steps.length - 1 && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                {activeStep < module.exercises.length ? (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleNext}
                    sx={{
                      bgcolor: '#2ea44f',
                      '&:hover': {
                        bgcolor: '#2c974b',
                      },
                    }}
                  >
                    Next Exercise
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={navigateToNextModule}
                    sx={{
                      bgcolor: '#2ea44f',
                      '&:hover': {
                        bgcolor: '#2c974b',
                      },
                    }}
                  >
                    {nextModuleId ? 
                      (nextModulesByPrereq.length > 0 ? 
                        `Complete & Start ${nextModulesByPrereq[0].title} Module` : 
                        'Complete Module & Start Next Module') : 
                      'Complete Module & Return Home'}
                  </Button>
                )}
                <Button
                  variant="outlined"
                  onClick={navigateToHome}
                  sx={{
                    borderColor: '#30363d',
                    color: '#c9d1d9',
                    '&:hover': {
                      borderColor: '#8b949e',
                      bgcolor: 'rgba(110, 118, 129, 0.1)',
                    },
                  }}
                >
                  Back to Home
                </Button>
              </Box>
            )}
          </Box>
          
          <Box sx={{ mt: 3, mb: 2 }}>
            {exercise.hints && exercise.hints.map((hint, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Button
                  startIcon={<HintIcon />}
                  onClick={() => toggleHint(index)}
                  size="small"
                >
                  Hint {index + 1}
                </Button>
                {showHints[index] && (
                  <Typography variant="body2" sx={{ 
                    ml: 4, 
                    mt: 1, 
                    p: 1.5, 
                    borderLeft: '3px solid #f05133',
                    bgcolor: 'rgba(240, 81, 51, 0.1)',
                    borderRadius: '0 4px 4px 0'
                  }}>
                    {hint}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
          
          {stepFeedback[currentExerciseStep] && (
            <Alert
              severity={stepFeedback[currentExerciseStep]?.type || 'info'}
              sx={{ mt: 2 }}
              action={
                stepFeedback[currentExerciseStep]?.type === 'success' && (
                  <CheckIcon color="success" />
                )
              }
            >
              {stepFeedback[currentExerciseStep]?.message}
            </Alert>
          )}
          
          {/* Show hint if error feedback exists */}
          {stepFeedback[currentExerciseStep]?.type === 'error' && (
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: '#0d1117', 
              color: '#e6edf3',
              borderRadius: 1,
              border: '1px solid #30363d' 
            }}>
              <Typography variant="subtitle2" color="#58a6ff">
                Hint: Try using the exact command <code style={{ 
                  backgroundColor: '#161b22', 
                  padding: '0.2em 0.4em',
                  borderRadius: '3px' 
                }}>{currentStep.solution}</code>
              </Typography>
            </Box>
          )}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle2" color="text.secondary">
          {getProgressText()}
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={getModuleProgress()} 
          sx={{ mt: 1 }}
        />
      </Box>
    );
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={handleBack} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">{module.title}</Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" color="text.secondary">
          {getProgressText()}
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={getModuleProgress()} 
          sx={{ mt: 1, mb: 3 }}
        />
      </Box>

      <Stepper 
        activeStep={activeStep} 
        sx={{ 
          mb: 4,
          '& .MuiStepLabel-root .Mui-active': {
            color: '#f05133', // Git logo color for active step
          },
          '& .MuiStepLabel-root .Mui-completed': {
            color: '#2ea44f', // GitHub green for completed steps
          },
        }}
      >
        <Step key="content">
          <StepLabel>Content</StepLabel>
        </Step>
        {module.exercises.map((exercise, index) => (
          <Step key={exercise.id}>
            <StepLabel>{completedExercises.has(exercise.id) && <CheckIcon />} Exercise {index + 1}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper 
        sx={{ 
          p: 4, 
          mb: 4, 
          border: '1px solid #30363d',
          boxShadow: '0 3px 6px rgba(149,157,165,0.15)',
          '& pre': {
            backgroundColor: '#0d1117',
            color: '#e6edf3',
            padding: 2,
            borderRadius: 1,
            fontFamily: '"Roboto Mono", "Consolas", monospace',
            overflow: 'auto',
          },
          '& code': {
            backgroundColor: '#0d1117',
            color: '#e6edf3',
            padding: '0.2em 0.4em',
            borderRadius: '3px',
            fontFamily: '"Roboto Mono", "Consolas", monospace',
          }
        }}
      >
        {activeStep === 0 ? (
          <Box>
            <ReactMarkdown>{module.content}</ReactMarkdown>
            {module.visualization && (
              <Box sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Visualization
                </Typography>
                <BranchVisualization initialData={module.visualization} />
              </Box>
            )}
          </Box>
        ) : (
          <Box>
            {module.exercises[activeStep - 1] ? (
              <>
                <Typography variant="h5" gutterBottom>
                  {module.exercises[activeStep - 1].question}
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  {module.exercises[activeStep - 1].description}
                </Typography>

                <Divider sx={{ my: 3 }} />

                {module.exercises[activeStep - 1] && module.exercises[activeStep - 1].isStepByStep ? (
                  renderStepByStepExercise(module.exercises[activeStep - 1])
                ) : (
                  <>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Your Answer:
                      </Typography>
                      <TextField
                        fullWidth
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Enter your Git command here..."
                        variant="outlined"
                        InputProps={{
                          sx: {
                            backgroundColor: '#010409',
                            color: '#e6edf3',
                            fontFamily: '"Roboto Mono", "Consolas", monospace',
                            '&::placeholder': {
                              color: '#8b949e',
                            },
                            '&:focus': {
                              borderColor: '#58a6ff',
                            },
                            '&::before': {
                              content: '"$ "',
                              color: '#f05133',
                              fontWeight: 'bold',
                              marginRight: '0.5rem',
                            },
                            padding: '12px',
                          },
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Button
                        variant="contained"
                        onClick={() => validateAnswer(module.exercises[activeStep - 1])}
                        sx={{
                          alignSelf: 'flex-start',
                          bgcolor: '#F05133', // Changed to Git orange
                          '&:hover': {
                            bgcolor: '#d03b1f',
                          },
                        }}
                      >
                        Check Answer
                      </Button>

                      {feedback && (
                        <Alert
                          severity={feedback.type}
                          sx={{ mt: 2 }}
                          action={
                            feedback.type === 'success' && <CheckIcon color="success" />
                          }
                        >
                          {feedback.message}
                        </Alert>
                      )}

                      {feedback?.type === 'success' && (
                        <>
                          {activeStep < module.exercises.length ? (
                            <Button
                              variant="contained"
                              color="success"
                              onClick={handleNext}
                              sx={{
                                alignSelf: 'flex-start',
                                mt: 2,
                                bgcolor: '#2ea44f',
                                '&:hover': {
                                  bgcolor: '#2c974b',
                                },
                              }}
                            >
                              Next Exercise
                            </Button>
                          ) : (
                            <Button
                              variant="contained"
                              color="success"
                              onClick={navigateToNextModule}
                              sx={{
                                alignSelf: 'flex-start',
                                mt: 2,
                                bgcolor: '#2ea44f',
                                '&:hover': {
                                  bgcolor: '#2c974b',
                                },
                              }}
                            >
                              {nextModuleId ? 
                                (nextModulesByPrereq.length > 0 ? 
                                  `Complete & Start ${nextModulesByPrereq[0].title} Module` : 
                                  'Complete Module & Start Next Module') : 
                                'Complete Module & Return Home'}
                            </Button>
                          )}
                          <Button
                            variant="outlined"
                            onClick={navigateToHome}
                            sx={{
                              alignSelf: 'flex-start',
                              mt: 1,
                              borderColor: '#30363d',
                              color: '#c9d1d9',
                              '&:hover': {
                                borderColor: '#8b949e',
                                bgcolor: 'rgba(110, 118, 129, 0.1)',
                              },
                            }}
                          >
                            Back to Home
                          </Button>
                        </>
                      )}
                    </Box>

                    <Box sx={{ mt: 4 }}>
                      {module.exercises[activeStep - 1].hints && module.exercises[activeStep - 1].hints.map((hint, index) => (
                        <Box key={index} sx={{ mb: 1 }}>
                          <Button
                            startIcon={<HintIcon />}
                            onClick={() => toggleHint(index)}
                            size="small"
                          >
                            Hint {index + 1}
                          </Button>
                          {showHints[index] && (
                            <Typography variant="body2" sx={{ 
                              ml: 4, 
                              mt: 1, 
                              p: 1.5, 
                              borderLeft: '3px solid #f05133',
                              bgcolor: 'rgba(240, 81, 51, 0.1)',
                              borderRadius: '0 4px 4px 0'
                            }}>
                              {module.exercises[activeStep - 1].hints[index]}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </>
                )}
              </>
            ) : (
              <Typography>Exercise not found</Typography>
            )}
          </Box>
        )}
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
        <Button onClick={handleBack} startIcon={<ArrowBackIcon />}>
          {activeStep === 0 ? 'Back to Modules' : 'Previous'}
        </Button>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="subtitle2" color="text.secondary">
            {getProgressText()}
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={getModuleProgress()} 
            sx={{ mt: 1, width: '200px' }}
          />
        </Box>
        {activeStep === 0 && (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={activeStep === module.exercises.length}
          >
            Start Exercises
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ModuleViewer; 