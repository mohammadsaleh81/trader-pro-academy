
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bookmark, BookmarkPlus, Share, Play, Download, Clock, Eye, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { Article, Video, articlesApi, videosApi } from "@/lib/api";

type ContentType = Article | Video;

const ContentDetailPage: React.FC = () => {
  const { id, type } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { bookmarks, addBookmark, removeBookmark } = useData();
  
  const [content, setContent] = useState<ContentType | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      if (!id || !type) {
        navigate('/content');
        return;
      }

      try {
        setIsLoading(true);
        let data;
        const contentType = type.replace(/s$/, ''); // Remove trailing 's' if exists
        
        switch (contentType) {
          case "article":
            data = await articlesApi.getById(id);
            break;
          case "video":
            data = await videosApi.getById(id);
            break;
          default:
            navigate('/content');
            return;
        }

        if (!data) {
          navigate('/content');
          return;
        }

        setContent(data);
        
        // Check if the item is bookmarked
        const bookmarked = bookmarks.some(
          bookmark => bookmark.itemId === id && bookmark.itemType === contentType
        );
        setIsBookmarked(bookmarked);
      } catch (error) {
        console.error('Error fetching content:', error);
        toast({
          title: "خطا در دریافت محتوا",
          description: "لطفا دوباره تلاش کنید",
          variant: "destructive",
        });
        navigate('/content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [id, type, navigate, toast, bookmarks]);

  const handleBookmark = () => {
    if (!content || !id || !type) return;
    
    const contentType = type.replace(/s$/, '') as "article" | "video";
    
    if (isBookmarked) {
      const bookmarkToRemove = bookmarks.find(
        bookmark => bookmark.itemId === id && bookmark.itemType === contentType
      );
      if (bookmarkToRemove) {
        removeBookmark(bookmarkToRemove.id);
        setIsBookmarked(false);
        toast({
          title: "نشان حذف شد",
          description: "این محتوا از نشان‌های شما حذف شد",
        });
      }
    } else {
      addBookmark(id, contentType, "user1");
      setIsBookmarked(true);
      toast({
        title: "به نشان‌ها اضافه شد",
        description: "این محتوا به نشان‌های شما اضافه شد",
      });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "لینک کپی شد",
      description: "لینک این محتوا در کلیپ‌بورد کپی شد",
    });
  };

  const renderContentMedia = () => {
    if (!content) return null;

    if ('video_type' in content) { // It's a video
      return (
        <div className="w-full aspect-video bg-gray-100 rounded-lg mb-6 relative">
          {content.video_embed ? (
            <div dangerouslySetInnerHTML={{ __html: content.video_embed }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">ویدیو در دسترس نیست</p>
              </div>
            </div>
          )}
        </div>
      );
    } else { // It's an article
      return content.thumbnail ? (
        <img
          src={content.thumbnail}
          alt={content.title}
          className="w-full h-64 object-cover rounded-lg mb-6"
        />
      ) : null;
    }
  };

  const renderContentStats = () => {
    if (!content) return null;

    return (
      <div className="flex items-center gap-6 text-sm text-gray-500 mb-6 justify-end">
        {content.author && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{content.author}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{formatDate('published' in content ? content.published : content.created_at)}</span>
        </div>
        
        {'duration' in content && (
          <div className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            <span>{content.duration}</span>
          </div>
        )}
        
        {'view_count' in content && (
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>{content.view_count.toLocaleString()} بازدید</span>
          </div>
        )}
      </div>
    );
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

  if (!content) {
    return (
      <Layout>
        <div className="trader-container py-8">
          <div className="text-center">محتوای مورد نظر یافت نشد</div>
          <Button 
            onClick={() => navigate("/content")}
            className="mt-4 mx-auto block"
          >
            بازگشت به کتابخانه محتوا
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
          onClick={() => navigate("/content")}
        >
          <ArrowRight size={18} />
          <span>بازگشت به کتابخانه محتوا</span>
        </Button>

        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-2xl font-bold text-right flex-1 ml-4">{content.title}</h1>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleBookmark}
                  className="rounded-full"
                >
                  {isBookmarked ? (
                    <Bookmark className="h-5 w-5 fill-current" />
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

            {renderContentStats()}

            <div className="flex flex-wrap gap-2 mb-8 justify-end">
              {content.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="bg-trader-100 text-trader-800 text-xs px-3 py-1 rounded-full"
                >
                  {tag.name}
                </span>
              ))}
            </div>

            {renderContentMedia()}

            {'content' in content ? (
              <div 
                className="prose prose-lg max-w-none text-right prose-headings:text-right prose-p:text-right" 
                dir="rtl"
                dangerouslySetInnerHTML={{ __html: content.content }}
              />
            ) : (
              <div 
                className="prose prose-lg max-w-none text-right prose-headings:text-right prose-p:text-right" 
                dir="rtl"
                dangerouslySetInnerHTML={{ __html: content.description }}
              />
            )}

            {/* Related content section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-right">محتوای مرتبط</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* This could be populated with related content in the future */}
                <div className="text-center text-gray-500 py-8">
                  محتوای مرتبط به‌زودی اضافه خواهد شد
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ContentDetailPage;
