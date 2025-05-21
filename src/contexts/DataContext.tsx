
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
    description: "این دوره به شما اصول اولیه ترید و تحلیل تکنیکال را آموزش می‌دهد. شما با الگوهای نموداری، اندیکاتورها و استراتژی‌های معاملاتی آشنا خواهید شد.",
    price: 1200000,
    rating: 4.8,
    totalLessons: 24,
    completedLessons: 12,
    createdAt: "2023-01-15",
    updatedAt: "2023-04-20",
    categories: ["ترید", "تحلیل تکنیکال", "بازار مالی"],
    duration: "24 ساعت",
    level: "beginner"
  },
  {
    id: "2",
    title: "استراتژی‌های سرمایه‌گذاری در بازار کریپتو",
    instructor: "سارا محمدی",
    thumbnail: "https://images.unsplash.com/photo-1605792657660-596af9009e82?q=80&w=2071&auto=format&fit=crop",
    description: "در این دوره با استراتژی‌های مختلف سرمایه‌گذاری در بازار کریپتو آشنا می‌شوید و می‌آموزید چگونه ریسک‌ها را کاهش داده و بازدهی خود را افزایش دهید.",
    price: 1500000,
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
    price: 980000,
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
    price: 2200000,
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
    price: 0,
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
    price: 1800000,
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
    price: 1300000,
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
    price: 2500000,
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

const mockArticles: Article[] = [
  {
    id: "1",
    title: "اهرم در معاملات: فرصت یا ریسک؟",
    description: "بررسی کامل مفهوم اهرم و تأثیر آن بر معاملات و چگونگی استفاده صحیح از اهرم برای افزایش سود و کاهش ریسک",
    content: "<p>اهرم یکی از ابزارهای مهم در دنیای معاملات مالی است که به معامله‌گران اجازه می‌دهد با سرمایه کمتر، معاملات بزرگتری انجام دهند. در این مقاله به بررسی مفهوم اهرم، مزایا و معایب آن، و استراتژی‌های استفاده صحیح از اهرم می‌پردازیم.</p><h2>اهرم چیست؟</h2><p>اهرم در معاملات به معنای استفاده از پول قرضی برای افزایش قدرت خرید است. برای مثال، با اهرم 1:100 می‌توانید با 1000 دلار، معاملاتی به ارزش 100,000 دلار انجام دهید.</p><h2>مزایای استفاده از اهرم</h2><ul><li>افزایش سود بالقوه</li><li>امکان معامله در بازارهایی با سرمایه کمتر</li><li>تنوع بخشیدن به سبد سرمایه‌گذاری</li></ul><h2>معایب و خطرات اهرم</h2><ul><li>افزایش ریسک و احتمال از دست دادن سرمایه</li><li>فشار روانی بیشتر در معاملات</li><li>امکان مارجین کال و بسته شدن اجباری معاملات</li></ul><h2>استراتژی‌های استفاده صحیح از اهرم</h2><p>برای استفاده صحیح از اهرم، رعایت نکات زیر ضروری است:</p><ol><li>هرگز بیش از 1-2 درصد سرمایه خود را در یک معامله به خطر نیندازید</li><li>از اهرم بالا برای معاملات کوتاه‌مدت و اهرم کمتر برای معاملات بلندمدت استفاده کنید</li><li>همیشه از حد ضرر استفاده کنید</li><li>قبل از استفاده از اهرم، استراتژی معاملاتی خود را به خوبی آزمایش کنید</li></ol><p>در نهایت، اهرم ابزاری دو لبه است که در صورت استفاده صحیح می‌تواند به افزایش سود کمک کند، اما استفاده نادرست از آن می‌تواند به سرعت به از دست رفتن سرمایه منجر شود.</p>",
    thumbnail: "https://images.unsplash.com/photo-1620228885847-9eab2a1adddc?q=80&w=2073&auto=format&fit=crop",
    author: "علی حسینی",
    date: "1402/03/15",
    readTime: "7 دقیقه",
    tags: ["اهرم", "معاملات", "ریسک", "مدیریت سرمایه"]
  },
  {
    id: "2",
    title: "استراتژی‌های معاملاتی در بازار نزولی",
    description: "چطور در بازار نزولی سود کنیم؟ آشنایی با روش‌های معاملاتی مخصوص بازار نزولی و تکنیک‌های محافظت از سرمایه",
    content: "<p>بازارهای نزولی برای بسیاری از معامله‌گران چالش برانگیز هستند، اما با استراتژی‌های مناسب می‌توان در این شرایط نیز سود کرد. در این مقاله به بررسی استراتژی‌های معاملاتی در بازار نزولی می‌پردازیم.</p><h2>شناخت بازار نزولی</h2><p>بازار نزولی به شرایطی گفته می‌شود که قیمت‌ها به طور مداوم در حال کاهش هستند. شناخت علائم بازار نزولی اولین قدم برای موفقیت در این شرایط است.</p><h2>استراتژی‌های معاملاتی در بازار نزولی</h2><ol><li><strong>فروش استقراضی:</strong> در این استراتژی، شما دارایی را قرض می‌گیرید و می‌فروشید، سپس در قیمت پایین‌تر آن را خریده و به قرض‌دهنده بازمی‌گردانید و از تفاوت قیمت سود می‌برید.</li><li><strong>استفاده از ابزارهای مشتقه:</strong> استفاده از قراردادهای آتی، اختیار معامله و CFDها برای سود در بازار نزولی</li><li><strong>استراتژی هج کردن:</strong> محافظت از سرمایه‌گذاری‌های بلندمدت با پوشش ریسک</li><li><strong>خرید در نقاط حمایت:</strong> شناسایی نقاط حمایت قوی و خرید در این نقاط برای سود در بازگشت‌های کوتاه‌مدت</li></ol><h2>مدیریت ریسک در بازار نزولی</h2><p>مدیریت ریسک در بازار نزولی از اهمیت بیشتری برخوردار است. استفاده از حد ضرر، کاهش اندازه معاملات و حفظ بخشی از سرمایه به صورت نقد از اصول مهم مدیریت ریسک در این شرایط هستند.</p><p>با درک صحیح از شرایط بازار و استفاده از استراتژی‌های مناسب، بازار نزولی نیز می‌تواند فرصت‌های سودآوری ایجاد کند.</p>",
    thumbnail: "https://images.unsplash.com/photo-1634704784915-aacf363b021f?q=80&w=2070&auto=format&fit=crop",
    author: "سارا محمدی",
    date: "1402/02/20",
    readTime: "5 دقیقه",
    tags: ["بازار نزولی", "استراتژی", "فروش استقراضی", "مدیریت ریسک"]
  },
  {
    id: "3",
    title: "تحلیل بنیادی و اهمیت آن در انتخاب ارزهای دیجیتال",
    description: "چگونه با تحلیل بنیادی پروژه‌های ارز دیجیتال را ارزیابی کنیم؟ معیارهای مهم در تحلیل بنیادی ارزهای دیجیتال",
    content: "<p>تحلیل بنیادی در دنیای ارزهای دیجیتال به معنای بررسی عوامل زیربنایی یک پروژه برای ارزیابی ارزش واقعی و پتانسیل رشد آن است. در این مقاله به روش‌های تحلیل بنیادی پروژه‌های ارز دیجیتال می‌پردازیم.</p><h2>اهمیت تحلیل بنیادی در ارزهای دیجیتال</h2><p>برخلاف بازارهای سنتی، در بازار ارزهای دیجیتال، تحلیل بنیادی شامل بررسی تکنولوژی، تیم توسعه‌دهنده، کاربردهای عملی پروژه و اکوسیستم آن می‌شود.</p><h2>معیارهای مهم در تحلیل بنیادی</h2><ol><li><strong>تکنولوژی و نوآوری:</strong> آیا پروژه از تکنولوژی منحصر به فردی استفاده می‌کند؟ آیا مشکل واقعی را حل می‌کند؟</li><li><strong>تیم توسعه‌دهنده:</strong> بررسی تجربه، تخصص و سابقه تیم پروژه</li><li><strong>رقابت و مزیت رقابتی:</strong> مقایسه پروژه با رقبا و ارزیابی مزیت رقابتی آن</li><li><strong>توکنومیکس:</strong> بررسی مدل اقتصادی پروژه، عرضه و تقاضای توکن، و مکانیسم‌های حکمرانی</li><li><strong>پذیرش و کاربرد:</strong> میزان استفاده از پروژه در دنیای واقعی و پتانسیل پذیرش گسترده</li></ol><h2>منابع برای تحلیل بنیادی</h2><p>برای تحلیل بنیادی ارزهای دیجیتال می‌توانید از منابع زیر استفاده کنید:</p><ul><li>وایت‌پیپر پروژه</li><li>وب‌سایت رسمی و شبکه‌های اجتماعی</li><li>گیت‌هاب و فعالیت توسعه‌دهندگان</li><li>گزارش‌های تحقیقاتی مستقل</li><li>داشبوردهای تحلیلی مانند CoinMarketCap، CoinGecko و Messari</li></ul><p>تحلیل بنیادی به سرمایه‌گذاران کمک می‌کند تا با دید روشن‌تری نسبت به پتانسیل بلندمدت پروژه‌ها تصمیم‌گیری کنند و از هیجانات کوتاه‌مدت بازار دور بمانند.</p>",
    thumbnail: "https://images.unsplash.com/photo-1627469629282-e2f7f4238267?q=80&w=2070&auto=format&fit=crop",
    author: "مهدی اکبری",
    date: "1402/01/10",
    readTime: "8 دقیقه",
    tags: ["تحلیل بنیادی", "ارز دیجیتال", "سرمایه‌گذاری", "بلاکچین"]
  },
  {
    id: "4",
    title: "الگوهای هارمونیک در تحلیل تکنیکال",
    description: "آشنایی با الگوهای هارمونیک و کاربرد آنها در پیش‌بینی روند بازار. این الگوها چگونه به معامله‌گران کمک می‌کنند؟",
    content: "<p>الگوهای هارمونیک از جمله ابزارهای پیشرفته در تحلیل تکنیکال هستند که بر اساس نسبت‌های فیبوناچی شکل می‌گیرند. در این مقاله به بررسی مهم‌ترین الگوهای هارمونیک و نحوه استفاده از آنها می‌پردازیم.</p><h2>الگوهای هارمونیک چیستند؟</h2><p>الگوهای هارمونیک، الگوهای قیمتی هستند که در نمودارهای قیمت شکل می‌گیرند و از نسبت‌های فیبوناچی برای تعیین نقاط برگشت احتمالی قیمت استفاده می‌کنند. این الگوها معمولاً متقارن هستند و از پنج نقطه (XABCD) تشکیل می‌شوند.</p><h2>انواع مهم الگوهای هارمونیک</h2><ol><li><strong>الگوی گارتلی (Gartley):</strong> اولین و معروف‌ترین الگوی هارمونیک که در سال 1935 توسط H.M. گارتلی معرفی شد.</li><li><strong>الگوی پروانه (Butterfly):</strong> یک الگوی برگشتی که در انتهای روندها شکل می‌گیرد.</li><li><strong>الگوی خفاش (Bat):</strong> یکی از دقیق‌ترین الگوهای هارمونیک که دارای نسبت‌های فیبوناچی خاصی است.</li><li><strong>الگوی کراب (Crab):</strong> یک الگوی برگشتی قوی که دارای حرکت انتهایی شدیدی است.</li><li><strong>الگوی سایفر (Cypher):</strong> یک الگوی پنج نقطه‌ای که با نسبت‌های خاصی شناخته می‌شود.</li></ol><h2>نحوه استفاده از الگوهای هارمونیک در معاملات</h2><p>برای استفاده از الگوهای هارمونیک، باید مراحل زیر را دنبال کنید:</p><ul><li>شناسایی الگو در نمودار قیمت</li><li>تأیید نسبت‌های فیبوناچی</li><li>تعیین نقطه ورود (معمولاً در نقطه D)</li><li>تعیین حد ضرر (زیر یا بالای نقطه X)</li><li>تعیین اهداف قیمتی (با استفاده از نسبت‌های فیبوناچی)</li></ul><p>الگوهای هارمونیک ابزار قدرتمندی هستند، اما نباید به تنهایی مورد استفاده قرار گیرند. ترکیب این الگوها با سایر روش‌های تحلیل تکنیکال و مدیریت ریسک مناسب، می‌تواند به نتایج بهتری منجر شود.</p>",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop",
    author: "حمید نوری",
    date: "1402/04/05",
    readTime: "10 دقیقه",
    tags: ["تحلیل تکنیکال", "الگوهای هارمونیک", "فیبوناچی", "پیش‌بینی روند"]
  },
  {
    id: "5",
    title: "روانشناسی معامله‌گری موفق",
    description: "چگونه بر جنبه‌های روانشناختی معامله‌گری مسلط شویم؟ اهمیت کنترل احساسات در موفقیت مالی",
    content: "<p>روانشناسی معامله‌گری یکی از مهم‌ترین جنبه‌های موفقیت در بازارهای مالی است که اغلب نادیده گرفته می‌شود. در این مقاله به بررسی جنبه‌های روانشناختی معامله‌گری و روش‌های تقویت ذهنیت معامله‌گری می‌پردازیم.</p><h2>چالش‌های روانشناختی در معامله‌گری</h2><p>معامله‌گران با چالش‌های روانشناختی متعددی مواجه هستند:</p><ul><li><strong>ترس و طمع:</strong> دو احساس اصلی که می‌توانند تصمیمات معامله‌گری را تحت تأثیر قرار دهند.</li><li><strong>سوگیری‌های شناختی:</strong> مانند سوگیری تأیید، سوگیری دسترسی و اثر مالکیت.</li><li><strong>مدیریت استرس:</strong> فشار ناشی از نوسانات بازار و مدیریت ریسک.</li><li><strong>انضباط:</strong> پایبندی به استراتژی و برنامه معاملاتی.</li></ul><h2>تکنیک‌های روانشناختی برای معامله‌گران</h2><ol><li><strong>روزنگاری معاملات:</strong> ثبت و تحلیل معاملات برای یادگیری از اشتباهات و موفقیت‌ها.</li><li><strong>تمرینات ذهنی:</strong> مدیتیشن، تنفس عمیق و تصویرسازی ذهنی برای کنترل استرس.</li><li><strong>تعیین قوانین معاملاتی:</strong> ایجاد و پیروی از مجموعه قوانین معاملاتی برای جلوگیری از تصمیمات احساسی.</li><li><strong>مدیریت انتظارات:</strong> تعیین اهداف واقع‌بینانه و پذیرش ریسک و زیان به عنوان بخشی از فرآیند.</li></ol><h2>ایجاد ذهنیت معامله‌گری موفق</h2><p>یک ذهنیت معامله‌گری موفق شامل موارد زیر است:</p><ul><li><strong>پذیرش عدم قطعیت:</strong> درک این نکته که هیچ معامله‌ای 100% تضمین شده نیست.</li><li><strong>تفکر احتمالاتی:</strong> تمرکز بر نتایج بلندمدت به جای نتایج هر معامله.</li><li><strong>پشتکار و انعطاف‌پذیری:</strong> توانایی سازگاری با شرایط متغیر بازار و یادگیری مداوم.</li><li><strong>مسئولیت‌پذیری:</strong> پذیرش مسئولیت کامل نتایج معاملات.</li></ul><p>با تقویت جنبه‌های روانشناختی معامله‌گری، می‌توانید به طور قابل توجهی عملکرد خود در بازارهای مالی را بهبود بخشید و به یک معامله‌گر منظم و سودآور تبدیل شوید.</p>",
    thumbnail: "https://images.unsplash.com/photo-1521898284481-a5ec348cb555?q=80&w=2070&auto=format&fit=crop",
    author: "زهرا کمالی",
    date: "1402/05/12",
    readTime: "7 دقیقه",
    tags: ["روانشناسی", "معامله‌گری", "کنترل احساسات", "استراتژی ذهنی"]
  },
  {
    id: "6",
    title: "اصول سرمایه‌گذاری ارزشی در بازار سهام",
    description: "مروری بر اصول و استراتژی‌های سرمایه‌گذاری ارزشی که توسط وارن بافت و سایر سرمایه‌گذاران موفق استفاده می‌شود",
    content: "<p>سرمایه‌گذاری ارزشی (Value Investing) یکی از راهبردهای اصلی در بازار سهام است که توسط بنیامین گراهام مطرح شد و بعدها توسط شاگردش وارن بافت به شهرت رسید. در این مقاله به بررسی اصول این روش می‌پردازیم.</p><h2>مفهوم سرمایه‌گذاری ارزشی</h2><p>سرمایه‌گذاری ارزشی بر این اصل استوار است که هر سهم دارای یک ارزش ذاتی است که می‌تواند با قیمت بازار آن متفاوت باشد. هدف سرمایه‌گذار ارزشی، یافتن سهام شرکت‌هایی است که قیمت بازار آنها کمتر از ارزش ذاتی‌شان است.</p><h2>اصول سرمایه‌گذاری ارزشی</h2><ol><li><strong>حاشیه امنیت:</strong> خرید سهام با قیمتی کمتر از ارزش ذاتی برای ایجاد حاشیه امنیت.</li><li><strong>تحلیل بنیادی:</strong> بررسی دقیق صورت‌های مالی، مدل کسب‌وکار و مزیت رقابتی شرکت.</li><li><strong>دیدگاه بلندمدت:</strong> تمرکز بر عملکرد بلندمدت شرکت به جای نوسانات کوتاه‌مدت قیمت سهام.</li><li><strong>تفکر مستقل:</strong> تصمیم‌گیری بر اساس تحلیل شخصی و عدم تأثیرپذیری از هیجانات بازار.</li></ol><h2>شاخص‌های ارزشیابی در سرمایه‌گذاری ارزشی</h2><p>سرمایه‌گذاران ارزشی معمولاً از شاخص‌های زیر برای ارزیابی سهام استفاده می‌کنند:</p><ul><li><strong>نسبت قیمت به درآمد (P/E):</strong> مقایسه قیمت سهام با درآمد هر سهم.</li><li><strong>نسبت قیمت به ارزش دفتری (P/B):</strong> مقایسه قیمت سهام با ارزش دفتری هر سهم.</li><li><strong>نسبت قیمت به جریان نقدی (P/CF):</strong> مقایسه قیمت سهام با جریان نقدی هر سهم.</li><li><strong>بازده سود تقسیمی:</strong> نسبت سود تقسیمی به قیمت سهام.</li><li><strong>بدهی به حقوق صاحبان سهام:</strong> نسبت کل بدهی‌ها به حقوق صاحبان سهام.</li></ul><h2>استراتژی‌های سرمایه‌گذاری ارزشی</h2><p>برخی استراتژی‌های رایج در سرمایه‌گذاری ارزشی عبارتند از:</p><ul><li><strong>خرید سهام ارزان:</strong> یافتن سهام با نسبت‌های قیمت به درآمد یا قیمت به ارزش دفتری پایین.</li><li><strong>شرکت‌های با کیفیت در صنایع دفاعی:</strong> سرمایه‌گذاری در شرکت‌های با ثبات در صنایع ضروری.</li><li><strong>سهام برگشتی:</strong> شناسایی شرکت‌هایی که از مشکلات موقت رنج می‌برند اما پتانسیل بهبود دارند.</li><li><strong>سرمایه‌گذاری در شرکت‌های با مزیت رقابتی پایدار:</strong> آنچه وارن بافت «خندق اقتصادی» می‌نامد.</li></ul><p>سرمایه‌گذاری ارزشی نیازمند صبر، انضباط و تحلیل دقیق است. این روش گرچه ممکن است در کوتاه‌مدت جذابیت کمتری داشته باشد، اما در بلندمدت نتایج قابل توجهی به همراه دارد.</p>",
    thumbnail: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2070&auto=format&fit=crop",
    author: "امین رضایی",
    date: "1402/06/23",
    readTime: "9 دقیقه",
    tags: ["سرمایه‌گذاری ارزشی", "بورس", "وارن بافت", "تحلیل بنیادی"]
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
