import axios from 'axios';
import toast from 'react-hot-toast';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    
    // Show error toast for non-auth errors
    if (error.response?.status !== 401 && error.response?.status !== 403) {
      toast.error(message);
    }
    
    if (error.response?.status === 401) {
      // Clear auth state if token is invalid
      localStorage.removeItem('access-token');
      localStorage.removeItem('refresh-token');
      // You might want to redirect to login page here
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
    }
    
    return Promise.reject(error);
  }
);