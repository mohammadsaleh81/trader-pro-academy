
export const API_BASE_URL = 'https://api.gport.sbs';

export const API_ENDPOINTS = {
    REQUEST_OTP: '/user/auth/request-otp/',
    VERIFY_OTP: '/user/auth/verify-otp/',
    PROFILE: '/user/profile/',
    AVATAR: '/user/profile/avatar/',
    ARTICLES: '/content/articles/',
    ARTICLE_DETAIL: (id: number) => `/content/articles/${id}/`,
    VIDEOS: '/content/videos/',
    VIDEO_DETAIL: (id: number) => `/content/videos/${id}/`,
    
    // Course endpoints
    COURSE_DETAIL: (slug: string) => `/api/v1/courses/${slug}/`,
    MY_COURSES: '/api/v1/courses/my-courses/',
    LESSON_PROGRESS: '/api/v1/courses/lesson-progress/',
    
    // Order and payment endpoints
    CREATE_ORDER: '/api/v1/orders/create/',
    REQUEST_PAYMENT: '/api/v1/payment/request/',
    VERIFY_PAYMENT: '/api/v1/payment/verify/',
} as const;

export const TOKEN_STORAGE_KEY = 'auth_tokens';
