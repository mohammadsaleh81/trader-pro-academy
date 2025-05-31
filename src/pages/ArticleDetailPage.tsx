
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Article, articlesApi } from "@/lib/api";
import ContentActions from "@/components/content/ContentActions";
import ContentFooter from "@/components/content/ContentFooter";
import CommentSection from "@/components/comments/CommentSection";

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { bookmarks, addBookmark, removeBookmark } = useData();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) {
        navigate('/content');
        return;
      }

      try {
        setIsLoading(true);
        const data = await articlesApi.getById(id);

        if (!data) {
          navigate('/content');
          return;
        }

        setArticle(data);
        
        // Check if the item is bookmarked
        const bookmarked = bookmarks.some(
          bookmark => bookmark.itemId === id && bookmark.itemType === "article"
        );
        setIsBookmarked(bookmarked);
      } catch (error) {
        console.error('Error fetching article:', error);
        toast({
          title: "خطا در دریافت مقاله",
          description: "لطفا دوباره تلاش کنید",
          variant: "destructive",
        });
        navigate('/content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [id, navigate, toast, bookmarks]);

  const handleBookmark = () => {
    if (!article || !id) return;
    
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
      addBookmark(id, "article", "user1");
      setIsBookmarked(true);
      toast({
        title: "به نشان‌ها اضافه شد",
        description: "این مقاله به نشان‌های شما اضافه شد",
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="trader-container py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="trader-container py-8">
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-4">مقاله مورد نظر یافت نشد</p>
            <Button 
              onClick={() => navigate("/content")}
              className="mx-auto"
            >
              بازگشت به کتابخانه محتوا
            </Button>
          </div>
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
          onClick={() => navigate("/content")}
        >
          <ArrowRight size={18} />
          <span>بازگشت به کتابخانه محتوا</span>
        </Button>

        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-2xl font-bold text-right flex-1 ml-4">{article.title}</h1>
            </div>

            <div className="flex justify-end mb-6">
              <ContentActions 
                isBookmarked={isBookmarked}
                onBookmark={handleBookmark}
                title={article.title}
              />
            </div>

            {article.thumbnail && (
              <img
                src={article.thumbnail}
                alt={article.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}

            <div 
              className="prose prose-lg max-w-none text-right prose-headings:text-right prose-p:text-right mb-12" 
              dir="rtl"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            <ContentFooter
              author={article.author}
              publishDate={article.published}
              viewCount={article.view_count}
              tags={article.tags}
            />

            {/* Comments Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <CommentSection
                contentType="article"
                contentId={id!}
              />
            </div>

            {/* Related content section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-right">مقالات مرتبط</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center text-gray-500 py-8">
                  مقالات مرتبط به‌زودی اضافه خواهد شد
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ArticleDetailPage;
