import axios, { AxiosInstance, AxiosError } from 'axios';

// API Configuration
const DEFAULT_API_BASE_URL = 'https://api.acearena.com';

const normalizeApiBaseUrl = (value?: string) => {
  const trimmed = (value || '').trim().replace(/\/+$/, '');
  
  // For development, allow localhost
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return trimmed || 'http://localhost:8080/api';
  }

  // For production
  const normalized = !trimmed ? DEFAULT_API_BASE_URL : trimmed;
  return /\/api$/i.test(normalized) ? normalized : `${normalized}/api`;
};

const API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout for large file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors with user-friendly messages
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (!error.response) {
      console.error('Network error - unable to reach API server');
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const data = error.response?.data;
    const errorMessage = data?.error || data?.message || 'An error occurred';

    switch (status) {
      case 400:
        // Bad Request
        console.error('Validation error:', errorMessage);
        break;
      
      case 401:
        // Unauthorized - Token expired or invalid
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          // Only redirect if not already on login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/auth/login';
          }
        }
        break;
      
      case 403:
        // Forbidden
        console.error('Access denied:', errorMessage);
        break;
      
      case 404:
        // Not Found
        console.error('Resource not found:', errorMessage);
        break;
      
      case 500:
        // Server Error
        console.error('Server error:', errorMessage);
        break;
      
      default:
        console.error('Error:', errorMessage);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
