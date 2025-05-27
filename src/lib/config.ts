export const API_BASE_URL = 'https://api.gport.sbs';


export const API_ENDPOINTS = {
    REQUEST_OTP: '/user/auth/request-otp/',
    VERIFY_OTP: '/user/auth/verify-otp/',
    PROFILE: '/user/profile/',
    AVATAR: '/user/profile/avatar/',
} as const;

export const TOKEN_STORAGE_KEY = 'auth_tokens'; 