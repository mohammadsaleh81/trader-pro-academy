import { API_BASE_URL, API_ENDPOINTS, TOKEN_STORAGE_KEY, API_BASE_URL_FALLBACK } from "./config";
import axios from './axios';
import { PaginatedResponse } from '@/types/pagination';

interface AuthTokens {
    access: string;
    refresh: string;
}

interface User {
    id: string;
    phone_number: string;
    first_name: string;
    last_name: string;
    email: string;
    is_phone_verified: boolean;
    isProfileComplete: boolean;
    identity_verified: boolean;
    thumbnail?: string;
}

interface RequestOTPResponse {
    message: string;
    code: string;
}

interface VerifyOTPResponse {
    is_new: boolean;
    refresh: string;
    access: string;
    user: User;
}

interface AvatarResponse {
    avatar: string;
}

// Comment interfaces
export interface CommentAuthor {
    id: string;
    username?: string;
    email?: string;
    first_name: string;
    last_name: string;
}

export interface CommentBase {
    id: string;
    author: CommentAuthor;
    content: string;
    created_at: string;
    updated_at: string;
    is_approved: boolean;
}

// Article comment interface
export interface ArticleComment extends CommentBase {
    article: string;
    parent: string | null;
    replies: ArticleComment[];
}

// Media comment interface (for videos, podcasts, etc.)
export interface MediaComment extends CommentBase {
    content_type: string;
    object_id: string;
    content_object_name: string;
    parent: string | null;
    replies: MediaComment[];
}

// Create comment interfaces
export interface CreateArticleComment {
    content: string;
    parent?: string | null;
}

export interface CreateMediaComment {
    content_type: string;
    object_id: string;
    content: string;
    parent?: string | null;
}

// Article types
export interface Article {
    id: string;
    title: string;
    slug: string;
    content: string;
    summary: string;
    thumbnail: string | null;
    author: string;
    category: {
        id: string;
        name: string;
        slug: string;
        description: string;
    };
    tags: Array<{
        id: string;
        name: string;
        slug: string;
    }>;
    published: string;
    view_count: number;
    description: string;
    date: string;
}

// Video types
export interface Video {
    id: string;
    title: string;
    slug: string;
    description: string;
    thumbnail: string | null;
    video_type: string;
    video_embed: string | null;
    duration: string;
    is_premium: boolean;
    author: string;
    category: {
        id: string;
        name: string;
        slug: string;
        description: string;
    };
    tags: Array<{
        id: string;
        name: string;
        slug: string;
    }>;
    status: string;
    featured: boolean;
    created_at: string;
    updated_at: string;
    published_at: string | null;
    view_count: number;
    date: string;
}

class ApiService {
    private getHeaders(requiresAuth: boolean = false): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (requiresAuth) {
            const tokens = this.getStoredTokens();
            if (tokens?.access) {
                headers['Authorization'] = `Bearer ${tokens.access}`;
            }
        }

        return headers;
    }

    public getStoredTokens(): AuthTokens | null {
        const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    }

    private setStoredTokens(tokens: AuthTokens): void {
        localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
    }

    private clearStoredTokens(): void {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
    }

    async requestOTP(phoneNumber: string): Promise<RequestOTPResponse> {
        console.log('API: requestOTP called with:', phoneNumber);
        console.log('API: Using URL:', `${API_BASE_URL}${API_ENDPOINTS.REQUEST_OTP}`);
        
        try {
            const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REQUEST_OTP}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ phone_number: phoneNumber }),
            });

            console.log('API: requestOTP response status:', response.status);
            console.log('API: requestOTP response headers:', response.headers);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API: requestOTP failed:', errorText);
                throw new Error(`Failed to request OTP: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('API: requestOTP success:', data);
            return data;
        } catch (error) {
            console.error('API: requestOTP error with primary URL:', error);
            
            // Try fallback URL if primary fails and we're in development
            if (process.env.NODE_ENV === 'development') {
                console.log('API: Trying fallback URL:', `${API_BASE_URL_FALLBACK}${API_ENDPOINTS.REQUEST_OTP}`);
                
                try {
                    const response = await fetch(`${API_BASE_URL_FALLBACK}${API_ENDPOINTS.REQUEST_OTP}`, {
                        method: 'POST',
                        headers: this.getHeaders(),
                        body: JSON.stringify({ phone_number: phoneNumber }),
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`Failed to request OTP from fallback: ${response.status} - ${errorText}`);
                    }

                    const data = await response.json();
                    console.log('API: requestOTP success with fallback:', data);
                    return data;
                } catch (fallbackError) {
                    console.error('API: requestOTP fallback also failed:', fallbackError);
                    throw error; // Throw original error
                }
            }
            
            throw error;
        }
    }

    async verifyOTP(phoneNumber: string, code: string): Promise<VerifyOTPResponse> {
        console.log('API: verifyOTP called with:', phoneNumber, code);
        console.log('API: Using URL:', `${API_BASE_URL}${API_ENDPOINTS.VERIFY_OTP}`);
        
        try {
            const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.VERIFY_OTP}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ phone_number: phoneNumber, code }),
            });

            console.log('API: verifyOTP response status:', response.status);

            if (!response.ok) { 
                const errorData = await response.json().catch(() => ({}));
                console.error('API: verifyOTP failed:', errorData);
                throw new Error(errorData.error || `Failed to verify OTP: ${response.status}`);
            }

            const data = await response.json();
            console.log('API: verifyOTP success:', data);
            
            this.setStoredTokens({
                access: data.access,
                refresh: data.refresh,
            });

            return data;
        } catch (error) {
            console.error('API: verifyOTP error with primary URL:', error);
            
            // Try fallback URL if primary fails and we're in development
            if (process.env.NODE_ENV === 'development') {
                console.log('API: Trying fallback URL for verifyOTP:', `${API_BASE_URL_FALLBACK}${API_ENDPOINTS.VERIFY_OTP}`);
                
                try {
                    const response = await fetch(`${API_BASE_URL_FALLBACK}${API_ENDPOINTS.VERIFY_OTP}`, {
                        method: 'POST',
                        headers: this.getHeaders(),
                        body: JSON.stringify({ phone_number: phoneNumber, code }),
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.error || `Failed to verify OTP from fallback: ${response.status}`);
                    }

                    const data = await response.json();
                    console.log('API: verifyOTP success with fallback:', data);
                    
                    this.setStoredTokens({
                        access: data.access,
                        refresh: data.refresh,
                    });

                    return data;
                } catch (fallbackError) {
                    console.error('API: verifyOTP fallback also failed:', fallbackError);
                    throw error; // Throw original error
                }
            }
            
            throw error;
        }
    }

    async getProfile(): Promise<User> {
        const response = await fetch('http://127.0.0.1:8000/user/profile/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_tokens')?.split('"')[3]}`,
            },
        });

        if (!response.ok) {
            throw new Error('خطا در دریافت اطلاعات پروفایل');
        }

        return response.json();
    }

    async updateProfile(data: Partial<User>): Promise<User> {
        console.log('API: updateProfile called with data:', data);
        console.log('API: Using endpoint:', `${API_BASE_URL}${API_ENDPOINTS.PROFILE}`);
        
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PROFILE}`, {
            method: 'PUT',
            headers: this.getHeaders(true),
            body: JSON.stringify(data),
        });

        console.log('API: updateProfile response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API: updateProfile failed:', errorText);
            throw new Error(`Failed to update profile: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('API: updateProfile success:', result);
        return result;
    }

    async getAvatar(): Promise<AvatarResponse> {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AVATAR}`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            throw new Error('Failed to get avatar');
        }

        return response.json();
    }

    async uploadAvatar(file: File): Promise<AvatarResponse> {
        const formData = new FormData();
        formData.append('avatar', file);

        const headers = this.getHeaders(true);
        delete headers['Content-Type']; // Let the browser set the correct content type for FormData

        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AVATAR}`, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to upload avatar');
        }

        return response.json();
    }

    async deleteAvatar(): Promise<AvatarResponse> {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AVATAR}`, {
            method: 'DELETE',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            throw new Error('Failed to delete avatar');
        }

        return response.json();
    }

    login = this.verifyOTP;

    logout(): void {
        this.clearStoredTokens();
    }

    // Comment methods
    
    // Article comments
    async getArticleComments(articleId: string): Promise<ArticleComment[]> {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ARTICLE_COMMENTS(articleId)}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to get article comments');
        }

        return response.json();
    }

    async createArticleComment(articleId: string, commentData: CreateArticleComment): Promise<ArticleComment> {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ARTICLE_COMMENTS(articleId)}`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(commentData),
        });

        if (!response.ok) {
            throw new Error('Failed to create article comment');
        }

        return response.json();
    }

    // Video comments
    async getVideoComments(videoId: string): Promise<MediaComment[]> {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.VIDEO_COMMENTS(videoId)}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to get video comments');
        }

        return response.json();
    }

    async createVideoComment(videoId: string, commentData: CreateArticleComment): Promise<MediaComment> {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.VIDEO_COMMENTS(videoId)}`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(commentData),
        });

        if (!response.ok) {
            throw new Error('Failed to create video comment');
        }

        return response.json();
    }

    // Podcast comments
    async getPodcastComments(podcastId: string): Promise<MediaComment[]> {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PODCAST_COMMENTS(podcastId)}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to get podcast comments');
        }

        return response.json();
    }

    async createPodcastComment(podcastId: string, commentData: CreateArticleComment): Promise<MediaComment> {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PODCAST_COMMENTS(podcastId)}`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(commentData),
        });

        if (!response.ok) {
            throw new Error('Failed to create podcast comment');
        }

        return response.json();
    }

    // Generic media comments
    async getMediaComments(contentType: string, objectId: string): Promise<MediaComment[]> {
        const url = `${API_BASE_URL}${API_ENDPOINTS.MEDIA_COMMENTS}?content_type=${contentType}&object_id=${objectId}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to get media comments');
        }

        return response.json();
    }

    async createMediaComment(commentData: CreateMediaComment): Promise<MediaComment> {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MEDIA_COMMENTS}`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(commentData),
        });

        if (!response.ok) {
            throw new Error('Failed to create media comment');
        }

        return response.json();
    }

    // Update comment
    async updateMediaComment(commentId: string, content: string): Promise<MediaComment> {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MEDIA_COMMENT_DETAIL(commentId)}`, {
            method: 'PUT',
            headers: this.getHeaders(true),
            body: JSON.stringify({ content }),
        });

        if (!response.ok) {
            throw new Error('Failed to update comment');
        }

        return response.json();
    }

    // Delete comment
    async deleteMediaComment(commentId: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MEDIA_COMMENT_DETAIL(commentId)}`, {
            method: 'DELETE',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            throw new Error('Failed to delete comment');
        }
    }

    // Test API connection
    async testApiConnection(): Promise<boolean> {
        try {
            console.log('Testing API connection to:', API_BASE_URL);
            
            // Test with a simple GET request that doesn't require auth
            const response = await fetch(`${API_BASE_URL}/content/articles/?page=1&page_size=1`, {
                method: 'GET',
                headers: this.getHeaders(),
            });

            console.log('API connection test status:', response.status);
            
            if (response.ok) {
                console.log('API connection successful');
                return true;
            } else {
                console.log('API connection failed with status:', response.status);
                return false;
            }
        } catch (error) {
            console.error('API connection test error:', error);
            return false;
        }
    }
}

export const api = new ApiService();
export type { User, AuthTokens, RequestOTPResponse, VerifyOTPResponse, AvatarResponse };

// Helper function to convert relative thumbnail paths to absolute URLs
const convertThumbnailToAbsoluteUrl = (thumbnail: string | null): string | null => {
    if (!thumbnail) return null;
    if (thumbnail.startsWith('http')) return thumbnail;
    return `${API_BASE_URL}${thumbnail}`;
};

// Articles API
export const articlesApi = {
    getAll: async (page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Article>> => {
        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.ARTICLES}?page=${page}&page_size=${pageSize}`);
        
        // If response is not paginated (for backward compatibility)
        if (Array.isArray(response.data)) {
            return {
                count: response.data.length,
                total_pages: 1,
                current_page: 1,
                next: null,
                previous: null,
                results: response.data.map((article: any) => ({
                    ...article,
                    id: article.id.toString(),
                    category: {
                        ...article.category,
                        id: article.category.id.toString()
                    },
                    tags: article.tags.map((tag: any) => ({
                        ...tag,
                        id: tag.id.toString()
                    })),
                    thumbnail: convertThumbnailToAbsoluteUrl(article.thumbnail),
                    description: article.summary || "",
                    date: article.published,
                    author: article.author || "نویسنده"
                }))
            };
        }
        
        // If response is paginated
        return {
            ...response.data,
            results: response.data.results.map((article: any) => ({
                ...article,
                id: article.id.toString(),
                category: {
                    ...article.category,
                    id: article.category.id.toString()
                },
                tags: article.tags.map((tag: any) => ({
                    ...tag,
                    id: tag.id.toString()
                })),
                thumbnail: convertThumbnailToAbsoluteUrl(article.thumbnail),
                description: article.summary || "",
                date: article.published_at,
                author: article.author || "نویسنده"
            }))
        };
    },
    
    getById: async (id: string): Promise<Article> => {
        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.ARTICLE_DETAIL(parseInt(id))}`);
        return {
            ...response.data,
            id: response.data.id.toString(),
            category: {
                ...response.data.category,
                id: response.data.category.id.toString()
            },
            tags: response.data.tags.map((tag: any) => ({
                ...tag,
                id: tag.id.toString()
            })),
            thumbnail: convertThumbnailToAbsoluteUrl(response.data.thumbnail),
            description: response.data.summary || "",
            date: response.data.published,
            author: response.data.author || "نویسنده"
        };
    }
};

// Videos API
export const videosApi = {
    getAll: async (page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Video>> => {
        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.VIDEOS}?page=${page}&page_size=${pageSize}`);
        
        // If response is not paginated (for backward compatibility)
        if (Array.isArray(response.data)) {
            return {
                count: response.data.length,
                total_pages: 1,
                current_page: 1,
                next: null,
                previous: null,
                results: response.data.map((video: any) => ({
                    ...video,
                    id: video.id.toString(),
                    author: typeof video.author === 'object' 
                        ? `${video.author.first_name} ${video.author.last_name}`.trim() || video.author.username || video.author.email
                        : video.author || "نویسنده",
                    category: {
                        ...video.category,
                        id: video.category.id.toString()
                    },
                    tags: video.tags.map((tag: any) => ({
                        ...tag,
                        id: tag.id.toString()
                    })),
                    thumbnail: convertThumbnailToAbsoluteUrl(video.thumbnail),
                    date: video.published_at || video.created_at
                }))
            };
        }
        
        // If response is paginated
        return {
            ...response.data,
            results: response.data.results.map((video: any) => ({
                ...video,
                id: video.id.toString(),
                author: typeof video.author === 'object' 
                    ? `${video.author.first_name} ${video.author.last_name}`.trim() || video.author.username || video.author.email
                    : video.author || "نویسنده",
                category: {
                    ...video.category,
                    id: video.category.id.toString()
                },
                tags: video.tags.map((tag: any) => ({
                    ...tag,
                    id: tag.id.toString()
                })),
                thumbnail: convertThumbnailToAbsoluteUrl(video.thumbnail),
                date: video.published_at || video.created_at
            }))
        };
    },
    
    getById: async (id: string): Promise<Video> => {
        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.VIDEO_DETAIL(parseInt(id))}`);
        return {
            ...response.data,
            id: response.data.id.toString(),
            author: typeof response.data.author === 'object' 
                ? `${response.data.author.first_name} ${response.data.author.last_name}`.trim() || response.data.author.username || response.data.author.email
                : response.data.author || "نویسنده",
            category: {
                ...response.data.category,
                id: response.data.category.id.toString()
            },
            tags: response.data.tags.map((tag: any) => ({
                ...tag,
                id: tag.id.toString()
            })),
            thumbnail: convertThumbnailToAbsoluteUrl(response.data.thumbnail),
            date: response.data.published_at || response.data.created_at
        };
    }
};

// Bookmarks API
export interface BookmarkResponse {
    id: number;
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

export const bookmarksApi = {
    getAll: async (): Promise<BookmarkResponse[]> => {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.BOOKMARKS}`, {
            headers: {
                'Authorization': `Bearer ${getAccessToken()}`,
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch bookmarks');
        }
        
        return response.json();
    },
    
    create: async (articleId: string): Promise<BookmarkResponse> => {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.BOOKMARKS}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getAccessToken()}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ article: parseInt(articleId) }),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.non_field_errors?.[0] || 'Failed to create bookmark');
        }
        
        return response.json();
    },
    
    delete: async (bookmarkId: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.BOOKMARK_DETAIL(parseInt(bookmarkId))}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAccessToken()}`,
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete bookmark');
        }
    },
    
    // Helper function to check if an article is bookmarked
    isBookmarked: async (articleId: string): Promise<boolean> => {
        try {
            const bookmarks = await bookmarksApi.getAll();
            return bookmarks.some(bookmark => bookmark.article.id === articleId);
        } catch (error) {
            console.error('Error checking bookmark status:', error);
            return false;
        }
    },
    
    // Helper function to find bookmark by article ID
    findByArticleId: async (articleId: string): Promise<BookmarkResponse | null> => {
        try {
            const bookmarks = await bookmarksApi.getAll();
            return bookmarks.find(bookmark => bookmark.article.id === articleId) || null;
        } catch (error) {
            console.error('Error finding bookmark:', error);
            return null;
        }
    }
};

// Podcasts API
export interface Podcast {
    id: string;
    title: string;
    slug: string;
    description: string;
    thumbnail: string | null;
    audio_type: string;
    audio_file: string | null;
    audio_url: string;
    duration: string;
    episode_number?: number;
    season_number?: number;
    transcript?: string;
    author: string;
    category: {
        id: string;
        name: string;
        slug: string;
        description: string;
    };
    tags: Array<{
        id: string;
        name: string;
        slug: string;
    }>;
    status: string;
    featured: boolean;
    created_at: string;
    updated_at: string;
    published_at: string | null;
    view_count: number;
    date: string;
}

// Livestream interface
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

export const podcastsApi = {
    getAll: async (page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Podcast>> => {
        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.PODCASTS}?page=${page}&page_size=${pageSize}`);
        
        // If response is not paginated (for backward compatibility)
        if (Array.isArray(response.data)) {
            return {
                count: response.data.length,
                total_pages: 1,
                current_page: 1,
                next: null,
                previous: null,
                results: response.data.map((podcast: any) => ({
                    ...podcast,
                    id: podcast.id.toString(),
                    author: typeof podcast.author === 'object' 
                        ? `${podcast.author.first_name} ${podcast.author.last_name}`.trim() || podcast.author.username || podcast.author.email
                        : podcast.author || "نویسنده",
                    category: {
                        ...podcast.category,
                        id: podcast.category.id.toString()
                    },
                    tags: podcast.tags.map((tag: any) => ({
                        ...tag,
                        id: tag.id.toString()
                    })),
                    thumbnail: convertThumbnailToAbsoluteUrl(podcast.thumbnail),
                    date: podcast.published_at || podcast.created_at
                }))
            };
        }
        
        // If response is paginated
        return {
            ...response.data,
            results: response.data.results.map((podcast: any) => ({
                ...podcast,
                id: podcast.id.toString(),
                author: typeof podcast.author === 'object' 
                    ? `${podcast.author.first_name} ${podcast.author.last_name}`.trim() || podcast.author.username || podcast.author.email
                    : podcast.author || "نویسنده",
                category: {
                    ...podcast.category,
                    id: podcast.category.id.toString()
                },
                tags: podcast.tags.map((tag: any) => ({
                    ...tag,
                    id: tag.id.toString()
                })),
                thumbnail: convertThumbnailToAbsoluteUrl(podcast.thumbnail),
                date: podcast.published_at || podcast.created_at
            }))
        };
    },
    
    getById: async (id: string): Promise<Podcast> => {
        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.PODCAST_DETAIL(parseInt(id))}`);
        return {
            ...response.data,
            id: response.data.id.toString(),
            author: typeof response.data.author === 'object' 
                ? `${response.data.author.first_name} ${response.data.author.last_name}`.trim() || response.data.author.username || response.data.author.email
                : response.data.author || "نویسنده",
            category: {
                ...response.data.category,
                id: response.data.category.id.toString()
            },
            tags: response.data.tags.map((tag: any) => ({
                ...tag,
                id: tag.id.toString()
            })),
            thumbnail: convertThumbnailToAbsoluteUrl(response.data.thumbnail),
            date: response.data.published_at || response.data.created_at
        };
    }
};

// Livestream API
export const livestreamsApi = {
    getAll: async (page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Livestream>> => {
        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.LIVESTREAMS}?page=${page}&page_size=${pageSize}`);
        
        // If response is not paginated (for backward compatibility)
        if (Array.isArray(response.data)) {
            return {
                count: response.data.length,
                total_pages: 1,
                current_page: 1,
                next: null,
                previous: null,
                results: response.data.map((livestream: any) => ({
                    ...livestream,
                    thumbnail: convertThumbnailToAbsoluteUrl(livestream.thumbnail)
                }))
            };
        }
        
        // If response is paginated
        return {
            ...response.data,
            results: response.data.results.map((livestream: any) => ({
                ...livestream,
                thumbnail: convertThumbnailToAbsoluteUrl(livestream.thumbnail)
            }))
        };
    },
    
    getById: async (id: string): Promise<Livestream> => {
        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.LIVESTREAM_DETAIL(parseInt(id))}`);
        return {
            ...response.data,
            thumbnail: convertThumbnailToAbsoluteUrl(response.data.thumbnail)
        };
    }
};

// Course types
export interface Course {
    id: string;
    title: string;
    instructor: string;
    thumbnail: string;
    description: string;
    price: number;
    totalLessons?: number;
    completedLessons?: number;
    createdAt: string;
    updatedAt: string;
    categories: string[];
    duration?: string;
    level?: "beginner" | "intermediate" | "advanced";
    is_enrolled?: boolean;
    progress_percentage?: number;
    discounted_price?: number;
    discount_percentage?: number;
    requires_identity_verification?: boolean;
    // New capacity fields
    has_capacity_limit?: boolean;
    capacity?: number;
    available_spots?: number;
    is_full?: boolean;
    student_count?: number;
}

// Courses API
export const coursesApi = {
    getAll: async (page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Course>> => {
        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.COURSES}?page=${page}&page_size=${pageSize}`);
        
        // If response is not paginated (for backward compatibility)
        if (Array.isArray(response.data)) {
            return {
                count: response.data.length,
                total_pages: 1,
                current_page: 1,
                next: null,
                previous: null,
                results: response.data.map((course: any) => ({
                    ...course,
                    id: course.id.toString(),
                    thumbnail: convertThumbnailToAbsoluteUrl(course.thumbnail)
                }))
            };
        }
        
        // If response is paginated
        return {
            ...response.data,
            results: response.data.results.map((course: any) => ({
                ...course,
                id: course.id.toString(),
                thumbnail: convertThumbnailToAbsoluteUrl(course.thumbnail),
                isFree: course.price === 0,
                createdAt: course.created_at,
                updatedAt: course.updated_at,
                categories: course.tags || [],
                duration: course.total_duration ? `${course.total_duration} دقیقه` : undefined,
                level: course.level || undefined,
                is_enrolled: course.is_enrolled || false,
                progress_percentage: course.progress_percentage || 0,
                discounted_price: course.discounted_price,
                discount_percentage: course.discount_percentage,
                requires_identity_verification: course.requires_identity_verification || false,
                // New capacity fields
                has_capacity_limit: course.has_capacity_limit || false,
                capacity: course.capacity,
                available_spots: course.available_spots,
                is_full: course.is_full || false,
                student_count: course.student_count
            }))
        };
    },
    
    getMyCourses: async (page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Course>> => {
        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.MY_COURSES}?page=${page}&page_size=${pageSize}`, {
            headers: {
                'Authorization': `Bearer ${getAccessToken()}`,
                'Content-Type': 'application/json',
            },
        });
        
        // If response is not paginated (for backward compatibility)
        if (Array.isArray(response.data)) {
            return {
                count: response.data.length,
                total_pages: 1,
                current_page: 1,
                next: null,
                previous: null,
                results: response.data.map((course: any) => ({
                    ...course,
                    id: course.id.toString(),
                    thumbnail: convertThumbnailToAbsoluteUrl(course.thumbnail)
                }))
            };
        }
        
        // If response is paginated
        return {
            ...response.data,
            results: response.data.results.map((course: any) => ({
                ...course,
                id: course.id.toString(),
                thumbnail: convertThumbnailToAbsoluteUrl(course.thumbnail),
                isFree: course.price === 0,
                createdAt: course.created_at,
                updatedAt: course.updated_at,
                categories: course.tags || [],
                duration: course.total_duration ? `${course.total_duration} دقیقه` : undefined,
                level: course.level || undefined,
                is_enrolled: course.is_enrolled || false,
                progress_percentage: course.progress_percentage || 0,
                discounted_price: course.discounted_price,
                discount_percentage: course.discount_percentage,
                requires_identity_verification: course.requires_identity_verification || false,
                // New capacity fields
                has_capacity_limit: course.has_capacity_limit || false,
                capacity: course.capacity,
                available_spots: course.available_spots,
                is_full: course.is_full || false,
                student_count: course.student_count
            }))
        };
    },
    
    getById: async (id: string): Promise<Course> => {
        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.COURSE_DETAIL(id)}`);
        return {
            ...response.data,
            id: response.data.id.toString(),
            thumbnail: convertThumbnailToAbsoluteUrl(response.data.thumbnail)
        };
    }
};

// Helper function to get access token
function getAccessToken(): string | null {
    const tokens = localStorage.getItem('auth_tokens');
    if (tokens) {
        try {
            const parsed = JSON.parse(tokens);
            return parsed.access;
        } catch {
            return null;
        }
    }
    return null;
}
