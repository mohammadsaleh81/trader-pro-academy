
import React, { createContext, useContext, useState, useEffect } from "react";

// Define course type
export type Course = {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  price: number;
  rating: number;
  totalLessons: number;
  completedLessons?: number;
  categories: string[];
  duration: string;
  level: "beginner" | "intermediate" | "advanced";
};

// Define content types
export type ContentItem = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  date: string;
  category: string;
  author: string;
};

export type Article = ContentItem;
export type Podcast = ContentItem & { duration: string };
export type Video = ContentItem & { duration: string };
export type Webinar = ContentItem & { 
  startDate: string;
  duration: string;
  isLive: boolean;
};
export type File = ContentItem & { fileSize: string; fileType: string; };

// Define bookmark type
export type Bookmark = {
  id: string;
  itemId: string;
  itemType: "course" | "article" | "podcast" | "video" | "webinar" | "file";
  userId: string;
  dateAdded: string;
};

// Define comment type
export type Comment = {
  id: string;
  itemId: string;
  itemType: "course" | "article" | "podcast" | "video" | "webinar" | "file";
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  rating?: number;
  date: string;
};

// Define wallet type
export type Wallet = {
  id: string;
  userId: string;
  balance: number;
  transactions: Transaction[];
};

export type Transaction = {
  id: string;
  walletId: string;
  amount: number;
  type: "deposit" | "withdrawal" | "purchase";
  description: string;
  date: string;
};

type DataContextType = {
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
  addBookmark: (itemId: string, itemType: Bookmark["itemType"], userId: string) => void;
  removeBookmark: (id: string) => void;
  addComment: (comment: Omit<Comment, "id" | "date">) => void;
  enrollCourse: (courseId: string, userId: string) => void;
  updateCourseProgress: (courseId: string, completedLessons: number) => void;
};

// Mock data
const mockCourses: Course[] = [
  {
    id: "1",
    title: "مبانی تحلیل تکنیکال در بازار فارکس",
    description: "آشنایی با اصول اولیه تحلیل تکنیکال و کاربرد آن در معاملات فارکس",
    instructor: "استاد تریدر",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop",
    price: 1200000,
    rating: 4.7,
    totalLessons: 12,
    categories: ["فارکس", "تحلیل تکنیکال"],
    duration: "24 ساعت",
    level: "beginner"
  },
  {
    id: "2",
    title: "استراتژی‌های پیشرفته معاملات ارزهای دیجیتال",
    description: "یادگیری استراتژی‌های حرفه‌ای برای سرمایه‌گذاری موفق در ارزهای دیجیتال",
    instructor: "دکتر کریپتو",
    thumbnail: "https://images.unsplash.com/photo-1609554496796-c345a5335ceb?q=80&w=2069&auto=format&fit=crop",
    price: 1500000,
    rating: 4.9,
    totalLessons: 15,
    categories: ["ارز دیجیتال", "استراتژی"],
    duration: "30 ساعت",
    level: "advanced"
  },
  {
    id: "3",
    title: "مدیریت سرمایه و ریسک در بازارهای مالی",
    description: "آموزش تکنیک‌های حرفه‌ای مدیریت سرمایه و کنترل ریسک برای تریدرها",
    instructor: "استاد مدیریت",
    thumbnail: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?q=80&w=2070&auto=format&fit=crop",
    price: 980000,
    rating: 4.5,
    totalLessons: 10,
    categories: ["مدیریت سرمایه", "ریسک"],
    duration: "18 ساعت",
    level: "intermediate"
  },
  {
    id: "4",
    title: "آشنایی با تحلیل بنیادی در بازار سهام",
    description: "یادگیری اصول تحلیل بنیادی شرکت‌ها و کاربرد آن در سرمایه‌گذاری",
    instructor: "استاد بنیادی",
    thumbnail: "https://images.unsplash.com/photo-1612010167108-3e6b327405f0?q=80&w=2070&auto=format&fit=crop",
    price: 1100000,
    rating: 4.6,
    totalLessons: 14,
    categories: ["سهام", "تحلیل بنیادی"],
    duration: "28 ساعت",
    level: "beginner"
  }
];

const mockArticles: Article[] = [
  {
    id: "1",
    title: "اصول موفقیت در معاملات نوسانی",
    description: "در این مقاله با تکنیک‌های موفقیت در معاملات نوسانی آشنا خواهید شد",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop",
    date: "1402/02/15",
    category: "استراتژی معاملاتی",
    author: "استاد تریدر"
  },
  {
    id: "2",
    title: "بهترین ارزهای دیجیتال برای سرمایه‌گذاری در سال 1402",
    description: "معرفی و بررسی پتانسیل ارزهای دیجیتال برتر برای سرمایه‌گذاری",
    thumbnail: "https://images.unsplash.com/photo-1609554496796-c345a5335ceb?q=80&w=2069&auto=format&fit=crop",
    date: "1402/03/10",
    category: "ارز دیجیتال",
    author: "دکتر کریپتو"
  }
];

const mockPodcasts: Podcast[] = [
  {
    id: "1",
    title: "گفتگو با تریدرهای موفق",
    description: "در این پادکست با داستان موفقیت تریدرهای برتر آشنا می‌شوید",
    thumbnail: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=2070&auto=format&fit=crop",
    date: "1402/04/20",
    category: "مصاحبه",
    author: "مستر تریدر",
    duration: "45 دقیقه"
  },
  {
    id: "2",
    title: "تحلیل هفتگی بازار ارزهای دیجیتال",
    description: "بررسی وضعیت بازار ارزهای دیجیتال و پیش‌بینی روند آینده",
    thumbnail: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=2074&auto=format&fit=crop",
    date: "1402/04/25",
    category: "تحلیل بازار",
    author: "دکتر کریپتو",
    duration: "30 دقیقه"
  }
];

const mockVideos: Video[] = [
  {
    id: "1",
    title: "آموزش تحلیل نمودارها با الگوهای هارمونیک",
    description: "در این ویدیو با الگوهای هارمونیک و کاربرد آنها در تحلیل تکنیکال آشنا می‌شوید",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop",
    date: "1402/01/15",
    category: "تحلیل تکنیکال",
    author: "استاد هارمونیک",
    duration: "25 دقیقه"
  },
  {
    id: "2",
    title: "معرفی ابزارهای تحلیل بازار",
    description: "بررسی و معرفی بهترین ابزارهای تحلیل بازار برای تریدرها",
    thumbnail: "https://images.unsplash.com/photo-1642543348571-57dd85b96d89?q=80&w=2072&auto=format&fit=crop",
    date: "1402/02/05",
    category: "ابزارهای معاملاتی",
    author: "مستر تریدر",
    duration: "18 دقیقه"
  }
];

const mockWebinars: Webinar[] = [
  {
    id: "1",
    title: "وبینار زنده: استراتژی‌های سودآوری در بازار نزولی",
    description: "در این وبینار با استراتژی‌های سودآوری در شرایط نزولی بازار آشنا می‌شوید",
    thumbnail: "https://images.unsplash.com/photo-1591115765373-5207764f72e4?q=80&w=2070&auto=format&fit=crop",
    date: "1402/06/10",
    category: "استراتژی معاملاتی",
    author: "استاد تریدر",
    startDate: "1402/06/10 18:00",
    duration: "2 ساعت",
    isLive: true
  },
  {
    id: "2",
    title: "وبینار: اصول مدیریت پورتفولیو ارزهای دیجیتال",
    description: "آموزش اصول مدیریت پورتفولیو ارزهای دیجیتال برای سرمایه‌گذاران",
    thumbnail: "https://images.unsplash.com/photo-1642543348571-57dd85b96d89?q=80&w=2072&auto=format&fit=crop",
    date: "1402/05/20",
    category: "مدیریت سرمایه",
    author: "دکتر کریپتو",
    startDate: "1402/05/20 19:00",
    duration: "1.5 ساعت",
    isLive: false
  }
];

const mockFiles: File[] = [
  {
    id: "1",
    title: "شیت تحلیل تکنیکال",
    description: "فایل اکسل برای ثبت و پیگیری تحلیل‌های تکنیکال",
    thumbnail: "https://images.unsplash.com/photo-1537314386406-5e8e8ba55cf4?q=80&w=2074&auto=format&fit=crop",
    date: "1402/01/05",
    category: "ابزارهای معاملاتی",
    author: "مستر تریدر",
    fileSize: "1.2 MB",
    fileType: "XLSX"
  },
  {
    id: "2",
    title: "راهنمای جامع معاملات مارجین",
    description: "کتاب الکترونیکی آموزش جامع معاملات مارجین و اهرمی",
    thumbnail: "https://images.unsplash.com/photo-1544982503-9f984c14501a?q=80&w=1918&auto=format&fit=crop",
    date: "1402/02/15",
    category: "آموزشی",
    author: "استاد مارجین",
    fileSize: "5.8 MB",
    fileType: "PDF"
  }
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [articles] = useState<Article[]>(mockArticles);
  const [podcasts] = useState<Podcast[]>(mockPodcasts);
  const [videos] = useState<Video[]>(mockVideos);
  const [webinars] = useState<Webinar[]>(mockWebinars);
  const [files] = useState<File[]>(mockFiles);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>({
    id: "1",
    userId: "1",
    balance: 2500000,
    transactions: [
      {
        id: "1",
        walletId: "1",
        amount: 1500000,
        type: "deposit",
        description: "شارژ کیف پول",
        date: "1402/03/15"
      },
      {
        id: "2",
        walletId: "1",
        amount: 1000000,
        type: "deposit",
        description: "شارژ کیف پول",
        date: "1402/04/10"
      }
    ]
  });

  useEffect(() => {
    // Load saved data from localStorage
    const savedMyCourses = localStorage.getItem("myCourses");
    const savedBookmarks = localStorage.getItem("bookmarks");
    const savedComments = localStorage.getItem("comments");
    
    if (savedMyCourses) setMyCourses(JSON.parse(savedMyCourses));
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
    if (savedComments) setComments(JSON.parse(savedComments));
  }, []);

  const addBookmark = (itemId: string, itemType: Bookmark["itemType"], userId: string) => {
    const newBookmark: Bookmark = {
      id: new Date().getTime().toString(),
      itemId,
      itemType,
      userId,
      dateAdded: new Date().toISOString()
    };
    
    setBookmarks(prev => {
      const updatedBookmarks = [...prev, newBookmark];
      localStorage.setItem("bookmarks", JSON.stringify(updatedBookmarks));
      return updatedBookmarks;
    });
  };

  const removeBookmark = (id: string) => {
    setBookmarks(prev => {
      const updatedBookmarks = prev.filter(bookmark => bookmark.id !== id);
      localStorage.setItem("bookmarks", JSON.stringify(updatedBookmarks));
      return updatedBookmarks;
    });
  };

  const addComment = (commentData: Omit<Comment, "id" | "date">) => {
    const newComment: Comment = {
      ...commentData,
      id: new Date().getTime().toString(),
      date: new Date().toISOString()
    };
    
    setComments(prev => {
      const updatedComments = [...prev, newComment];
      localStorage.setItem("comments", JSON.stringify(updatedComments));
      return updatedComments;
    });
  };

  const enrollCourse = (courseId: string, userId: string) => {
    const course = courses.find(c => c.id === courseId);
    
    if (course && !myCourses.some(c => c.id === courseId)) {
      const enrolledCourse = { ...course, completedLessons: 0 };
      
      setMyCourses(prev => {
        const updatedCourses = [...prev, enrolledCourse];
        localStorage.setItem("myCourses", JSON.stringify(updatedCourses));
        return updatedCourses;
      });
      
      // Deduct course price from wallet
      if (wallet) {
        const newTransaction = {
          id: new Date().getTime().toString(),
          walletId: wallet.id,
          amount: course.price,
          type: "purchase" as const,
          description: `خرید دوره ${course.title}`,
          date: new Date().toLocaleDateString('fa-IR')
        };
        
        setWallet({
          ...wallet,
          balance: wallet.balance - course.price,
          transactions: [...wallet.transactions, newTransaction]
        });
      }
    }
  };

  const updateCourseProgress = (courseId: string, completedLessons: number) => {
    setMyCourses(prev => {
      const updatedCourses = prev.map(course => 
        course.id === courseId 
          ? { ...course, completedLessons } 
          : course
      );
      localStorage.setItem("myCourses", JSON.stringify(updatedCourses));
      return updatedCourses;
    });
  };

  return (
    <DataContext.Provider value={{
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
      updateCourseProgress
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
