
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bookmark, BookmarkPlus, Share, Calendar, User, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fetchArticleById } = useData();
  const { user } = useAuth();
  const { bookmarks, addBookmark, removeBookmark } = useData();
  
  const [article, setArticle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const loadArticle = async () => {
      if (!id) return;
      
      setIsLoading(true);
      const articleData = await fetchArticleById(id);
      setArticle(articleData);
      setIsLoading(false);
    };
    
    loadArticle();
  }, [id, fetchArticleById]);

  useEffect(() => {
    if (user && article) {
      const bookmarked = bookmarks.some(
        bookmark => bookmark.itemId === article.id && bookmark.itemType === "article"
      );
      setIsBookmarked(bookmarked);
    }
  }, [article, bookmarks, user]);

  const handleBookmark = () => {
    if (!user || !article) return;
    
    if (isBookmarked) {
      const bookmarkToRemove = bookmarks.find(
        bookmark => bookmark.itemId === article.id && bookmark.itemType === "article"
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
      addBookmark(article.id, "article", user.id);
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

  if (isLoading) {
    return (
      <Layout>
        <div className="trader-container py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-6 bg-gray-200 w-1/3"></div>
            <div className="h-72 bg-gray-200"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200"></div>
              <div className="h-4 bg-gray-200"></div>
              <div className="h-4 bg-gray-200"></div>
              <div className="h-4 bg-gray-200 w-2/3"></div>
            </div>
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
            <h2 className="text-xl font-bold mb-4">مقاله مورد نظر یافت نشد</h2>
            <Button onClick={() => navigate("/articles")}>
              بازگشت به صفحه مقالات
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
          onClick={() => navigate("/articles")}
        >
          <ArrowRight size={18} />
          <span>بازگشت به مقالات</span>
        </Button>

        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-2xl font-bold text-right">{article.title}</h1>
              <div className="flex gap-2">
                {user && (
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
                )}
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

            {/* Author and date */}
            <div className="flex items-center gap-4 text-gray-500 mb-6 justify-end">
              {article.author.first_name || article.author.last_name ? (
                <div className="flex items-center">
                  <User className="ml-1 h-4 w-4" />
                  <span>{`${article.author.first_name} ${article.author.last_name}`.trim() || "نویسنده ناشناس"}</span>
                </div>
              ) : null}
              
              <span>•</span>
              
              <div className="flex items-center">
                <Calendar className="ml-1 h-4 w-4" />
                <span>
                  {article.published_at 
                    ? new Date(article.published_at).toLocaleDateString('fa-IR') 
                    : new Date(article.created_at).toLocaleDateString('fa-IR')}
                </span>
              </div>
              
              {article.view_count > 0 && (
                <>
                  <span>•</span>
                  <span>{article.view_count} بازدید</span>
                </>
              )}
            </div>

            {/* Category */}
            {article.category && (
              <div className="mb-3 text-right">
                <span className="text-gray-600">دسته‌بندی: </span>
                <Badge variant="outline" className="mr-1">
                  {article.category.name}
                </Badge>
              </div>
            )}

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8 justify-end">
                <Tag className="h-4 w-4 ml-1 text-gray-600" />
                {article.tags.map((tag: any) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="bg-trader-50 text-trader-700 hover:bg-trader-100"
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Featured image */}
            <img
              src={article.thumbnail}
              alt={article.title}
              className="w-full h-auto object-cover rounded-lg mb-6"
            />

            {/* Summary */}
            {article.summary && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6 text-right">
                <p className="font-semibold text-gray-700">{article.summary}</p>
              </div>
            )}

            {/* Article content */}
            <div className="prose max-w-none text-right prose-headings:text-right prose-p:text-right rtl-content">
              {article.content.split("\n").map((paragraph: string, index: number) => (
                <p key={index} className={index === 0 ? "text-lg" : ""}>
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Related tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-lg font-bold mb-3 text-right">برچسب‌های مرتبط</h3>
                <div className="flex flex-wrap gap-2 justify-end">
                  {article.tags.map((tag: any) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="bg-trader-50 text-trader-700 hover:bg-trader-100"
                      onClick={() => navigate(`/articles?tag=${tag.slug}`)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ArticleDetailPage;
