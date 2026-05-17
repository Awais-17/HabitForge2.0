import axios from 'axios';

// Use relative path for deployment (served from same origin)
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth tokens (future-proof)
api.interceptors.request.use(
  (config) => {
    // Add auth token here if needed in the future
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors globally
    if (error.response?.status === 401) {
      // Unauthorized - could redirect to login or clear session
      console.warn('Unauthorized request');
    }
    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

export const habitService = {
  getHabits: (userId: string) => api.get(`/habits?userId=${userId}`),
  createHabit: (data: any) => api.post('/habits', data),
  updateHabit: (habitId: string, data: any) => api.put(`/habits/${habitId}`, data),
  deleteHabit: (habitId: string) => api.delete(`/habits/${habitId}`),
  completeHabit: (habitId: string, userId: string) =>
    api.post(`/habits/${habitId}/complete`, { userId }),
  getAnalytics: (userId: string, days: number = 30) =>
    api.get(`/habits/analytics?userId=${userId}&days=${days}`),
};

export const userService = {
  register: (name: string, email: string) => api.post('/users/register', { name, email }),
  getUser: (userId: string) => api.get(`/users/${userId}`),
  updateUser: (userId: string, data: { name?: string; email?: string }) => api.put(`/users/${userId}`, data),
  seedHistory: (userId: string) => api.post(`/users/${userId}/seed`, {}, { timeout: 120000 }), // 2 min for batch seed
  upgradeToPremium: (userId: string) => api.post(`/users/${userId}/upgrade`),
};

export default api;
