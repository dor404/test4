import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Button,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Module, ModuleProgress } from '../../types/training';
import { trainingModules } from '../../data/trainingModules';
import progressService from '../../services/progressService';

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner':
      return 'success';
    case 'intermediate':
      return 'warning';
    case 'advanced':
      return 'error';
    default:
      return 'default';
  }
};

const ModuleList: React.FC = () => {
  const navigate = useNavigate();
  const [moduleProgress, setModuleProgress] = useState<Record<string, ModuleProgress>>({});
  const [loading, setLoading] = useState(true);

  // Fetch progress data function
  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const progressData = await progressService.getAllProgress();
      
      // Convert array to record indexed by moduleId for easy lookup
      const progressMap: Record<string, ModuleProgress> = {};
      progressData.forEach(progress => {
        progressMap[progress.moduleId] = progress;
      });
      
      setModuleProgress(progressMap);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts or when user navigates back to the list
  useEffect(() => {
    fetchProgressData();
  }, [navigate]);

  // Add focus event listener to refresh data when tab gains focus
  useEffect(() => {
    const handleFocus = () => {
      fetchProgressData();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Get progress value for a module
  const getModuleProgressValue = (moduleId: string): number => {
    return moduleProgress[moduleId]?.progress || 0;
  };

  // Get progress text for a module
  const getModuleProgressText = (moduleId: string): string => {
    const progress = getModuleProgressValue(moduleId);
    return `${progress}%`;
  };

  // Get button text based on progress
  const getButtonText = (moduleId: string): string => {
    const progress = getModuleProgressValue(moduleId);
    
    if (progress === 0) {
      return 'Start Module';
    } else if (progress === 100) {
      return 'Review Module';
    } else {
      return 'Continue Module';
    }
  };

  // Determine if module is locked (prerequisites not completed)
  const isModuleLocked = (module: Module): boolean => {
    if (!module.prerequisites || module.prerequisites.length === 0) {
      return false;
    }

    return module.prerequisites.some(prereqId => {
      const prereqProgress = moduleProgress[prereqId];
      return !prereqProgress || !prereqProgress.completed;
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Git Training Modules
      </Typography>
      <Grid container spacing={3}>
        {trainingModules.map((module) => (
          <Grid item xs={12} md={6} lg={4} key={module.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="div" gutterBottom>
                  {module.title}
                </Typography>
                <Chip
                  label={module.difficulty}
                  color={getDifficultyColor(module.difficulty) as any}
                  size="small"
                  sx={{ mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {module.description}
                </Typography>
                <Typography variant="caption" display="block" gutterBottom>
                  Estimated time: {module.estimatedTime}
                </Typography>
                {module.prerequisites && module.prerequisites.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" display="block" gutterBottom>
                      Prerequisites:
                    </Typography>
                    {module.prerequisites.map((prereq) => (
                      <Chip
                        key={prereq}
                        label={
                          trainingModules.find((m) => m.id === prereq)?.title ||
                          prereq
                        }
                        size="small"
                        variant="outlined"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                )}
                <Box sx={{ mt: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={getModuleProgressValue(module.id)}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {getModuleProgressText(module.id)}
                  </Typography>
                </Box>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate(`/training/${module.id}`)}
                >
                  {getButtonText(module.id)}
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ModuleList; 