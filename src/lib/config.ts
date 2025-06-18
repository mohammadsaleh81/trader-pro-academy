// Check if we're running locally and adjust API URL accordingly
const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname.includes('91.99.49.130');

// Primary API URL
export const API_BASE_URL = 'http://127.0.0.1:8000';

// Fallback API URL for development
export const API_BASE_URL_FALLBACK = 'http://91.99.49.130:8000';

// Debug log for development
if (process.env.NODE_ENV === 'development') {
  console.log('Current hostname:', window.location.hostname);
  console.log('Using API_BASE_URL:', API_BASE_URL);
  console.log('Fallback URL available:', API_BASE_URL_FALLBACK);
}

export const API_ENDPOINTS = {
    REQUEST_OTP: '/user/auth/request-otp/',
    VERIFY_OTP: '/user/auth/verify-otp/',
    PROFILE: '/user/profile/',
    AVATAR: '/user/profile/avatar/',
    ARTICLES: '/content/articles/',
    ARTICLE_DETAIL: (id: number) => `/content/articles/${id}/`,
    VIDEOS: '/content/videos/',
    VIDEO_DETAIL: (id: number) => `/content/videos/${id}/`,
    PODCASTS: '/content/podcasts/',
    PODCAST_DETAIL: (id: number) => `/content/podcasts/${id}/`,
    LIVESTREAMS: '/content/livestreams/',
    LIVESTREAM_DETAIL: (id: number) => `/content/livestreams/${id}/`,
    // Bookmark endpoints
    BOOKMARKS: '/content/bookmarks/',
    BOOKMARK_DETAIL: (id: number) => `/content/bookmarks/${id}/`,
    // Like endpoints
    LIKES: '/content/likes/',
    LIKE_DETAIL: (id: number) => `/content/likes/${id}/`,
    // Comment endpoints
    COMMENTS: '/content/comments/',
    COMMENT_DETAIL: (id: number) => `/content/comments/${id}/`,
    // Article comment endpoints
    ARTICLE_COMMENTS: (id: string) => `/content/articles/${id}/comments/`,
    // Video comment endpoints  
    VIDEO_COMMENTS: (id: string) => `/content/videos/${id}/comments/`,
    // Podcast comment endpoints
    PODCAST_COMMENTS: (id: string) => `/content/podcasts/${id}/comments/`,
    // Generic media comment endpoints
    MEDIA_COMMENTS: '/content/media-comments/',
    MEDIA_COMMENTS_LIST: '/content/media-comments/list/',
    MEDIA_COMMENT_DETAIL: (id: string) => `/content/media-comments/${id}/`,
    // Course endpoints
    COURSES: '/crs/courses/',
    COURSE_DETAIL: (id: string) => `/crs/courses/${id}/`,
    COURSE_LEARN: (courseId: string) => `/crs/courses/${courseId}/learn/`,
    LESSON_PROGRESS: (courseId: string, lessonId: string) => `/crs/courses/${courseId}/lessons/${lessonId}/progress/`,
    LESSON_COMPLETE: (courseId: string, lessonId: string) => `/crs/courses/${courseId}/lessons/${lessonId}/complete/`,
    MY_COURSES: '/crs/my-courses/',
} as const;

// Default images
export const DEFAULT_IMAGES = {
    USER_AVATAR: `${API_BASE_URL}/media/user.png`,
    PLACEHOLDER_CONTENT: "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image",
} as const;

export const TOKEN_STORAGE_KEY = 'auth_tokens'; 