
import React, { createContext, useContext, useState } from "react";

// Course Types
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
};

// Content Types
export type Article = {
  id: string;
  title: string;
  description: string;
  content: string;
  thumbnail: string;
  author: string;
  date: string;
  readTime: string;
  tags: string[];
};

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

export type Video = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
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
  createdAt: string;
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
  id: string;
  amount: number;
  type: "deposit" | "withdrawal" | "purchase";
  description: string;
  date: string;
};

// Wallet Type
export type Wallet = {
  balance: number;
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
  wallet: Wallet;
  addBookmark: (itemId: string, itemType: ItemType, userId: string) => void;
  removeBookmark: (id: string) => void;
  addComment: (comment: Omit<Comment, "id" | "date">) => void;
  enrollCourse: (courseId: string, userId: string) => void;
  updateWallet: (newBalance: number, newTransactions: Transaction[]) => void;
}

// Create Context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock Data
const mockCourses: Course[] = [
  {
    id: "1",
    title: "آموزش ترید و تحلیل تکنیکال",
    instructor: "مستر تریدر",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop",
    description: "این دوره به شما اصول اولیه ترید و تحلیل تکنیکال را آموزش می‌دهد",
    price: 1200000,
    rating: 4.8,
    totalLessons: 24,
    completedLessons: 12,
    createdAt: "2023-01-15",
    updatedAt: "2023-04-20",
    categories: ["ترید", "تحلیل تکنیکال"],
    duration: "24 ساعت",
    level: "beginner"
  },
  {
    id: "2",
    title: "استراتژی‌های سرمایه‌گذاری در بازار کریپتو",
    instructor: "سارا محمدی",
    thumbnail: "https://images.unsplash.com/photo-1605792657660-596af9009e82?q=80&w=2071&auto=format&fit=crop",
    description: "در این دوره با استراتژی‌های مختلف سرمایه‌گذاری در بازار کریپتو آشنا می‌شوید",
    price: 1500000,
    rating: 4.6,
    totalLessons: 18,
    completedLessons: 6,
    createdAt: "2023-03-10",
    updatedAt: "2023-05-15",
    categories: ["کریپتو", "سرمایه‌گذاری"],
    duration: "18 ساعت",
    level: "intermediate"
  },
  {
    id: "3",
    title: "مدیریت ریسک و سرمایه در ترید",
    instructor: "علی رضایی",
    thumbnail: "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?q=80&w=2070&auto=format&fit=crop",
    description: "مدیریت ریسک و سرمایه از مهم‌ترین فاکتورهای موفقیت در ترید است",
    price: 980000,
    rating: 4.9,
    totalLessons: 12,
    completedLessons: 0,
    createdAt: "2023-05-20",
    updatedAt: "2023-06-01",
    categories: ["ترید", "مدیریت ریسک"]
  },
  {
    id: "4",
    title: "آموزش فارکس از صفر تا صد",
    instructor: "حسین محمودی",
    thumbnail: "https://images.unsplash.com/photo-1642790551116-03a31b099176?q=80&w=2070&auto=format&fit=crop",
    description: "در این دوره از صفر با بازار فارکس آشنا می‌شوید و اصول ترید در این بازار را می‌آموزید",
    price: 2200000,
    rating: 4.7,
    totalLessons: 32,
    completedLessons: 16,
    createdAt: "2022-11-10",
    updatedAt: "2023-02-15",
    categories: ["فارکس"]
  },
  {
    id: "5",
    title: "معامله در بورس ایران",
    instructor: "نیما کریمی",
    thumbnail: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2070&auto=format&fit=crop",
    description: "آموزش جامع معامله در بورس ایران و تحلیل سهام",
    price: 0,
    rating: 4.5,
    totalLessons: 15,
    completedLessons: 8,
    createdAt: "2023-06-15",
    updatedAt: "2023-07-01",
    categories: ["بورس ایران", "سهام"]
  }
];

const mockArticles: Article[] = [
  {
    id: "1",
    title: "اهرم در معاملات: فرصت یا ریسک؟",
    description: "بررسی کامل مفهوم اهرم و تأثیر آن بر معاملات",
    content: "متن کامل مقاله درباره اهرم و معاملات...",
    thumbnail: "https://images.unsplash.com/photo-1620228885847-9eab2a1adddc?q=80&w=2073&auto=format&fit=crop",
    author: "علی حسینی",
    date: "1402/03/15",
    readTime: "7 دقیقه",
    tags: ["اهرم", "معاملات", "ریسک"]
  },
  {
    id: "2",
    title: "استراتژی‌های معاملاتی در بازار نزولی",
    description: "چطور در بازار نزولی سود کنیم؟",
    content: "متن کامل مقاله درباره بازارهای نزولی...",
    thumbnail: "https://images.unsplash.com/photo-1634704784915-aacf363b021f?q=80&w=2070&auto=format&fit=crop",
    author: "سارا محمدی",
    date: "1402/02/20",
    readTime: "5 دقیقه",
    tags: ["بازار نزولی", "استراتژی"]
  },
  {
    id: "3",
    title: "تحلیل بنیادی و اهمیت آن در انتخاب ارزهای دیجیتال",
    description: "چگونه با تحلیل بنیادی پروژه‌های ارز دیجیتال را ارزیابی کنیم؟",
    content: "متن کامل مقاله درباره تحلیل بنیادی...",
    thumbnail: "https://images.unsplash.com/photo-1627469629282-e2f7f4238267?q=80&w=2070&auto=format&fit=crop",
    author: "مهدی اکبری",
    date: "1402/01/10",
    readTime: "8 دقیقه",
    tags: ["تحلیل بنیادی", "ارز دیجیتال"]
  }
];

const mockPodcasts: Podcast[] = [
  {
    id: "1",
    title: "گفتگو با معامله‌گران موفق: قسمت اول",
    description: "در این اپیزود با یکی از معامله‌گران موفق بازار کریپتو گفتگو کرده‌ایم",
    thumbnail: "https://images.unsplash.com/photo-1614149162883-504ce4d13909?q=80&w=2074&auto=format&fit=crop",
    audioUrl: "/podcasts/1.mp3",
    author: "مستر تریدر",
    date: "1402/04/01",
    duration: "45 دقیقه",
    tags: ["مصاحبه", "معامله‌گران موفق"]
  },
  {
    id: "2",
    title: "بررسی روند بازار کریپتو در سال 1402",
    description: "تحلیل روند بازار و پیش‌بینی‌های آینده",
    thumbnail: "https://images.unsplash.com/photo-1640586892244-e1071bfcdcdb?q=80&w=2070&auto=format&fit=crop",
    audioUrl: "/podcasts/2.mp3",
    author: "مستر تریدر",
    date: "1402/03/15",
    duration: "32 دقیقه",
    tags: ["روند بازار", "پیش‌بینی"]
  },
  {
    id: "3",
    title: "اصول روانشناسی در معاملات",
    description: "چرا روانشناسی مهم‌ترین عامل موفقیت در معاملات است؟",
    thumbnail: "https://images.unsplash.com/photo-1603453810309-25f37e98dc19?q=80&w=2071&auto=format&fit=crop",
    audioUrl: "/podcasts/3.mp3",
    author: "سارا محمدی",
    date: "1402/02/10",
    duration: "28 دقیقه",
    tags: ["روانشناسی", "معاملات"]
  }
];

const mockVideos: Video[] = [
  {
    id: "1",
    title: "آموزش تحلیل تکنیکال: الگوهای کندل استیک",
    description: "در این ویدیو با الگوهای کندل استیک و کاربرد آنها آشنا می‌شوید",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop",
    videoUrl: "/videos/1.mp4",
    author: "مستر تریدر",
    date: "1402/04/05",
    duration: "15 دقیقه",
    tags: ["تحلیل تکنیکال", "کندل استیک"]
  },
  {
    id: "2",
    title: "معرفی و آموزش ابزارهای ترید",
    description: "با ابزارهای کاربردی که هر معامله‌گر باید بشناسد آشنا شوید",
    thumbnail: "https://images.unsplash.com/photo-1616514197671-15d99ce7a6f8?q=80&w=2073&auto=format&fit=crop",
    videoUrl: "/videos/2.mp4",
    author: "علی رضایی",
    date: "1402/03/20",
    duration: "20 دقیقه",
    tags: ["ابزار ترید", "آموزش"]
  },
  {
    id: "3",
    title: "آموزش استراتژی اسکالپینگ",
    description: "آشنایی با استراتژی اسکالپینگ و نحوه استفاده از آن در بازارهای مالی",
    thumbnail: "https://images.unsplash.com/photo-1631603090989-93f9ef6f9d80?q=80&w=2072&auto=format&fit=crop",
    videoUrl: "/videos/3.mp4",
    author: "نیما کریمی",
    date: "1402/02/15",
    duration: "18 دقیقه",
    tags: ["اسکالپینگ", "استراتژی"]
  }
];

const mockWebinars: Webinar[] = [
  {
    id: "1",
    title: "وبینار زنده: تحلیل بازار کریپتو",
    description: "در این وبینار به تحلیل زنده بازار کریپتو می‌پردازیم",
    thumbnail: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?q=80&w=2070&auto=format&fit=crop",
    videoUrl: "/webinars/1.mp4",
    author: "مستر تریدر",
    date: "1402/04/15",
    duration: "60 دقیقه",
    tags: ["کریپتو", "تحلیل بازار"],
    isLive: true,
    startTime: "1402/04/15 18:00"
  },
  {
    id: "2",
    title: "وبینار آموزشی: اصول سرمایه‌گذاری بلندمدت",
    description: "در این وبینار اصول و استراتژی‌های سرمایه‌گذاری بلندمدت را بررسی می‌کنیم",
    thumbnail: "https://images.unsplash.com/photo-1642543348745-235244227c2d?q=80&w=2070&auto=format&fit=crop",
    videoUrl: "/webinars/2.mp4",
    author: "علی رضایی",
    date: "1402/03/25",
    duration: "45 دقیقه",
    tags: ["سرمایه‌گذاری", "بلندمدت"],
    isLive: false,
    startTime: "1402/03/25 17:00"
  }
];

const mockFiles: File[] = [
  {
    id: "1",
    title: "راهنمای کامل تحلیل تکنیکال",
    description: "کتاب الکترونیکی جامع برای یادگیری تحلیل تکنیکال",
    thumbnail: "https://images.unsplash.com/photo-1618044733300-9472054094ee?q=80&w=2071&auto=format&fit=crop",
    fileUrl: "/files/technical-analysis-guide.pdf",
    author: "مستر تریدر",
    date: "1402/02/10",
    fileSize: "2.5 MB",
    fileType: "PDF",
    tags: ["تحلیل تکنیکال", "آموزش"]
  },
  {
    id: "2",
    title: "قالب اکسل برای ردیابی معاملات",
    description: "یک قالب اکسل برای ثبت و تحلیل معاملات شما",
    thumbnail: "https://images.unsplash.com/photo-1633613286991-611fe299c4be?q=80&w=2070&auto=format&fit=crop",
    fileUrl: "/files/trading-tracker.xlsx",
    author: "سارا محمدی",
    date: "1402/01/15",
    fileSize: "1.2 MB",
    fileType: "XLSX",
    tags: ["اکسل", "ردیابی معاملات"]
  }
];

const mockBookmarks: Bookmark[] = [
  {
    id: "1",
    itemId: "1",
    itemType: "course",
    userId: "user1",
    createdAt: "2023-05-01"
  },
  {
    id: "2",
    itemId: "1",
    itemType: "article",
    userId: "user1",
    createdAt: "2023-05-02"
  }
];

const mockComments: Comment[] = [
  {
    id: "1",
    itemId: "1",
    itemType: "course",
    userId: "user1",
    userName: "علی رضایی",
    userAvatar: "https://randomuser.me/api/portraits/men/1.jpg",
    content: "دوره بسیار مفیدی بود. با مفاهیم پایه‌ای تحلیل تکنیکال به خوبی آشنا شدم.",
    date: "1402/03/15",
    rating: 5
  },
  {
    id: "2",
    itemId: "1",
    itemType: "course",
    userId: "user2",
    userName: "سارا محمدی",
    userAvatar: "https://randomuser.me/api/portraits/women/1.jpg",
    content: "توضیحات واضح و کاربردی. ممنون از دوره خوبتون.",
    date: "1402/02/20",
    rating: 4
  }
];

const mockWallet: Wallet = {
  balance: 1850000,
  transactions: [
    {
      id: "1",
      amount: 1000000,
      type: "deposit",
      description: "شارژ کیف پول",
      date: "1402/03/10"
    },
    {
      id: "2",
      amount: 1200000,
      type: "purchase",
      description: "خرید دوره آموزش ترید و تحلیل تکنیکال",
      date: "1402/03/12"
    },
    {
      id: "3",
      amount: 2000000,
      type: "deposit",
      description: "شارژ کیف پول",
      date: "1402/03/20"
    },
    {
      id: "4",
      amount: 50000,
      type: "withdrawal",
      description: "برداشت وجه",
      date: "1402/03/25"
    }
  ]
};

// Data Provider Component
export const DataProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [courses] = useState<Course[]>(mockCourses);
  const [myCourses, setMyCourses] = useState<Course[]>(mockCourses.slice(0, 2)); // User's purchased courses
  const [articles] = useState<Article[]>(mockArticles);
  const [podcasts] = useState<Podcast[]>(mockPodcasts);
  const [videos] = useState<Video[]>(mockVideos);
  const [webinars] = useState<Webinar[]>(mockWebinars);
  const [files] = useState<File[]>(mockFiles);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(mockBookmarks);
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [wallet, setWallet] = useState<Wallet>(mockWallet);

  const addBookmark = (itemId: string, itemType: ItemType, userId: string) => {
    const newBookmark: Bookmark = {
      id: Date.now().toString(),
      itemId,
      itemType,
      userId,
      createdAt: new Date().toISOString(),
    };
    setBookmarks([...bookmarks, newBookmark]);
  };

  const removeBookmark = (id: string) => {
    setBookmarks(bookmarks.filter(bookmark => bookmark.id !== id));
  };

  const addComment = (comment: Omit<Comment, "id" | "date">) => {
    const newComment: Comment = {
      ...comment,
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('fa-IR'),
    };
    setComments([...comments, newComment]);
  };

  const enrollCourse = (courseId: string, userId: string) => {
    // Update the myCourses array with the purchased course
    const course = courses.find(c => c.id === courseId);
    if (course && !myCourses.some(c => c.id === courseId)) {
      setMyCourses([...myCourses, course]);
    }
    console.log(`User ${userId} enrolled in course ${courseId}`);
  };

  // New function to update wallet
  const updateWallet = (newBalance: number, newTransactions: Transaction[]) => {
    setWallet({
      balance: newBalance,
      transactions: newTransactions
    });
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
