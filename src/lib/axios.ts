import axios from 'axios';
import { TOKEN_STORAGE_KEY, API_BASE_URL } from './config';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Get tokens from localStorage
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
    const tokens = stored ? JSON.parse(stored) : null;
    
    // If access token exists and Authorization header is not already set, add it
    if (tokens?.access && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we have tokens and haven't tried to refresh yet
    if (error.response?.status === 401) {
      const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
      const tokens = stored ? JSON.parse(stored) : null;

      if (tokens?.refresh && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Try to refresh the token
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: tokens.refresh
          });
          
          const { access } = response.data;
          
          // Store the new access token
          localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify({
            ...tokens,
            access
          }));
          
          // Update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          
          // Retry the original request
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh token is invalid, clear tokens
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 