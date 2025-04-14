import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

// Make sure to include the auth token in requests
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export const adminService = {
  // Get all users
  async getUsers(): Promise<User[]> {
    try {
      const response = await axios.get(`${API_URL}/auth/users`, getAuthHeader());
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },

  // Update user role
  async updateUserRole(userId: string, role: 'student' | 'lecturer' | 'admin'): Promise<User> {
    try {
      const response = await axios.patch(
        `${API_URL}/auth/users/${userId}/role`, 
        { role }, 
        getAuthHeader()
      );
      return response.data.user;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user role');
    }
  }
}; 