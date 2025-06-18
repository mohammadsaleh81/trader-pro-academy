
import axios from 'axios';
import { TOKEN_STORAGE_KEY, API_BASE_URL, API_BASE_URL_FALLBACK } from './config';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    try {
      // Get tokens from localStorage
      const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
      const tokens = stored ? JSON.parse(stored) : null;
      
      // If access token exists and Authorization header is not already set, add it
      if (tokens?.access && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${tokens.access}`;
      }
    } catch (error) {
      console.error('Error parsing stored tokens:', error);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
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

    // Handle network errors
    if (!error.response && error.code === 'ECONNABORTED') {
      console.warn('Request timeout, trying fallback URL');
      // Could implement fallback URL retry logic here if needed
    }

    // If error is 401 and we have tokens and haven't tried to refresh yet
    if (error.response?.status === 401) {
      try {
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
            console.error('Token refresh failed:', refreshError);
            // If refresh token is invalid, clear tokens and redirect to login
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            window.dispatchEvent(new CustomEvent('auth:logout'));
          }
        }
      } catch (parseError) {
        console.error('Error handling 401 response:', parseError);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
