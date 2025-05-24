
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bookmark, BookmarkPlus, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fetchArticleById, bookmarks, addBookmark, removeBookmark } = useData();
  
  const [article, setArticle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const loadArticle = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await fetchArticleById(id);
        setArticle(data);
        
        // Check if the article is bookmarked
        const bookmarked = bookmarks.some(
          bookmark => bookmark.itemId === id && bookmark.itemType === "article"
        );
        setIsBookmarked(bookmarked);
      } catch (error) {
        console.error("Error loading article:", error);
        toast({
          title: "خطا در بارگذاری مقاله",
          description: "متأسفانه مشکلی در بارگذاری مقاله به وجود آمد.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadArticle();
  }, [id, fetchArticleById, bookmarks]);

  const handleBookmark = () => {
    if (!id || !article) return;
    
    if (isBookmarked) {
      const bookmarkToRemove = bookmarks.find(
        bookmark => bookmark.itemId === id && bookmark.itemType === "article"
      );
      if (bookmarkToRemove) {
        removeBookmark(bookmarkToRemove.id);
        setIsBookmarked(false);
        toast({
          title: "نشان حذف شد",
          description: "این مقاله از نشان‌های شما حذف شد",
        });
      }
    } else {
      addBookmark(id, "article", "user1"); // TODO: Replace with actual user ID
      setIsBookmarked(true);
      toast({
        title: "به نشان‌ها اضافه شد",
        description: "این مقاله به نشان‌های شما اضافه شد",
      });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "لینک کپی شد",
      description: "لینک این مقاله در کلیپ‌بورد کپی شد",
    });
  };

  // Format author name
  const formatAuthorName = (author: any) => {
    if (!author) return "نویسنده ناشناس";
    return (author.first_name || author.last_name) 
      ? `${author.first_name || ''} ${author.last_name || ''}`.trim()
      : "نویسنده ناشناس";
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="trader-container py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
            <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
            <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="trader-container py-8">
          <div className="text-center">مقاله مورد نظر یافت نشد</div>
          <Button 
            onClick={() => navigate("/articles")}
            className="mt-4 mx-auto block"
          >
            بازگشت به لیست مقالات
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="trader-container py-8">
        <Button
          variant="ghost"
          className="mb-6 flex items-center gap-2"
          onClick={() => navigate("/articles")}
        >
          <ArrowRight size={18} />
          <span>بازگشت به لیست مقالات</span>
        </Button>

        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-2xl font-bold text-right">{article.title}</h1>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleBookmark}
                  className="rounded-full"
                >
                  {isBookmarked ? (
                    <Bookmark className="h-5 w-5" />
                  ) : (
                    <BookmarkPlus className="h-5 w-5" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleShare}
                  className="rounded-full"
                >
                  <Share className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-gray-500 mb-6 justify-end">
              <span>{formatAuthorName(article.author)}</span>
              <span>•</span>
              <span>
                {article.published_at
                  ? formatDate(article.published_at.split('T')[0])
                  : formatDate(article.created_at.split('T')[0])
                }
              </span>
              <span>•</span>
              <span>{`${article.view_count} بازدید`}</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-8 justify-end">
              {article.tags && article.tags.map((tag: any) => (
                <span
                  key={tag.id}
                  className="bg-trader-100 text-trader-800 text-xs px-3 py-1 rounded-full"
                >
                  {tag.name}
                </span>
              ))}
            </div>

            <img
              src={article.thumbnail}
              alt={article.title}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />

            <div className="prose max-w-none text-right">
              {article.summary && (
                <p className="font-bold text-gray-800 mb-4">{article.summary}</p>
              )}
              <div dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br/>') }} />
            </div>
            
            <div className="mt-8 pt-4 border-t border-gray-200">
              <h3 className="font-bold text-right mb-2">دسته‌بندی:</h3>
              <p className="text-gray-600 text-right">
                {article.category?.name || "دسته‌بندی نشده"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ArticleDetailPage;
