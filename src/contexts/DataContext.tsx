
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

// Context Type
interface DataContextType {
  courses: Course[];
  articles: Article[];
  podcasts: Podcast[];
  videos: Video[];
  webinars: Webinar[];
  files: File[];
  bookmarks: Bookmark[];
  addBookmark: (itemId: string, itemType: ItemType, userId: string) => void;
  removeBookmark: (id: string) => void;
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
    categories: ["ترید", "تحلیل تکنیکال"]
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
    categories: ["کریپتو", "سرمایه‌گذاری"]
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
    thumbnail: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?q=80I'll implement the design style from your uploaded images to create a similar look and feel for the Mr. Trader Academy platform. I'll fix the current build error first and then enhance the design.

<lov-code>
Let's start by fixing the build error in BookmarksPage.tsx and then implement the design inspired by the uploaded images:

First, let's fix the type error in BookmarksPage.tsx:
<lov-write file_path="src/components/ui/carousel-card.tsx">
import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type CarouselCardProps = {
  children: React.ReactNode;
  className?: string;
  controlsClassName?: string;
  showControls?: boolean;
};

const CarouselCard: React.FC<CarouselCardProps> = ({
  children,
  className,
  controlsClassName,
  showControls = true
}) => {
  return (
    <Carousel className={cn("w-full", className)}>
      <CarouselContent>
        {React.Children.map(children, (child, index) => (
          <CarouselItem key={index}>
            {child}
          </CarouselItem>
        ))}
      </CarouselContent>
      
      {showControls && (
        <>
          <CarouselPrevious className={cn("-left-3 md:-left-5", controlsClassName)} />
          <CarouselNext className={cn("-right-3 md:-right-5", controlsClassName)} />
        </>
      )}
    </Carousel>
  );
};

export default CarouselCard;
