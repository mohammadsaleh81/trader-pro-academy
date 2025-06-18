
import axios, { AxiosResponse } from 'axios';
import { API_BASE_URL, API_ENDPOINTS, TOKEN_STORAGE_KEY, DEFAULT_IMAGES } from './config';

// Create axios instance with better error handling
const apiInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface User {
  id: number;
  phone_number: string;
  first_name: string;
  last_name: string;
  email: string;
  identity_verified?: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

// Enhanced API class with better error handling
class API {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Test API connection with fallback
  async testApiConnection(): Promise<boolean> {
    try {
      console.log('Testing API connection to:', this.baseURL);
      const response = await fetch(`${this.baseURL}/content/articles/?page=1&page_size=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      
      console.log('API connection test status:', response.status);
      const success = response.ok;
      console.log(success ? 'API connection successful' : 'API connection failed');
      return success;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }

  // Safe token operations
  getStoredTokens(): AuthTokens | null {
    try {
      const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error parsing stored tokens:', error);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      return null;
    }
  }

  setStoredTokens(tokens: AuthTokens): void {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  }

  clearStoredTokens(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  // Enhanced request method with better error handling
  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    requiresAuth: boolean = true
  ): Promise<T> {
    try {
      const config: any = {
        method,
        url: endpoint,
        baseURL: this.baseURL,
        timeout: 10000,
      };

      if (data) {
        config.data = data;
      }

      if (requiresAuth) {
        const tokens = this.getStoredTokens();
        if (tokens?.access) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${tokens.access}`,
          };
        }
      }

      const response: AxiosResponse<T> = await axios(config);
      return response.data;
    } catch (error: any) {
      console.error(`API ${method} ${endpoint} failed:`, error);
      
      if (error.response?.status === 401) {
        this.clearStoredTokens();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        throw new Error('احراز هویت نامعتبر است. لطفاً دوباره وارد شوید');
      }
      
      if (error.response?.status >= 500) {
        throw new Error('خطای سرور. لطفاً بعداً تلاش کنید');
      }
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('درخواست زمان‌بری شد. لطفاً اتصال اینترنت خود را بررسی کنید');
      }
      
      throw error;
    }
  }

  // Auth methods
  async requestOTP(phone: string): Promise<any> {
    return this.makeRequest('POST', API_ENDPOINTS.REQUEST_OTP, { phone_number: phone }, false);
  }

  async verifyOTP(phone: string, otp: string): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>('POST', API_ENDPOINTS.VERIFY_OTP, {
      phone_number: phone,
      otp
    }, false);
    
    // Store tokens after successful verification
    this.setStoredTokens({
      access: response.access,
      refresh: response.refresh
    });
    
    return response;
  }

  async getProfile(): Promise<User> {
    return this.makeRequest('GET', API_ENDPOINTS.PROFILE);
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.makeRequest('PUT', API_ENDPOINTS.PROFILE, data);
  }

  async getAvatar(): Promise<{ avatar: string }> {
    return this.makeRequest('GET', API_ENDPOINTS.AVATAR);
  }

  // Search methods for the search hook
  async searchArticles(query: string): Promise<any[]> {
    return this.makeRequest('GET', `${API_ENDPOINTS.ARTICLES}?search=${encodeURIComponent(query)}`, null, false);
  }

  async searchVideos(query: string): Promise<any[]> {
    return this.makeRequest('GET', `${API_ENDPOINTS.VIDEOS}?search=${encodeURIComponent(query)}`, null, false);
  }

  async searchPodcasts(query: string): Promise<any[]> {
    return this.makeRequest('GET', `${API_ENDPOINTS.PODCASTS}?search=${encodeURIComponent(query)}`, null, false);
  }

  async searchCourses(query: string): Promise<any[]> {
    return this.makeRequest('GET', `${API_ENDPOINTS.COURSES}?search=${encodeURIComponent(query)}`, null, false);
  }

  logout(): void {
    this.clearStoredTokens();
  }
}

// Export single instance
export const api = new API(API_BASE_URL);
export default apiInstance;
