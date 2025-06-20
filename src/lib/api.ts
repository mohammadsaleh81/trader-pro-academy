
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
  id: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  email: string;
  identity_verified?: boolean;
  avatar?: string;
  // Additional properties for compatibility
  phone?: string;
  name?: string;
  isProfileComplete?: boolean;
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

// Content Types - Updated to match component expectations
export interface Article {
  id: string;
  title: string;
  content: string;
  description: string;
  summary?: string;
  thumbnail?: string;
  author: string | { first_name: string; last_name: string; username?: string; email?: string };
  published?: string;
  created_at: string;
  date: string;
  tags: string[] | { id: string; name: string }[];
  view_count?: number;
  slug?: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  video_type: string;
  video_embed?: string;
  thumbnail?: string;
  author: string | { first_name: string; last_name: string; username?: string; email?: string };
  created_at: string;
  date: string;
  duration?: string;
  tags: string[] | { id: string; name: string }[];
  view_count?: number;
  slug?: string;
}

export interface Podcast {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  thumbnail?: string;
  author: string | { first_name: string; last_name: string; username?: string; email?: string };
  created_at: string;
  date: string;
  duration?: string;
  tags: string[] | { id: string; name: string }[];
  view_count?: number;
  slug?: string;
  audio_type: string;
  audio_file: string | null;
  // Additional podcast properties
  episode_number?: number;
  season_number?: number;
  transcript?: string;
}

// New Livestream type
export interface Livestream {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  stream_url: string | null;
  start_at: string | null;
  stream_status: "live" | "scheduled" | "ended";
  max_viewers: number;
  current_viewers: number;
  author: {
    id: number;
    username: string | null;
    email: string;
    first_name: string;
    last_name: string;
  };
  category: {
    id: number;
    name: string;
    slug: string;
    description: string;
    created_at: string;
  };
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  status: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  view_count: number;
}

// Comment Types
export interface ArticleComment {
  id: string;
  article: string;
  author: {
    id: string;
    first_name: string;
    last_name: string;
    username?: string;
    email?: string;
  };
  content: string;
  created_at: string;
  parent?: string | null;
  replies?: ArticleComment[];
  is_approved: boolean;
}

export interface MediaComment {
  id: string;
  author: {
    id: string;
    first_name: string;
    last_name: string;
    username?: string;
    email?: string;
  };
  content: string;
  created_at: string;
  parent?: string | null;
  replies?: MediaComment[];
  is_approved: boolean;
}

export interface BookmarkResponse {
  id: string;
  user: {
    id: string;
    username?: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  article: {
    id: string;
    title: string;
    slug: string;
    thumbnail?: string;
  };
  created_at: string;
}

// Course Type with missing properties
export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  price: string;
  created_at: string;
  updated_at: string;
  status: string;
  tags: string[];
  thumbnail: string;
  total_duration: number;
  // Additional course properties
  discount_percentage?: number;
  discounted_price?: string;
  is_enrolled?: boolean;
  progress_percentage?: number;
  requires_identity_verification?: boolean;
}

// Paginated Response Type
export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
  current_page: number;
  total_pages: number;
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
  async makeRequest<T>(
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

  async uploadAvatar(file: File): Promise<{ avatar: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const tokens = this.getStoredTokens();
    const config: any = {
      method: 'POST',
      url: API_ENDPOINTS.AVATAR,
      baseURL: this.baseURL,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 seconds for file upload
    };

    if (tokens?.access) {
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }

    const response: AxiosResponse<{ avatar: string }> = await axios(config);
    return response.data;
  }

  // Comment methods
  async getArticleComments(articleId: string): Promise<ArticleComment[]> {
    return this.makeRequest('GET', API_ENDPOINTS.ARTICLE_COMMENTS(articleId), null, false);
  }

  async createArticleComment(articleId: string, data: { content: string; parent?: string | null }): Promise<ArticleComment> {
    return this.makeRequest('POST', API_ENDPOINTS.ARTICLE_COMMENTS(articleId), data);
  }

  async getVideoComments(videoId: string): Promise<MediaComment[]> {
    return this.makeRequest('GET', API_ENDPOINTS.VIDEO_COMMENTS(videoId), null, false);
  }

  async createVideoComment(videoId: string, data: { content: string; parent?: string | null }): Promise<MediaComment> {
    return this.makeRequest('POST', API_ENDPOINTS.VIDEO_COMMENTS(videoId), data);
  }

  async getPodcastComments(podcastId: string): Promise<MediaComment[]> {
    return this.makeRequest('GET', API_ENDPOINTS.PODCAST_COMMENTS(podcastId), null, false);
  }

  async createPodcastComment(podcastId: string, data: { content: string; parent?: string | null }): Promise<MediaComment> {
    return this.makeRequest('POST', API_ENDPOINTS.PODCAST_COMMENTS(podcastId), data);
  }

  async updateMediaComment(commentId: string, content: string): Promise<MediaComment> {
    return this.makeRequest('PUT', API_ENDPOINTS.MEDIA_COMMENT_DETAIL(commentId), { content });
  }

  async deleteMediaComment(commentId: string): Promise<void> {
    return this.makeRequest('DELETE', API_ENDPOINTS.MEDIA_COMMENT_DETAIL(commentId));
  }

  // Search methods for the search hook
  async searchArticles(query: string): Promise<Article[]> {
    return this.makeRequest('GET', `${API_ENDPOINTS.ARTICLES}?search=${encodeURIComponent(query)}`, null, false);
  }

  async searchVideos(query: string): Promise<Video[]> {
    return this.makeRequest('GET', `${API_ENDPOINTS.VIDEOS}?search=${encodeURIComponent(query)}`, null, false);
  }

  async searchPodcasts(query: string): Promise<Podcast[]> {
    return this.makeRequest('GET', `${API_ENDPOINTS.PODCASTS}?search=${encodeURIComponent(query)}`, null, false);
  }

  async searchCourses(query: string): Promise<Course[]> {
    return this.makeRequest('GET', `${API_ENDPOINTS.COURSES}?search=${encodeURIComponent(query)}`, null, false);
  }

  logout(): void {
    this.clearStoredTokens();
  }
}

// API instances for different content types with required methods
export const articlesApi = {
  getById: async (id: string): Promise<Article> => {
    return api.makeRequest('GET', API_ENDPOINTS.ARTICLE_DETAIL(Number(id)), null, false);
  },
  getAll: async (page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Article>> => {
    return api.makeRequest('GET', `${API_ENDPOINTS.ARTICLES}?page=${page}&page_size=${pageSize}`, null, false);
  }
};

export const videosApi = {
  getById: async (id: string): Promise<Video> => {
    return api.makeRequest('GET', API_ENDPOINTS.VIDEO_DETAIL(Number(id)), null, false);
  },
  getAll: async (page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Video>> => {
    return api.makeRequest('GET', `${API_ENDPOINTS.VIDEOS}?page=${page}&page_size=${pageSize}`, null, false);
  }
};

export const podcastsApi = {
  getById: async (id: string): Promise<Podcast> => {
    return api.makeRequest('GET', API_ENDPOINTS.PODCAST_DETAIL(Number(id)), null, false);
  },
  getAll: async (page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Podcast>> => {
    return api.makeRequest('GET', `${API_ENDPOINTS.PODCASTS}?page=${page}&page_size=${pageSize}`, null, false);
  }
};

export const livestreamsApi = {
  getById: async (id: string): Promise<Livestream> => {
    return api.makeRequest('GET', API_ENDPOINTS.LIVESTREAM_DETAIL(Number(id)), null, false);
  },
  getAll: async (page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Livestream>> => {
    return api.makeRequest('GET', `${API_ENDPOINTS.LIVESTREAMS}?page=${page}&page_size=${pageSize}`, null, false);
  }
};

export const bookmarksApi = {
  list: async (): Promise<BookmarkResponse[]> => {
    return api.makeRequest('GET', API_ENDPOINTS.BOOKMARKS);
  },
  getAll: async (): Promise<BookmarkResponse[]> => {
    return api.makeRequest('GET', API_ENDPOINTS.BOOKMARKS);
  },
  create: async (articleId: string): Promise<BookmarkResponse> => {
    return api.makeRequest('POST', API_ENDPOINTS.BOOKMARKS, { article_id: articleId });
  },
  delete: async (bookmarkId: string): Promise<void> => {
    return api.makeRequest('DELETE', API_ENDPOINTS.BOOKMARK_DETAIL(Number(bookmarkId)));
  }
};

export const coursesApi = {
  getById: async (id: string): Promise<Course> => {
    return api.makeRequest('GET', API_ENDPOINTS.COURSE_DETAIL(id), null, false);
  },
  getAll: async (page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Course>> => {
    return api.makeRequest('GET', `${API_ENDPOINTS.COURSES}?page=${page}&page_size=${pageSize}`, null, false);
  },
  getMyCourses: async (page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Course>> => {
    return api.makeRequest('GET', `${API_ENDPOINTS.MY_COURSES}?page=${page}&page_size=${pageSize}`);
  }
};

// Export single instance
export const api = new API(API_BASE_URL);
export default apiInstance;
