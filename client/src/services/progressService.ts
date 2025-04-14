import axios from 'axios';
import { ModuleProgress } from '../types/training';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const progressService = {
  // Get all progress for the current user
  getAllProgress: async (): Promise<ModuleProgress[]> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/progress`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Get progress for a specific module
  getModuleProgress: async (moduleId: string): Promise<ModuleProgress> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/progress/module/${moduleId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Update module progress
  updateModuleProgress: async (moduleId: string, data: Partial<ModuleProgress>): Promise<ModuleProgress> => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/progress/module/${moduleId}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Update exercise progress
  updateExerciseProgress: async (
    moduleId: string, 
    exerciseId: string, 
    data: { completed?: boolean; completedSteps?: number[] }
  ): Promise<ModuleProgress> => {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/progress/module/${moduleId}/exercise/${exerciseId}`, 
      data,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
};

export default progressService; 