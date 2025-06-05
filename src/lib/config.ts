
export const API_BASE_URL = 'https://api.gport.sbs';

export const API_ENDPOINTS = {
    // User Management - prefix: user/
    REQUEST_OTP: '/user/auth/request-otp/',
    VERIFY_OTP: '/user/auth/verify-otp/',
    PROFILE: '/user/profile/',
    COMPLETE_PROFILE: '/user/complete-profile/',
    CHANGE_PASSWORD: '/user/change-password/',
    AVATAR: '/user/profile/avatar/',
    TOKEN_REFRESH: '/user/token/refresh/',
    TOKEN_VERIFY: '/user/token/verify/',
    
    // Blog/Content - prefix: blog/ (but current API uses /content/)
    ARTICLES: '/content/articles/',
    ARTICLE_DETAIL: (id: number) => `/content/articles/${id}/`,
    VIDEOS: '/content/videos/',
    VIDEO_DETAIL: (id: number) => `/content/videos/${id}/`,
    
    // Course endpoints - prefix: courses/
    COURSES: '/courses/',
    COURSE_DETAIL: (slug: string) => `/courses/${slug}/`,
    COURSE_CATEGORIES: '/courses/categories/',
    CATEGORY_DETAIL: (slug: string) => `/courses/categories/${slug}/`,
    MY_COURSES: '/courses/my-courses/',
    LESSON_PROGRESS: '/courses/lesson-progress/',
    SEARCH_COURSES: '/courses/search/',
    COURSE_COMMENTS: (slug: string) => `/courses/${slug}/comments/`,
    COURSE_COMMENT_DETAIL: (commentId: number) => `/courses/comments/${commentId}/`,
    COURSE_CHAPTERS: (slug: string) => `/courses/${slug}/chapters/`,
    CHAPTER_LESSONS: (slug: string, chapterId: number) => `/courses/${slug}/chapters/${chapterId}/lessons/`,
    LESSON_DETAIL: (slug: string, chapterId: number, lessonId: number) => `/courses/${slug}/chapters/${chapterId}/lessons/${lessonId}/`,
    
    // Order endpoints - prefix: orders/
    CREATE_ORDER: '/orders/create/',
    MY_ORDERS: '/orders/my-orders/',
    ORDER_DETAIL: (orderId: number) => `/orders/${orderId}/`,
    
    // Payment endpoints - prefix: payment/
    REQUEST_PAYMENT: '/payment/request/',
    VERIFY_PAYMENT: '/payment/verify/',
    
    // Wallet endpoints - prefix: wallet/
    WALLET_TRANSACTIONS: '/wallet/transactions/',
    WALLET_BALANCE: '/wallet/balance/',
    CHARGE_WALLET: '/wallet/charge/',
} as const;

export const TOKEN_STORAGE_KEY = 'auth_tokens';
