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

// Course detail types
export interface CourseDetailResponse {
    id: number;
    slug: string;
    title: string;
    description: string;
    instructor_name: string;
    cover_image_url: string;
    price: number;
    category_name: string;
    is_enrolled: boolean;
    progress?: number;
    chapters: Chapter[];
}

export interface Chapter {
    id: number;
    title: string;
    order: number;
    lessons: Lesson[];
}

export interface Lesson {
    id: number;
    title: string;
    lesson_type: string;
    order: number;
    is_completed: boolean;
}

export interface UserCourse {
    id: number;
    slug: string;
    title: string;
    cover_image_url: string;
    progress: number;
}

export interface OrderData {
    items: Array<{
        item_id: number;
        item_type: string;
        quantity: number;
        unit_price: number;
    }>;
}

export interface PaymentRequest {
    order_id: number;
    amount: number;
}

export interface PaymentVerification {
    order_id: number;
    authority: string;
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

    async getCourseDetail(slug: string): Promise<CourseDetailResponse> {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.COURSE_DETAIL(slug)}`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            throw new Error('Failed to get course details');
        }

        return response.json();
    }

    async getMyCourses(): Promise<UserCourse[]> {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MY_COURSES}`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            throw new Error('Failed to get my courses');
        }

        return response.json();
    }

    async markLessonProgress(lessonId: number): Promise<any> {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LESSON_PROGRESS}`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify({ lesson_id: lessonId }),
        });

        if (!response.ok) {
            throw new Error('Failed to mark lesson progress');
        }

        return response.json();
    }

    async createOrder(orderData: OrderData): Promise<any> {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CREATE_ORDER}`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            throw new Error('Failed to create order');
        }

        return response.json();
    }

    async requestPayment(paymentData: PaymentRequest): Promise<any> {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REQUEST_PAYMENT}`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(paymentData),
        });

        if (!response.ok) {
            throw new Error('Failed to request payment');
        }

        return response.json();
    }

    async verifyPayment(verificationData: PaymentVerification): Promise<any> {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.VERIFY_PAYMENT}`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(verificationData),
        });

        if (!response.ok) {
            throw new Error('Failed to verify payment');
        }

        return response.json();
    }

    login = this.verifyOTP;

    logout(): void {
        this.clearStoredTokens();
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
