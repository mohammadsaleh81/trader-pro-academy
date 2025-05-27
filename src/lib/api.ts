import { API_BASE_URL, API_ENDPOINTS, TOKEN_STORAGE_KEY } from './config';

interface AuthTokens {
    access: string;
    refresh: string;
}

interface User {
    id: number;
    phone_number: string;
    first_name: string;
    last_name: string;
    email: string;
    is_phone_verified: boolean;
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

    logout(): void {
        this.clearStoredTokens();
    }
}

export const api = new ApiService();
export type { User, AuthTokens, RequestOTPResponse, VerifyOTPResponse, AvatarResponse }; 