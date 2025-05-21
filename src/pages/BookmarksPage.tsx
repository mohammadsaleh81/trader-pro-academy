
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import ContentList from "@/components/content/ContentList";
import CourseCard from "@/components/course/CourseCard";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

type BookmarkTab = "all" | "courses" | "articles" | "podcasts" | "videos" | "webinars" | "files";

const BookmarksPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<BookmarkTab>("all");
  const { user } = useAuth();
  const { 
    bookmarks, 
    courses,
    articles,
    podcasts,
    videos,
    webinars,
    files
  } = useData();

  if (!user) {
    return (
      <Layout>
        <div className="trader-container py-12 text-center">
          <h2 className="text-xl font-bold mb-4">برای مشاهده نشان‌های خود ابتدا وارد شوید</h2>
          <Link to="/login" className="trader-btn-primary">
            ورود به حساب کاربری
          </Link>
        </div>
      </Layout>
    );
  }

  const userBookmarks = bookmarks.filter(bookmark => bookmark.userId === user.id);

  const filteredBookmarks = activeTab === "all" 
    ? userBookmarks
    : userBookmarks.filter(bookmark => bookmark.itemType === activeTab);

  const bookmarkedCourses = filteredBookmarks
    .filter(bookmark => bookmark.itemType === "course")
    .map(bookmark => courses.find(course => course.id === bookmark.itemId))
    .filter(Boolean);

  const bookmarkedArticles = filteredBookmarks
    .filter(bookmark => bookmark.itemType === "article")
    .map(bookmark => articles.find(article => article.id === bookmark.itemId))
    .filter(Boolean);

  const bookmarkedPodcasts = filteredBookmarks
    .filter(bookmark => bookmark.itemType === "podcast")
    .map(bookmark => podcasts.find(podcast => podcast.id === bookmark.itemId))
    .filter(Boolean);

  const bookmarkedVideos = filteredBookmarks
    .filter(bookmark => bookmark.itemType === "video")
    .map(bookmark => videos.find(video => video.id === bookmark.itemId))
    .filter(Boolean);

  const bookmarkedWebinars = filteredBookmarks
    .filter(bookmark => bookmark.itemType === "webinar")
    .map(bookmark => webinars.find(webinar => webinar.id === bookmark.itemId))
    .filter(Boolean);

  const bookmarkedFiles = filteredBookmarks
    .filter(bookmark => bookmark.itemType === "file")
    .map(bookmark => files.find(file => file.id === bookmark.itemId))
    .filter(Boolean);

  const tabs = [
    { id: "all", label: "همه" },
    { id: "courses", label: "دوره‌ها" },
    { id: "articles", label: "مقالات" },
    { id: "podcasts", label: "پادکست‌ها" },
    { id: "videos", label: "ویدیوها" },
    { id: "webinars", label: "وبینارها" },
    { id: "files", label: "فایل‌ها" },
  ];

  return (
    <Layout>
      <div className="trader-container py-6">
        <h1 className="text-2xl font-bold mb-6">نشان‌های من</h1>
        
        {/* Tabs */}
        <div className="overflow-x-auto mb-6">
          <div className="flex space-x-2 space-x-reverse border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`py-2 px-4 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-trader-500 border-b-2 border-trader-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab(tab.id as BookmarkTab)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Content */}
        {filteredBookmarks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">موردی یافت نشد</p>
          </div>
        ) : (
          <div className="mt-6 space-y-8">
            {/* Bookmarked Courses */}
            {(activeTab === "all" || activeTab === "courses") && bookmarkedCourses.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">دوره‌ها</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {bookmarkedCourses.map((course) => (
                    course && (
                      <CourseCard
                        key={course.id}
                        id={course.id}
                        title={course.title}
                        instructor={course.instructor}
                        thumbnail={course.thumbnail}
                        price={course.price}
                        rating={course.rating}
                      />
                    )
                  ))}
                </div>
              </div>
            )}
            
            {/* Bookmarked Articles */}
            {(activeTab === "all" || activeTab === "articles") && bookmarkedArticles.length > 0 && (
              <ContentList items={bookmarkedArticles} type="article" title="مقالات" />
            )}
            
            {/* Bookmarked Podcasts */}
            {(activeTab === "all" || activeTab === "podcasts") && bookmarkedPodcasts.length > 0 && (
              <ContentList items={bookmarkedPodcasts} type="podcast" title="پادکست‌ها" />
            )}
            
            {/* Bookmarked Videos */}
            {(activeTab === "all" || activeTab === "videos") && bookmarkedVideos.length > 0 && (
              <ContentList items={bookmarkedVideos} type="video" title="ویدیوها" />
            )}
            
            {/* Bookmarked Webinars */}
            {(activeTab === "all" || activeTab === "webinars") && bookmarkedWebinars.length > 0 && (
              <ContentList items={bookmarkedWebinars} type="webinar" title="وبینارها" />
            )}
            
            {/* Bookmarked Files */}
            {(activeTab === "all" || activeTab === "files") && bookmarkedFiles.length > 0 && (
              <ContentList items={bookmarkedFiles} type="file" title="فایل‌ها" />
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BookmarksPage;
