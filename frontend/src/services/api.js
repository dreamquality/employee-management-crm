import axios from 'axios';

// Auto-detect environment (Codespaces, GitHub Actions, Render, local dev)
const getApiUrl = () => {
  // Priority 1: Explicit environment variable
  if (import.meta.env.VITE_API_URL) {
    console.log('Using VITE_API_URL:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // Priority 2: Browser - Codespaces detection
  if (typeof window !== 'undefined' && window.location?.hostname.includes('app.github.dev')) {
    const currentUrl = window.location.hostname;
    // Replace frontend port (5173) with backend port (3000)
    const backendUrl = currentUrl.replace('-5173', '-3000');
    const url = `https://${backendUrl}`;
    console.log('Auto-detected Codespaces URL:', url);
    return url;
  }
  
  // Priority 3: Production environment detection (non-localhost domains)
  if (typeof window !== 'undefined' && !window.location?.hostname.includes('localhost')) {
    // In production, frontend and backend should use the same domain or you must set VITE_API_URL
    console.warn('Production environment detected but VITE_API_URL not set. Using relative path.');
    return ''; // Relative path - assumes same domain or reverse proxy
  }
  
  // Priority 4: CI/CD or SSR - use localhost
  if (typeof window === 'undefined') {
    console.log('Server-side environment detected, using localhost');
    return 'http://localhost:3000';
  }
  
  // Priority 5: Default localhost for local development
  console.log('Using default localhost URL');
  return 'http://localhost:3000';
};

const API_URL = getApiUrl();
console.log('Final API_URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
