// export const API_BASE_URL = 'http://91.99.49.130:8000';
export const API_BASE_URL = 'https://api.gport.sbs';

export const API_ENDPOINTS = {
    // Auth endpoints
    REQUEST_OTP: '/user/auth/request-otp/',
    VERIFY_OTP: '/user/auth/verify-otp/',
    REFRESH_TOKEN: '/user/auth/token/refresh/',
    
    // Profile endpoints
    PROFILE: '/user/profile/',
    AVATAR: '/user/profile/avatar/',
    
    // Content endpoints
    ARTICLES: '/content/articles/',
    ARTICLE_DETAIL: (id: number) => `/content/articles/${id}/`,
    VIDEOS: '/content/videos/',
    VIDEO_DETAIL: (id: number) => `/content/videos/${id}/`,
    PODCASTS: '/content/podcasts/',
    PODCAST_DETAIL: (id: number) => `/content/podcasts/${id}/`,
    
    // Bookmark endpoints
    BOOKMARKS: '/content/bookmarks/',
    BOOKMARK_DETAIL: (id: number) => `/content/bookmarks/${id}/`,
    
    // Like endpoints
    LIKES: '/content/likes/',
    LIKE_DETAIL: (id: number) => `/content/likes/${id}/`,
    
    // Comment endpoints
    COMMENTS: '/content/comments/',
    COMMENT_DETAIL: (id: number) => `/content/comments/${id}/`,
    ARTICLE_COMMENTS: (id: string) => `/content/articles/${id}/comments/`,
    VIDEO_COMMENTS: (id: string) => `/content/videos/${id}/comments/`,
    PODCAST_COMMENTS: (id: string) => `/content/podcasts/${id}/comments/`,
    MEDIA_COMMENTS: '/content/media-comments/',
    MEDIA_COMMENTS_LIST: '/content/media-comments/list/',
    MEDIA_COMMENT_DETAIL: (id: string) => `/content/media-comments/${id}/`,
    
    // Course endpoints
    COURSES: '/courses/',
    COURSE_DETAIL: (slug: string) => `/courses/${slug}/`,
    COURSE_LEARN: (courseId: string) => `/crs/courses/${courseId}/learn/`,
    COURSE_ENROLL: (courseId: string) => `/courses/${courseId}/enroll/`,
    MY_COURSES: '/courses/my-courses/',
    LESSON_PROGRESS: (courseId: string, lessonId: string) => `/crs/courses/${courseId}/lessons/${lessonId}/progress/`,
    LESSON_COMPLETE: (courseId: string, lessonId: string) => `/crs/courses/${courseId}/lessons/${lessonId}/complete/`,
    
    // Order endpoints
    ORDERS: '/orders/',
    ORDER_CREATE: '/orders/create/',
    ORDER_DETAIL: (id: string) => `/orders/${id}/`,
    MY_ORDERS: '/orders/my-orders/',
    
    // Payment endpoints
    PAYMENT_REQUEST: '/payment/request/',
    PAYMENT_VERIFY: '/payment/verify/',
    PAYMENT_CALLBACK: '/payment/callback/',
    
    // Wallet endpoints
    WALLET_BALANCE: '/wallet/balance/',
    WALLET_TRANSACTIONS: '/wallet/transactions/',
    WALLET_DEPOSIT: '/wallet/deposit/',
    WALLET_WITHDRAW: '/wallet/withdraw/',
} as const;

// Default images
export const DEFAULT_IMAGES = {
    USER_AVATAR: `${API_BASE_URL}/media/user.png`,
    PLACEHOLDER_CONTENT: "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image",
    COURSE_THUMBNAIL: "https://placehold.co/400x300/e2e8f0/64748b?text=Course",
} as const;

export const TOKEN_STORAGE_KEY = 'auth_tokens';

// Payment status constants
export const PAYMENT_STATUS = {
    PENDING: 'pending',
    SUCCESS: 'success',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
} as const;

// Order status constants
export const ORDER_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
} as const;
