
import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/axios";
import { Article, Video, articlesApi, videosApi } from "@/lib/api";

// Course Types
export type CourseLesson = {
  id: string;
  chapter: string;
  title: string;
  content: string;
  content_type: string;
  video_url: string;
  duration: number;
  order: number;
  is_free_preview: boolean;
  points: number;
  progress: number | null;
};

export type CourseChapter = {
  id: string;
  course: string;
  title: string;
  description: string;
  order: number;
  lessons: CourseLesson[];
  total_duration: number;
};

export type CourseUser = {
  id: string;
  username: string | null;
  email: string;
  first_name: string;
  last_name: string;
};

export type CourseComment = {
  id: string;
  user: CourseUser;
  content: string;
  replies: CourseComment[];
  created_at: string;
};

// Course Progress Types
export type CourseProgressData = {
  completion_percentage: number;
  completed_lessons: number;
  total_lessons: number;
  in_progress_lessons: number;
  watched_duration: number;
  total_duration: number;
  time_spent_percentage: number;
  last_activity: string | null;
};

export type ChapterProgress = {
  id: string;
  title: string;
  order: number;
  progress_percentage: number;
};

export type NextLesson = {
  id: string;
  title: string;
  chapter: string;
  order: number;
};

export type CourseEnrollment = {
  id: string;
  user: string;
  course: string;
  course_title: string;
  price_paid: string;
  discount_used: number | null;
  status: string;
  created_at: string;
  completion_date: string | null;
  progress_percentage: number;
  progress: CourseProgressData;
  chapters_progress: ChapterProgress[];
  next_lesson: NextLesson;
};

export type UserProgress = {
  enrollment: CourseEnrollment;
  course_progress: CourseProgressData;
  chapter_progress: ChapterProgress[];
};

export type CourseDetails = {
  info: {
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
    total_lessons: number;
    total_chapters: number;
    average_rating: number;
    total_students: number;
    language: string;
    level: "beginner" | "intermediate" | "advanced" | string;
    is_enrolled?: boolean;
  };
  chapters: CourseChapter[];
  comments: CourseComment[];
  user_progress?: UserProgress;
};

export type Course = {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  description: string;
  price: number;
  rating: number;
  totalLessons?: number;
  completedLessons?: number;
  createdAt: string;
  updatedAt: string;
  categories: string[];
  duration?: string;
  level?: "beginner" | "intermediate" | "advanced";
  is_enrolled?: boolean;
  progress_percentage?: number;
};

// Content Types
export type Podcast = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  audioUrl: string;
  author: string;
  date: string;
  duration: string;
  tags: string[];
};

export type Webinar = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  author: string;
  date: string;
  duration: string;
  tags: string[];
  isLive: boolean;
  startTime: string;
};

export type File = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  fileUrl: string;
  author: string;
  date: string;
  fileSize: string;
  fileType: string;
  tags: string[];
};

// Item Types for bookmarks
export type ItemType = "article" | "podcast" | "video" | "webinar" | "file" | "course";

// Bookmark Type
export type Bookmark = {
  id: string;
  itemId: string;
  itemType: ItemType;
  userId: string;
  date: string;
};

// Comment Type
export type Comment = {
  id: string;
  itemId: string;
  itemType: ItemType;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  date: string;
  rating?: number;
};

// Transaction Type for Wallet
export type Transaction = {
  amount: string;
  transaction_type: "deposit" | "withdrawal" | "purchase";
  description: string;
  created_at: string;
  balance_after: string;
};

// Wallet Type
export type Wallet = {
  balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  transactions: Transaction[];
};

// Context Type
interface DataContextType {
  courses: Course[];
  myCourses: Course[];
  articles: Article[];
  podcasts: Podcast[];
  videos: Video[];
  webinars: Webinar[];
  files: File[];
  bookmarks: Bookmark[];
  comments: Comment[];
  wallet: Wallet | null;
  addBookmark: (itemId: string, itemType: ItemType, userId: string) => void;
  removeBookmark: (id: string) => void;
  addComment: (comment: Omit<Comment, "id" | "date">) => void;
  enrollCourse: (courseId: string, userId: string) => void;
  updateWallet: (amount: number) => Promise<{ success: boolean; new_balance?: number; error?: string }>;
  fetchCourseDetails: (slug: string) => Promise<CourseDetails | null>;
  isLoading: {
    articles: boolean;
    videos: boolean;
  };
}

// Create Context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Data Provider Component
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState({
    articles: true,
    videos: true
  });

  // Fetch articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(prev => ({ ...prev, articles: true }));
        const data = await articlesApi.getAll();
        setArticles(data);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setIsLoading(prev => ({ ...prev, articles: false }));
      }
    };

    fetchArticles();
  }, []);

  // Fetch videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(prev => ({ ...prev, videos: true }));
        const data = await videosApi.getAll();
        setVideos(data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setIsLoading(prev => ({ ...prev, videos: false }));
      }
    };

    fetchVideos();
  }, []);

  // Fetch course details
  const fetchCourseDetails = async (slug: string): Promise<CourseDetails | null> => {
    try {
      const response = await api.get(`/crs/courses/${slug}/?include_comments=true&include_chapters=true`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course details:', error);
      return null;
    }
  };

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const auth = localStorage.getItem('auth_tokens');
        const access_token = JSON.parse(auth || '{}').access;
        const response = await api.get(
          '/crs/courses/',
          access_token ? {
            headers: {
              'Authorization': `Bearer ${access_token}`
            }
          } : undefined
        );
        
        // Transform API data to match our Course type
        const transformedCourses = response.data.map((course: any) => ({
          id: course.id.toString(),
          title: course.title,
          instructor: course.instructor_name || "Unknown Instructor",
          thumbnail: course.thumbnail,
          description: "",  // API doesn't provide description
          price: parseFloat(course.price),
          rating: course.rating_avg,
          totalLessons: undefined,  // API doesn't provide this
          completedLessons: undefined,  // API doesn't provide this
          createdAt: course.created,
          updatedAt: course.created,  // Using created as update date since API doesn't provide updated
          categories: course.tags || [],
          duration: course.total_duration ? `${course.total_duration} دقیقه` : undefined,
          level: course.level as "beginner" | "intermediate" | "advanced",
          is_enrolled: course.is_enrolled
        }));

        setCourses(transformedCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
      }
    };

    fetchCourses();
  }, []);

  // Fetch my courses from API
  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const auth = localStorage.getItem('auth_tokens');
        if (!auth) return;
        
        const access_token = JSON.parse(auth).access;
        const response = await api.get('/crs/my-courses/', {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        });
        
        // Transform API data to match our Course type
        const transformedCourses = response.data.map((course: any) => ({
          id: course.id.toString(),
          title: course.title,
          instructor: course.instructor_name || "Unknown Instructor",
          thumbnail: course.thumbnail,
          description: "",
          price: parseFloat(course.price),
          rating: course.rating_avg,
          totalLessons: undefined,
          completedLessons: undefined,
          createdAt: course.created,
          updatedAt: course.created,
          categories: course.tags || [],
          duration: course.total_duration ? `${course.total_duration} دقیقه` : undefined,
          level: course.level as "beginner" | "intermediate" | "advanced",
          is_enrolled: true,
          progress_percentage: course.progress_percentage
        }));

        setMyCourses(transformedCourses);
      } catch (error) {
        console.error('Error fetching my courses:', error);
        setMyCourses([]);
      }
    };

    fetchMyCourses();
  }, []);

  // Fetch wallet balance and transactions
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const auth = localStorage.getItem('auth_tokens');
        if (!auth) return;
        
        const access_token = JSON.parse(auth).access;
        const headers = {
          'Authorization': `Bearer ${access_token}`
        };

        // Fetch balance
        const balanceResponse = await api.get('/wallet/balance/', { headers });
        
        // Fetch transactions
        const transactionsResponse = await api.get('/wallet/transactions/', { headers });
        
        setWallet({
          balance: parseFloat(balanceResponse.data.balance),
          is_active: balanceResponse.data.is_active,
          created_at: balanceResponse.data.created_at,
          updated_at: balanceResponse.data.updated_at,
          transactions: transactionsResponse.data
        });
      } catch (error) {
        console.error('Error fetching wallet data:', error);
        setWallet(null);
      }
    };

    fetchWalletData();
  }, []);

  const addBookmark = (itemId: string, itemType: ItemType, userId: string) => {
    const newBookmark: Bookmark = {
      id: Math.random().toString(),
      itemId,
      itemType,
      userId,
      date: new Date().toISOString(),
    };
    setBookmarks([...bookmarks, newBookmark]);
  };

  const removeBookmark = (id: string) => {
    setBookmarks(bookmarks.filter((bookmark) => bookmark.id !== id));
  };

  const addComment = (comment: Omit<Comment, "id" | "date">) => {
    const newComment: Comment = {
      ...comment,
      id: Math.random().toString(),
      date: new Date().toISOString(),
    };
    setComments([...comments, newComment]);
  };

  const enrollCourse = (courseId: string, userId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (course && !myCourses.find((c) => c.id === courseId)) {
      setMyCourses([...myCourses, { ...course, completedLessons: 0 }]);
    }
  };

  const updateWallet = async (amount: number) => {
    try {
      const auth = localStorage.getItem('auth_tokens');
      if (!auth || !wallet) {
        return { success: false, error: "Not authenticated or wallet not initialized" };
      }
      
      const access_token = JSON.parse(auth).access;
      const response = await api.post('/wallet/deposit/', 
        { amount },
        {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        }
      );
      
      if (response.data.message === "Deposit successful") {
        setWallet(prev => prev ? {
          ...prev,
          balance: response.data.new_balance,
          updated_at: new Date().toISOString()
        } : null);
        
        return { success: true, new_balance: response.data.new_balance };
      }
      
      return { success: false, error: "Deposit failed" };
    } catch (error) {
      console.error('Error updating wallet:', error);
      return { success: false, error: "An error occurred" };
    }
  };

  return (
    <DataContext.Provider
      value={{
        courses,
        myCourses,
        articles,
        podcasts,
        videos,
        webinars,
        files,
        bookmarks,
        comments,
        wallet,
        addBookmark,
        removeBookmark,
        addComment,
        enrollCourse,
        updateWallet,
        fetchCourseDetails,
        isLoading
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// Custom Hook for using the context
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
