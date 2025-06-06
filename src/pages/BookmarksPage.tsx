import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Bookmark } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useContent } from "@/contexts/ContentContext";
import ContentCard from "@/components/content/ContentCard";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Define the bookmark category types
type BookmarkCategory = "articles";

const BookmarksPage: React.FC = () => {
  const { user } = useAuth();
  const { bookmarks, articles, isLoading } = useContent();
  
  const [activeCategory, setActiveCategory] = useState<BookmarkCategory>("articles");
  
  // Redirect to login if not authenticated
  if (!user) {
    window.location.href = "/login";
    return null;
  }
  
  // Get bookmarked articles
  const getBookmarkedArticles = () => {
    const bookmarkedArticleIds = bookmarks.map(b => b.article.id);
    return articles.filter(article => bookmarkedArticleIds.includes(article.id));
  };
  
  const bookmarkedArticles = getBookmarkedArticles();
  
  if (isLoading.bookmarks || isLoading.articles) {
    return (
      <Layout>
        <div className="trader-container py-6">
          <div className="flex items-center gap-2 mb-6">
            <Bookmark className="h-5 w-5 text-trader-500" />
            <h1 className="text-2xl font-bold">نشان‌های من</h1>
          </div>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
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
              onClick={() => setActiveCategory("articles")}
              className={`py-2 px-1 font-medium text-sm whitespace-nowrap ${activeCategory === "articles" ? "text-trader-500 border-b-2 border-trader-500" : "text-gray-600"}`}
            >
              مقالات ({bookmarks.length})
            </button>
          </div>
        </div>
        
        {/* Content Section */}
        <div>
          {bookmarkedArticles.length === 0 ? (
            <EmptyState
              icon={<Bookmark className="h-16 w-16" />}
              title="هنوز مقاله‌ای نشان نکرده‌اید"
              description="مقالات مورد علاقه خود را نشان کنید تا بعداً به آن‌ها دسترسی داشته باشید"
              action={
                <Button asChild className="mt-4 bg-trader-500 hover:bg-trader-600">
                  <Link to="/content">مشاهده محتوا</Link>
                </Button>
              }
            />
          ) : (
            <div className="flex flex-col gap-4">
              {bookmarkedArticles.map((article) => (
                <ContentCard
                  key={article.id}
                  id={article.id}
                  title={article.title}
                  description={article.description}
                  thumbnail={article.thumbnail}
                  type="article"
                  date={article.date}
                  author={article.author}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BookmarksPage;
