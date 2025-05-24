import React, { createContext, useContext, useState, useEffect } from "react";
import { idToString } from "@/utils/idConverter";

// Type definitions
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Course {
  id: string | number;
  title: string;
  description: string;
  instructor: {
    id: string | number;
    first_name: string;
    last_name: string;
    email: string;
  };
  thumbnail: string;
  price: string | number;
  is_free: boolean;
  chapters: Chapter[];
  created_at: string;
  updated_at: string;
  is_published: boolean;
  // Additional properties for UI
  rating?: number;
  totalLessons?: number;
  completedLessons?: number;
}

export interface Chapter {
  id: string | number;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string | number;
  title: string;
  content: string;
  video_url: string;
  duration: number;
  order: number;
  is_free_preview: boolean;
}

export interface Article {
  id: string | number;
  title: string;
  slug: string;
  content: string;
  summary: string;
  thumbnail: string;
  author: {
    id: string | number;
    username: string | null;
    email: string;
    first_name: string;
    last_name: string;
  };
  category: {
    id: string | number;
    name: string;
    slug: string;
    description: string;
  };
  tags: {
    id: string | number;
    name: string;
    slug: string;
  }[];
  status: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  view_count: number;
  // For compatibility with UI components
  description?: string;
  date?: string;
}

export interface Podcast {
  id: string | number;
  title: string;
  description: string;
  thumbnail: string;
  author: string;
  date: string;
  duration: string;
  audioUrl?: string;
  tags?: string[];
}

export interface Video {
  id: string | number;
  title: string;
  description: string;
  thumbnail: string;
  author: string;
  date: string;
  duration: string;
  videoUrl?: string;
  tags?: string[];
}

export interface Webinar {
  id: string | number;
  title: string;
  description: string;
  thumbnail: string;
  author: string;
  date: string;
  duration: string;
  videoUrl?: string;
  tags?: string[];
  isLive?: boolean;
  startTime?: string;
}

export interface File {
  id: string | number;
  title: string;
  description: string;
  thumbnail: string;
  author: string;
  date: string;
  fileSize?: string;
  fileType?: string;
  fileUrl?: string;
  tags?: string[];
}

export type ItemType = "article" | "podcast" | "video" | "webinar" | "file" | "course";

interface Bookmark {
  id: string;
  userId: string;
  itemId: string;
  itemType: ItemType;
  createdAt: string;
}

export interface Wallet {
  balance: number;
  transactions: {
    id: string;
    amount: number;
    type: string;
    description: string;
    date: string;
  }[];
}

interface DataContextType {
  courses: Course[];
  articles: Article[];
  podcasts: Podcast[];
  videos: Video[];
  webinars: Webinar[];
  files: File[];
  bookmarks: Bookmark[];
  myCourses?: string[]; // IDs of courses user is enrolled in
  wallet?: Wallet;
  addBookmark: (itemId: string, itemType: ItemType, userId: string) => void;
  removeBookmark: (bookmarkId: string) => void;
  fetchArticles: () => Promise<Article[]>;
  fetchArticleById: (id: string) => Promise<Article | null>;
  updateWallet?: (amount: number, type: string, description: string) => void;
  enrollCourse?: (courseId: string) => void;
  fetchCourses?: () => Promise<Course[]>;
  fetchCourseById?: (id: string) => Promise<Course | null>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Sample data for initial state
const mockCourses: Course[] = [
  {
    id: "1",
    title: "آموزش ترید و تحلیل تکنیکال",
    instructor: {
      id: "1",
      first_name: "مستر",
      last_name: "تریدر",
      email: "trader@example.com"
    },
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop",
    description: "این دوره به شما اصول اولیه ترید و تحلیل تکنیکال را آموزش می‌دهد. شما با الگوهای نموداری، اندیکاتورها و استراتژی‌های معاملاتی آشنا خواهید شد.",
    price: "1200000",
    is_free: false,
    chapters: [],
    created_at: "2023-01-15",
    updated_at: "2023-04-20",
    is_published: true,
    rating: 4.8,
    totalLessons: 24,
    completedLessons: 12
  },
  {
    id: "2",
    title: "استراتژی‌های سرمایه‌گذاری در بازار کریپتو",
    instructor: "سارا محمدی",
    thumbnail: "https://images.unsplash.com/photo-1605792657660-596af9009e82?q=80&w=2071&auto=format&fit=crop",
    description: "در این دوره با استراتژی‌های مختلف سرمایه‌گذاری در بازار کریپتو آشنا می‌شوید و می‌آموزید چگونه ریسک‌ها را کاهش داده و بازدهی خود را افزایش دهید.",
    price: "1500000",
    rating: 4.6,
    totalLessons: 18,
    completedLessons: 6,
    createdAt: "2023-03-10",
    updatedAt: "2023-05-15",
    categories: ["کریپتو", "سرمایه‌گذاری", "ارز دیجیتال"],
    duration: "18 ساعت",
    level: "intermediate"
  },
  {
    id: "3",
    title: "مدیریت ریسک و سرمایه در ترید",
    instructor: "علی رضایی",
    thumbnail: "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?q=80&w=2070&auto=format&fit=crop",
    description: "مدیریت ریسک و سرمایه از مهم‌ترین فاکتورهای موفقیت در ترید است. این دوره به شما آموزش می‌دهد چگونه از سرمایه خود محافظت کنید و در عین حال بازده مطلوبی داشته باشید.",
    price: "980000",
    rating: 4.9,
    totalLessons: 12,
    completedLessons: 0,
    createdAt: "2023-05-20",
    updatedAt: "2023-06-01",
    categories: ["ترید", "مدیریت ریسک", "سرمایه‌گذاری"],
    duration: "15 ساعت",
    level: "intermediate"
  },
  {
    id: "4",
    title: "آموزش فارکس از صفر تا صد",
    instructor: "حسین محمودی",
    thumbnail: "https://images.unsplash.com/photo-1642790551116-03a31b099176?q=80&w=2070&auto=format&fit=crop",
    description: "در این دوره از صفر با بازار فارکس آشنا می‌شوید و اصول ترید در این بازار را می‌آموزید. استراتژی‌های مختلف معاملاتی، تحلیل بازار و مدیریت حساب از موضوعات این دوره هستند.",
    price: "2200000",
    rating: 4.7,
    totalLessons: 32,
    completedLessons: 16,
    createdAt: "2022-11-10",
    updatedAt: "2023-02-15",
    categories: ["فارکس", "بازار ارز", "معاملات بین‌المللی"],
    duration: "35 ساعت",
    level: "beginner"
  },
  {
    id: "5",
    title: "معامله در بورس ایران",
    instructor: "نیما کریمی",
    thumbnail: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2070&auto=format&fit=crop",
    description: "آموزش جامع معامله در بورس ایران و تحلیل سهام. از مفاهیم پایه تا استراتژی‌های پیشرفته معاملاتی را در این دوره می‌آموزید.",
    price: "0",
    rating: 4.5,
    totalLessons: 15,
    completedLessons: 8,
    createdAt: "2023-06-15",
    updatedAt: "2023-07-01",
    categories: ["بورس ایران", "سهام", "تحلیل بنیادی"],
    duration: "12 ساعت",
    level: "beginner"
  },
  {
    id: "6",
    title: "تحلیل بنیادی بازار سرمایه",
    instructor: "فاطمه احمدی",
    thumbnail: "https://images.unsplash.com/photo-1604594849809-dfedbc827105?q=80&w=2070&auto=format&fit=crop",
    description: "در این دوره با اصول تحلیل بنیادی سهام و شرکت‌ها آشنا می‌شوید و می‌آموزید چگونه صورت‌های مالی را تحلیل کنید و ارزش واقعی شرکت‌ها را تعیین نمایید.",
    price: "1800000",
    rating: 4.8,
    totalLessons: 20,
    completedLessons: 0,
    createdAt: "2023-08-01",
    updatedAt: "2023-09-15",
    categories: ["تحلیل بنیادی", "بورس", "سرمایه‌گذاری"],
    duration: "22 ساعت",
    level: "advanced"
  },
  {
    id: "7",
    title: "روانشناسی معامله‌گری",
    instructor: "امیر صادقی",
    thumbnail: "https://images.unsplash.com/photo-1521898284481-a5ec348cb555?q=80&w=2070&auto=format&fit=crop",
    description: "این دوره به جنبه‌های روانشناختی معامله‌گری می‌پردازد و به شما کمک می‌کند تا بر احساسات خود در معاملات مسلط شوید و تصمیمات منطقی‌تری بگیرید.",
    price: "1300000",
    rating: 4.9,
    totalLessons: 16,
    completedLessons: 0,
    createdAt: "2023-10-01",
    updatedAt: "2023-11-10",
    categories: ["روانشناسی معامله‌گری", "ترید", "مدیریت استرس"],
    duration: "18 ساعت",
    level: "intermediate"
  },
  {
    id: "8",
    title: "آموزش معاملات آلگوریتمی",
    instructor: "پویا علوی",
    thumbnail: "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2016&auto=format&fit=crop",
    description: "در این دوره اصول معاملات الگوریتمی و برنامه‌نویسی استراتژی‌های معاملاتی را می‌آموزید. این دوره برای افرادی مناسب است که می‌خواهند سیستم‌های معاملاتی خودکار طراحی کنند.",
    price: "2500000",
    rating: 4.7,
    totalLessons: 28,
    completedLessons: 0,
    createdAt: "2023-12-01",
    updatedAt: "2024-01-15",
    categories: ["معاملات الگوریتمی", "برنامه‌نویسی", "هوش مصنوعی"],
    duration: "32 ساعت",
    level: "advanced"
  }
];

const mockPodcasts: Podcast[] = [
  {
    id: "1",
    title: "گفتگو با معامله‌گران موفق: قسمت اول",
    description: "در این اپیزود با یکی از معامله‌گران موفق بازار کریپتو گفتگو کرده‌ایم. او تجربیات خود در مسیر موفقیت و استراتژی‌های معاملاتی خود را به اشتراک می‌گذارد.",
    thumbnail: "https://images.unsplash.com/photo-1614149162883-504ce4d13909?q=80&w=2074&auto=format&fit=crop",
    audioUrl: "/podcasts/1.mp3",
    author: "مستر تریدر",
    date: "1402/04/01",
    duration: "45 دقیقه",
    tags: ["مصاحبه", "معامله‌گران موفق", "استراتژی", "کریپتو"]
  },
  {
    id: "2",
    title: "بررسی روند بازار کریپتو در سال 1402",
    description: "تحلیل روند بازار و پیش‌بینی‌های آینده. در این اپیزود به تحلیل وضعیت فعلی بازار کریپتو، روندهای اخیر و پیش‌بینی‌های کارشناسان برای آینده می‌پردازیم.",
    thumbnail: "https://images.unsplash.com/photo-1640586892244-e1071bfcdcdb?q=80&w=2070&auto=format&fit=crop",
    audioUrl: "/podcasts/2.mp3",
    author: "مستر تریدر",
    date: "1402/03/15",
    duration: "32 دقیقه",
    tags: ["روند بازار", "پیش‌بینی", "کریپتو", "بیت‌کوین"]
  },
  {
    id: "3",
    title: "اصول روانشناسی در معاملات",
    description: "چرا روانشناسی مهم‌ترین عامل موفقیت در معاملات است؟ در این اپیزود به بررسی جنبه‌های روانی معامله‌گری و تکنیک‌های کنترل احساسات می‌پردازیم.",
    thumbnail: "https://images.unsplash.com/photo-1603453810309-25f37e98dc19?q=80&w=2071&auto=format&fit=crop",
    audioUrl: "/podcasts/3.mp3",
    author: "سارا محمدی",
    date: "1402/02/10",
    duration: "28 دقیقه",
    tags: ["روانشناسی", "معاملات", "کنترل احساسات", "ذهنیت"]
  },
  {
    id: "4",
    title: "آشنایی با ارزهای دیجیتال جدید و پتانسیل آنها",
    description: "معرفی ارزهای دیجیتال نوظهور با پتانسیل رشد بالا. در این اپیزود پروژه‌های جدید و نوآورانه را بررسی می‌کنیم و دلایلی که می‌توانند آنها را به سرمایه‌گذاری‌های خوبی تبدیل کنند.",
    thumbnail: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?q=80&w=2071&auto=format&fit=crop",
    audioUrl: "/podcasts/4.mp3",
    author: "مستر تریدر",
    date: "1402/04/25",
    duration: "38 دقیقه",
    tags: ["ارز دیجیتال", "آلت‌کوین", "سرمایه‌گذاری", "بلاکچین"]
  },
  {
    id: "5",
    title: "مدیریت ریسک و سرمایه در ترید",
    description: "اصول مدیریت ریسک و سرمایه برای معامله‌گران. این اپیزود به تکنیک‌های عملی برای محافظت از سرمایه در معاملات می‌پردازد و راهکارهای کاهش ریسک را بررسی می‌کند.",
    thumbnail: "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?q=80&w=2070&auto=format&fit=crop",
    audioUrl: "/podcasts/5.mp3",
    author: "علی رضایی",
    date: "1402/05/05",
    duration: "42 دقیقه",
    tags: ["مدیریت ریسک", "مدیریت سرمایه", "پوزیشن سایزینگ", "معاملات"]
  }
];

const mockVideos: Video[] = [
  {
    id: "1",
    title: "آموزش تحلیل تکنیکال: الگوهای کندل استیک",
    description: "در این ویدیو با الگوهای کندل استیک و کاربرد آنها آشنا می‌شوید. الگوهای کندلی قدرتمندترین ابزارهای تحلیل تکنیکال هستند که به شما در شناخت نقاط برگشت بازار کمک می‌کنند.",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop",
    videoUrl: "/videos/1.mp4",
    author: "مستر تریدر",
    date: "1402/04/05",
    duration: "15 دقیقه",
    tags: ["تحلیل تکنیکال", "کندل استیک", "الگوهای نموداری"]
  },
  {
    id: "2",
    title: "معرفی و آموزش ابزارهای ترید",
    description: "با ابزارهای کاربردی که هر معامله‌گر باید بشناسد آشنا شوید. در این ویدیو، مهم‌ترین پلتفرم‌ها، نرم‌افزارها و ابزارهای تحلیلی مورد استفاده معامله‌گران حرفه‌ای را معرفی می‌کنیم.",
    thumbnail: "https://images.unsplash.com/photo-1616514197671-15d99ce7a6f8?q=80&w=2073&auto=format&fit=crop",
    videoUrl: "/videos/2.mp4",
    author: "علی رضایی",
    date: "1402/03/20",
    duration: "20 دقیقه",
    tags: ["ابزار ترید", "آموزش", "پلتفرم معاملاتی"]
  },
  {
    id: "3",
    title: "آموزش استراتژی اسکالپینگ",
    description: "آشنایی با استراتژی اسکالپینگ و نحوه استفاده از آن در بازارهای مالی. این ویدیو تکنیک‌های عملی برای اسکالپ کردن و کسب سودهای کوچک اما مداوم را آموزش می‌دهد.",
    thumbnail: "https://images.unsplash.com/photo-1631603090989-93f9ef6f9d80?q=80&w=2072&auto=format&fit=crop",
    videoUrl: "/videos/3.mp4",
    author: "نیما کریمی",
    date: "1402/02/15",
    duration: "18 دقیقه",
    tags: ["اسکالپینگ", "استراتژی", "ترید کوتاه‌مدت"]
  },
  {
    id: "4",
    title: "تحلیل تکنیکال پیشرفته: امواج الیوت",
    description: "آموزش تئوری امواج الیوت و کاربرد آن در پیش‌بینی روند بازار. در این ویدیو با اصول امواج الیوت، الگوهای مختلف و نحوه شمارش امواج آشنا می‌شوید.",
    thumbnail: "https://images.unsplash.com/photo-1642790551116-03a31b099176?q=80&w=2070&auto=format&fit=crop",
    videoUrl: "/videos/4.mp4",
    author: "مستر تریدر",
    date: "1402/05/10",
    duration: "25 دقیقه",
    tags: ["امواج الیوت", "تحلیل تکنیکال", "پیش‌بینی روند"]
  },
  {
    id: "5",
    title: "آموزش معاملات الگوریتمی برای مبتدیان",
    description: "مقدمه‌ای بر معاملات الگوریتمی و برنامه‌نویسی استراتژی‌های معاملاتی. این ویدیو مفاهیم اولیه معاملات الگوریتمی و ابزارهای مورد نیاز برای شروع را معرفی می‌کند.",
    thumbnail: "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2016&auto=format&fit=crop",
    videoUrl: "/videos/5.mp4",
    author: "پویا علوی",
    date: "1402/06/18",
    duration: "22 دقیقه",
    tags: ["معاملات الگوریتمی", "برنامه‌نویسی", "اتوماسیون"]
  },
  {
    id: "6",
    title: "استراتژی‌های معاملاتی در بازار ارز",
    description: "معرفی و آموزش استراتژی‌های کاربردی برای معامله در بازار فارکس. در این ویدیو استراتژی‌های مختلف معاملاتی در تایم‌فریم‌های مختلف را بررسی می‌کنیم.",
    thumbnail: "https://images.unsplash.com/photo-1642543348745-235244227c2d?q=80&w=2070&auto=format&fit=crop",
    videoUrl: "/videos/6.mp4",
    author: "حسین محمودی",
    date: "1402/07/01",
    duration: "30 دقیقه",
    tags: ["فارکس", "استراتژی معاملاتی", "بازار ارز"]
  }
];

const mockWebinars: Webinar[] = [
  {
    id: "1",
    title: "وبینار زنده: تحلیل بازار کریپتو",
    description: "در این وبینار به تحلیل زنده بازار کریپتو می‌پردازیم و فرصت‌های معاملاتی و سرمایه‌گذاری در شرایط فعلی بازار را بررسی می‌کنیم. همچنین به سؤالات شرکت‌کنندگان پاسخ داده خواهد شد.",
    thumbnail: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?q=80&w=2070&auto=format&fit=crop",
    videoUrl: "/webinars/1.mp4",
    author: "مستر تریدر",
    date: "1402/04/15",
    duration: "60 دقیقه",
    tags: ["کریپتو", "تحلیل بازار", "بیت‌کوین", "وبینار زنده"],
    isLive: true,
    startTime: "1402/04/15 18:00"
  },
  {
    id: "2",
    title: "وبینار آموزشی: اصول سرمایه‌گذاری بلندمدت",
    description: "در این وبینار اصول و استراتژی‌های سرمایه‌گذاری بلندمدت را بررسی می‌کنیم. مباحثی چون انتخاب دارایی، تنوع‌بخشی، مدیریت ریسک و صبر استراتژیک در سرمایه‌گذاری مورد بحث قرار خواهند گرفت.",
    thumbnail: "https://images.unsplash.com/photo-1642543348745-235244227c2d?q=80&w=2070&auto=format&fit=crop",
    videoUrl: "/webinars/2.mp4",
    author: "علی رضایی",
    date: "1402/03/25",
    duration: "45 دقیقه",
    tags: ["سرمایه‌گذاری", "بلندمدت", "استراتژی"],
    isLive: false,
    startTime: "1402/03/25 17:00"
  },
  {
    id: "3",
    title: "وبینار آموزشی: تحلیل بنیادی در بازار سهام",
    description: "در این وبینار اصول تحلیل بنیادی شرکت‌ها و نحوه ارزیابی وضعیت مالی آنها را آموزش می‌دهیم. مواردی چون تحلیل صورت‌های مالی، نسبت‌های مالی و ارزش‌گذاری سهام مورد بررسی قرار خواهند گرفت.",
    thumbnail: "https://images.unsplash.com/photo-1604594849809-dfedbc827105?q=80&w=2070&auto=format&fit=crop",
    videoUrl: "/webinars/3.mp4",
    author: "فاطمه احمدی",
    date: "1402/05/20",
    duration: "90 دقیقه",
    tags: ["تحلیل بنیادی", "بورس", "سهام", "ارزش‌گذاری"],
    isLive: false,
    startTime: "1402/05/20 16:30"
  },
  {
    id: "4",
    title: "وبینار زنده: مدیریت ریسک و سرمایه در بازارهای مالی",
    description: "این وبینار به صورت زنده برگزار می‌شود و به اصول علمی و عملی مدیریت ریسک و سرمایه در معاملات می‌پردازد. شرکت‌کنندگان می‌توانند سؤالات خود را در بخش گفتگوی زنده مطرح کنند.",
    thumbnail: "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?q=80&w=2070&auto=format&fit=crop",
    videoUrl: "/webinars/4.mp4",
    author: "نیما کریمی",
    date: "1402/08/10",
    duration: "75 دقیقه",
    tags: ["مدیریت ریسک", "مدیریت سرمایه", "وبینار زنده", "پوزیشن سایزینگ"],
    isLive: true,
    startTime: "1402/08/10 19:00"
  }
];

const mockFiles: File[] = [
  {
    id: "1",
    title: "راهنمای کامل تحلیل تکنیکال",
    description: "کتاب الکترونیکی جامع برای یادگیری تحلیل تکنیکال. این کتاب تمامی مفاهیم پایه و پیشرفته تحلیل تکنیکال را به زبان ساده و با مثال‌های کاربردی آموزش می‌دهد.",
    thumbnail: "https://images.unsplash.com/photo-1618044733300-9472054094ee?q=80&w=2071&auto=format&fit=crop",
    fileUrl: "/files/technical-analysis-guide.pdf",
    author: "مستر تریدر",
    date: "1402/02/10",
    fileSize: "2.5 MB",
    fileType: "PDF",
    tags: ["تحلیل تکنیکال", "آموزش", "کتاب الکترونیکی"]
  },
  {
    id: "2",
    title: "قالب اکسل برای ردیابی معاملات",
    description: "یک قالب اکسل برای ثبت و تحلیل معاملات شما. این فایل شامل فرمول‌های آماده برای محاسبه سود و زیان، نرخ موفقیت و سایر شاخص‌های مهم عملکرد معاملاتی است.",
    thumbnail: "https://images.unsplash.com/photo-1633613286991-611fe299c4be?q=80&w=2070&auto=format&fit=crop",
    fileUrl: "/files/trading-tracker.xlsx",
    author: "سارا محمدی",
    date: "1402/01/15",
    fileSize: "1.2 MB",
    fileType: "XLSX",
    tags: ["اکسل", "ردیابی معاملات", "مدیریت سرمایه"]
  },
  {
    id: "3",
    title: "چک‌لیست استراتژی معاملاتی",
    description: "فایل PDF شامل چک‌لیست کامل برای اطمینان از رعایت تمام نکات استراتژی معاملاتی شما. این چک‌لیست به شما کمک می‌کند تا قبل از ورود به هر معامله، تمام جوانب را در نظر بگیرید.",
    thumbnail: "https://images.unsplash.com/photo-1631603090989-93f9ef6f9d80?q=80&w=2072&auto=format&fit=crop",
    fileUrl: "/files/trading-strategy-checklist.pdf",
    author: "علی رضایی",
    date: "1402/03/05",
    fileSize: "850 KB",
    fileType: "PDF",
    tags: ["استراتژی معاملاتی", "چک‌لیست", "مدیریت ریسک"]
  },
  {
    id: "4",
    title: "مجموعه اندیکاتورهای تحلیل تکنیکال",
    description: "فایل فشرده شامل مجموعه‌ای از اندیکاتورهای سفارشی برای پلتفرم‌های معاملاتی MetaTrader و TradingView. این اندیکاتورها برای تشخیص روندها و نقاط ورود بهینه طراحی شده‌اند.",
    thumbnail: "https://images.unsplash.com/photo-1642790551116-03a31b099176?q=80&w=2070&auto=format&fit=crop",
    fileUrl: "/files/custom-indicators.zip",
    author: "پویا علوی",
    date: "1402/04/20",
    fileSize: "4.5 MB",
    fileType: "ZIP",
    tags: ["اندیکاتور", "تحلیل تکنیکال", "متاتریدر"]
  },
  {
    id: "5",
    title: "راهنمای جامع ارزهای دیجیتال",
    description: "کتاب الکترونیکی کامل درباره ارزهای دیجیتال، بلاکچین و مفاهیم اساسی این حوزه. این کتاب از مفاهیم پایه تا اصول پیشرفته سرمایه‌گذاری در این بازار را پوشش می‌دهد.",
    thumbnail: "https://images.unsplash.com/photo-1627469629282-e2f7f4238267?q=80&w=2070&auto=format&fit=crop",
    fileUrl: "/files/crypto-guide.pdf",
    author: "مهدی اکبری",
    date: "1402/05/15",
    fileSize: "3.7 MB",
    fileType: "PDF",
    tags: ["ارز دیجیتال", "بلاکچین", "کریپتو", "بیت‌کوین"]
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
  },
  {
    id: "3",
    itemId: "2",
    itemType: "video",
    userId: "user1",
    createdAt: "2023-05-03"
  },
  {
    id: "4",
    itemId: "3",
    itemType: "podcast",
    userId: "user1",
    createdAt: "2023-05-04"
  },
  {
    id: "5",
    itemId: "2",
    itemType: "webinar",
    userId: "user1",
    createdAt: "2023-05-05"
  },
  {
    id: "6",
    itemId: "2",
    itemType: "course",
    userId: "user2",
    createdAt: "2023-05-06"
  },
  {
    id: "7",
    itemId: "3",
    itemType: "article",
    userId: "user2",
    createdAt: "2023-05-07"
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
  },
  {
    id: "3",
    itemId: "2",
    itemType: "course",
    userId: "user3",
    userName: "محمد حسینی",
    userAvatar: "https://randomuser.me/api/portraits/men/2.jpg",
    content: "محتوای دوره بسیار جامع و به روز بود. از استراتژی‌های ارائه شده خیلی استفاده کردم.",
    date: "1402/04/10",
    rating: 5
  },
  {
    id: "4",
    itemId: "3",
    itemType: "course",
    userId: "user4",
    userName: "فاطمه کریمی",
    userAvatar: "https://randomuser.me/api/portraits/women/2.jpg",
    content: "مطالب خوبی ارائه شد، اما کاش مثال‌های بیشتری داشت.",
    date: "1402/03/25",
    rating: 4
  },
  {
    id: "5",
    itemId: "1",
    itemType: "article",
    userId: "user5",
    userName: "رضا جعفری",
    userAvatar: "https://randomuser.me/api/portraits/men/3.jpg",
    content: "مقاله بسیار خوب و کاربردی بود. ممنون از اشتراک‌گذاری این اطلاعات ارزشمند.",
    date: "1402/04/05",
    rating: 5
  },
  {
    id: "6",
    itemId: "2",
    itemType: "video",
    userId: "user6",
    userName: "نیما اکبری",
    userAvatar: "https://randomuser.me/api/portraits/men/4.jpg",
    content: "آموزش ابزارهای ترید به صورت گام به گام و واضح بود. واقعاً به من کمک کرد.",
    date: "1402/05/12",
    rating: 5
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
    },
    {
      id: "5",
      amount: 1500000,
      type: "purchase",
      description: "خرید دوره استراتژی‌های سرمایه‌گذاری در بازار کریپتو",
      date: "1402/04/05"
    },
    {
      id: "6",
      amount: 500000,
      type: "deposit",
      description: "شارژ کیف پول",
      date: "1402/04/18"
    },
    {
      id: "7",
      amount: 100000,
      type: "withdrawal",
      description: "برداشت وجه",
      date: "1402/05/01"
    },
    {
      id: "8",
      amount: 800000,
      type: "deposit",
      description: "شارژ کیف پول",
      date: "1402/05/15"
    }
  ]
};

// Convert API article to our format
const articleFromApi = (article: any): Article => {
  return {
    ...article,
    description: article.summary || article.content.substring(0, 150),
    date: article.published_at ? formatDate(article.published_at.split('T')[0]) : formatDate(article.created_at.split('T')[0])
  };
};

// Format date in Persian
function formatDate(dateString: string): string {
  if (!dateString) return "";
  
  try {
    // Convert to Persian date format
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
}

const mockCoursesWithId = mockCourses.map(course => ({
  ...course,
  id: idToString(course.id)
}));

const mockPodcastsWithId = mockPodcasts.map(podcast => ({
  ...podcast,
  id: idToString(podcast.id)
}));

const mockVideosWithId = mockVideos.map(video => ({
  ...video,
  id: idToString(video.id)
}));

const mockWebinarsWithId = mockWebinars.map(webinar => ({
  ...webinar,
  id: idToString(webinar.id)
}));

const mockFilesWithId = mockFiles.map(file => ({
  ...file,
  id: idToString(file.id)
}));

const mockBookmarksWithId = mockBookmarks.map(bookmark => ({
  ...bookmark,
  itemId: idToString(bookmark.itemId)
}));

const mockWalletWithId = {
  ...mockWallet,
  balance: mockWallet.balance,
  transactions: mockWallet.transactions.map(transaction => ({
    ...transaction,
    id: idToString(transaction.id)
  }))
};

// Data Provider Component
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>(mockCoursesWithId);
  const [articles, setArticles] = useState<Article[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>(mockPodcastsWithId);
  const [videos, setVideos] = useState<Video[]>(mockVideosWithId);
  const [webinars, setWebinars] = useState<Webinar[]>(mockWebinarsWithId);
  const [files, setFiles] = useState<File[]>(mockFilesWithId);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(mockBookmarksWithId);
  const [myCourses, setMyCourses] = useState<string[]>([]);
  const [wallet, setWallet] = useState<Wallet>(mockWalletWithId);

  useEffect(() => {
    // Fetch articles on component mount
    fetchArticles().then(data => setArticles(data));
  }, []);

  const addBookmark = (itemId: string, itemType: ItemType, userId: string) => {
    const newBookmark: Bookmark = {
      id: `bookmark-${Date.now()}`,
      userId,
      itemId,
      itemType,
      createdAt: new Date().toISOString(),
    };
    setBookmarks(prev => [...prev, newBookmark]);
  };

  const removeBookmark = (bookmarkId: string) => {
    setBookmarks(prev => prev.filter(bookmark => bookmark.id !== bookmarkId));
  };

  const fetchArticles = async (): Promise<Article[]> => {
    try {
      const response = await fetch('https://api.gport.sbs/blog/api/articles/');
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      const data = await response.json();
      // Transform API response to match our Article type
      const processedArticles = data.map((article: any) => articleFromApi(article));
      return processedArticles;
    } catch (error) {
      console.error('Error fetching articles:', error);
      return [];
    }
  };

  const fetchArticleById = async (id: string): Promise<Article | null> => {
    try {
      const response = await fetch(`https://api.gport.sbs/blog/api/articles/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }
      const data = await response.json();
      return articleFromApi(data);
    } catch (error) {
      console.error(`Error fetching article with id ${id}:`, error);
      return null;
    }
  };

  const fetchCourses = async (): Promise<Course[]> => {
    try {
      const response = await fetch('https://api.gport.sbs/course/api/courses/');
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      const data = await response.json();
      // Transform API response to match our Course type
      const processedCourses = data.map((course: any) => ({
        id: course.id,
        title: course.title,
        description: course.description,
        instructor: course.instructor,
        thumbnail: course.thumbnail,
        price: course.price,
        is_free: course.is_free,
        chapters: course.chapters || [],
        created_at: course.created_at,
        updated_at: course.updated_at,
        is_published: course.is_published,
        rating: 4.5, // Default rating until we have real data
        totalLessons: course.chapters?.reduce((acc: number, chapter: any) => acc + chapter.lessons.length, 0) || 0,
        completedLessons: 0 // Default until we track user progress
      }));
      return processedCourses;
    } catch (error) {
      console.error('Error fetching courses:', error);
      return mockCourses; // Fallback to mock data
    }
  };

  const fetchCourseById = async (id: string): Promise<Course | null> => {
    try {
      const response = await fetch(`https://api.gport.sbs/course/api/courses/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch course');
      }
      const course = await response.json();
      return {
        id: course.id,
        title: course.title,
        description: course.description,
        instructor: course.instructor,
        thumbnail: course.thumbnail,
        price: course.price,
        is_free: course.is_free,
        chapters: course.chapters || [],
        created_at: course.created_at,
        updated_at: course.updated_at,
        is_published: course.is_published,
        rating: 4.5, // Default rating until we have real data
        totalLessons: course.chapters?.reduce((acc: number, chapter: any) => acc + chapter.lessons.length, 0) || 0,
        completedLessons: 0 // Default until we track user progress
      };
    } catch (error) {
      console.error(`Error fetching course with id ${id}:`, error);
      return null;
    }
  };

  const updateWallet = (amount: number, type: string, description: string) => {
    const newTransaction = {
      id: `transaction-${Date.now()}`,
      amount,
      type,
      description,
      date: new Intl.DateTimeFormat('fa-IR').format(new Date())
    };
    
    setWallet(prev => ({
      balance: type === 'deposit' ? prev.balance + amount : 
               type === 'withdrawal' ? prev.balance - amount : 
               type === 'purchase' ? prev.balance - amount : prev.balance,
      transactions: [newTransaction, ...prev.transactions]
    }));
  };

  const enrollCourse = (courseId: string) => {
    if (!myCourses.includes(courseId)) {
      setMyCourses(prev => [...prev, courseId]);
      // If it's a paid course, deduct from wallet
      const course = courses.find(c => idToString(c.id) === courseId);
      if (course && !course.is_free) {
        const price = typeof course.price === 'string' ? parseInt(course.price) : course.price;
        updateWallet(price, 'purchase', `خرید دوره ${course.title}`);
      }
    }
  };

  return (
    <DataContext.Provider
      value={{
        courses,
        articles,
        podcasts,
        videos,
        webinars,
        files,
        bookmarks,
        myCourses,
        wallet,
        addBookmark,
        removeBookmark,
        fetchArticles,
        fetchArticleById,
        fetchCourses,
        fetchCourseById,
        updateWallet,
        enrollCourse
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
