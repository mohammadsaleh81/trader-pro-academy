
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Bookmark } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import CourseCard from "@/components/course/CourseCard";
import ContentCard from "@/components/content/ContentCard";

// Define the bookmark category types
type BookmarkCategory = "courses" | "articles" | "podcasts" | "videos" | "webinars" | "files";

const BookmarksPage: React.FC = () => {
  const { user } = useAuth();
  const { bookmarks, courses, articles, podcasts, videos, webinars, files } = useData();
  
  const [activeCategory, setActiveCategory] = useState<BookmarkCategory>("courses");
  
  // Redirect to login if not authenticated
  if (!user) {
    window.location.href = "/login";
    return null;
  }
  
  // Filter bookmarks for the current user
  const userBookmarks = bookmarks.filter(b => b.userId === user.id);
  
  // Get content based on bookmark category and type
  const getContentByCategory = () => {
    const bookmarksByType = userBookmarks.filter(b => {
      switch (activeCategory) {
        case "courses": return b.itemType === "course";
        case "articles": return b.itemType === "article";
        case "podcasts": return b.itemType === "podcast";
        case "videos": return b.itemType === "video";
        case "webinars": return b.itemType === "webinar";
        case "files": return b.itemType === "file";
        default: return false;
      }
    });
    
    const itemIds = bookmarksByType.map(b => b.itemId);
    
    switch (activeCategory) {
      case "courses": return courses.filter(c => itemIds.includes(c.id));
      case "articles": return articles.filter(a => itemIds.includes(a.id));
      case "podcasts": return podcasts.filter(p => itemIds.includes(p.id));
      case "videos": return videos.filter(v => itemIds.includes(v.id));
      case "webinars": return webinars.filter(w => itemIds.includes(w.id));
      case "files": return files.filter(f => itemIds.includes(f.id));
      default: return [];
    }
  };
  
  const content = getContentByCategory();
  
  return (
    <Layout>
      <div className="trader-container py-6">
        <div className="flex items-center gap-2 mb-6">
          <Bookmark className="h-5 w-5 text-trader-500" />
          <h1 className="text-2xl font-bold">نشان‌های من</h1>
        </div>
        
        {/* Category Tabs */}
        <div className="mb-6 border-b border-gray-200 overflow-x-auto pb-1">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveCategory("courses")}
              className={`py-2 px-1 font-medium text-sm whitespace-nowrap ${activeCategory === "courses" ? "text-trader-500 border-b-2 border-trader-500" : "text-gray-600"}`}
            >
              دوره‌ها
            </button>
            <button
              onClick={() => setActiveCategory("articles")}
              className={`py-2 px-1 font-medium text-sm whitespace-nowrap ${activeCategory === "articles" ? "text-trader-500 border-b-2 border-trader-500" : "text-gray-600"}`}
            >
              مقالات
            </button>
            <button
              onClick={() => setActiveCategory("podcasts")}
              className={`py-2 px-1 font-medium text-sm whitespace-nowrap ${activeCategory === "podcasts" ? "text-trader-500 border-b-2 border-trader-500" : "text-gray-600"}`}
            >
              پادکست‌ها
            </button>
            <button
              onClick={() => setActiveCategory("videos")}
              className={`py-2 px-1 font-medium text-sm whitespace-nowrap ${activeCategory === "videos" ? "text-trader-500 border-b-2 border-trader-500" : "text-gray-600"}`}
            >
              ویدیوها
            </button>
            <button
              onClick={() => setActiveCategory("webinars")}
              className={`py-2 px-1 font-medium text-sm whitespace-nowrap ${activeCategory === "webinars" ? "text-trader-500 border-b-2 border-trader-500" : "text-gray-600"}`}
            >
              وبینارها
            </button>
            <button
              onClick={() => setActiveCategory("files")}
              className={`py-2 px-1 font-medium text-sm whitespace-nowrap ${activeCategory === "files" ? "text-trader-500 border-b-2 border-trader-500" : "text-gray-600"}`}
            >
              فایل‌ها
            </button>
          </div>
        </div>
        
        {/* Content Section */}
        <div>
          {content.length === 0 ? (
            <div className="text-center py-12">
              <Bookmark className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-1">هنوز نشانی ذخیره نکرده‌اید</h3>
              <p className="text-gray-500 text-sm">آیتم‌های مورد علاقه خود را ذخیره کنید تا بعداً به آن‌ها دسترسی داشته باشید</p>
            </div>
          ) : (
            <>
              {activeCategory === "courses" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {content.map((course) => (
                    <CourseCard
                      key={course.id}
                      id={course.id}
                      title={course.title}
                      instructor={course.instructor}
                      thumbnail={course.thumbnail}
                      price={course.price}
                      rating={course.rating}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {content.map((item: any) => {
                    let type: "article" | "podcast" | "video" | "webinar" | "file";
                    
                    switch (activeCategory) {
                      case "articles": type = "article"; break;
                      case "podcasts": type = "podcast"; break;
                      case "videos": type = "video"; break;
                      case "webinars": type = "webinar"; break;
                      case "files": type = "file"; break;
                      default: type = "article";
                    }
                    
                    return (
                      <ContentCard
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        description={item.description}
                        thumbnail={item.thumbnail}
                        type={type}
                        date={item.date}
                        author={item.author}
                        duration={item.duration}
                        fileSize={item.fileSize}
                        fileType={item.fileType}
                      />
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BookmarksPage;
