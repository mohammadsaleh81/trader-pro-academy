import { API_BASE_URL, API_ENDPOINTS, TOKEN_STORAGE_KEY } from './config';
import axios from './axios';

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

    private getStoredTokens(): AuthTokens | null {
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
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REQUEST_OTP}`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ phone_number: phoneNumber }),
        });

        if (!response.ok) {
            throw new Error('Failed to request OTP');
        }

        return response.json();
    }

    async verifyOTP(phoneNumber: string, code: string): Promise<VerifyOTPResponse> {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.VERIFY_OTP}`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ phone_number: phoneNumber, code }),
        });

        if (!response.ok) {
            throw new Error('Failed to verify OTP');
        }

        const data = await response.json();
        this.setStoredTokens({
            access: data.access,
            refresh: data.refresh,
        });

        return data;
    }

    async getProfile(): Promise<User> {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PROFILE}`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            throw new Error('Failed to get profile');
        }

        return response.json();
    }

    async updateProfile(data: Partial<User>): Promise<User> {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PROFILE}`, {
            method: 'PUT',
            headers: this.getHeaders(true),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Failed to update profile');
        }

        return response.json();
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
    getAll: async (): Promise<Article[]> => {
        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.ARTICLES}`);
        return response.data.map((article: any) => ({
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
        }));
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
    getAll: async (): Promise<Video[]> => {
        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.VIDEOS}`);
        return response.data.map((video: any) => ({
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
        }));
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
    audio_file: string;
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

export const podcastsApi = {
    getAll: async (): Promise<Podcast[]> => {
        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.PODCASTS}`);
        return response.data.map((podcast: any) => ({
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
        }));
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
