
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Article, Video, articlesApi, videosApi } from "@/lib/api";
import ContentDetailHeader from "@/components/content/ContentDetailHeader";
import ContentStats from "@/components/content/ContentStats";
import ContentActions from "@/components/content/ContentActions";
import ContentMedia from "@/components/content/ContentMedia";
import RelatedContent from "@/components/content/RelatedContent";

type ContentType = Article | Video;

const ContentDetailPage: React.FC = () => {
  const { id, type } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { bookmarks, addBookmark, removeBookmark } = useData();
  
  const [content, setContent] = useState<ContentType | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      console.log('ContentDetailPage: Fetching content for ID:', id, 'Type:', type);
      
      if (!id || !type) {
        console.error('ContentDetailPage: Missing ID or type parameters');
        setError('پارامترهای مورد نیاز یافت نشد');
        navigate('/content');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        let data;
        const contentType = type.replace(/s$/, ''); // Remove trailing 's' if exists
        
        console.log('ContentDetailPage: Normalized content type:', contentType);
        
        switch (contentType) {
          case "article":
            console.log('ContentDetailPage: Fetching article with ID:', id);
            data = await articlesApi.getById(id);
            break;
          case "video":
            console.log('ContentDetailPage: Fetching video with ID:', id);
            data = await videosApi.getById(id);
            break;
          default:
            console.error('ContentDetailPage: Unknown content type:', contentType);
            setError('نوع محتوای نامشخص');
            navigate('/content');
            return;
        }

        console.log('ContentDetailPage: Fetched data:', data);

        if (!data) {
          console.error('ContentDetailPage: No data received for ID:', id);
          setError('محتوا یافت نشد');
          navigate('/content');
          return;
        }

        setContent(data);
        
        // Check if the item is bookmarked
        const bookmarked = bookmarks.some(
          bookmark => bookmark.itemId === id && bookmark.itemType === contentType
        );
        setIsBookmarked(bookmarked);
        console.log('ContentDetailPage: Content loaded successfully, bookmarked:', bookmarked);
      } catch (error) {
        console.error('ContentDetailPage: Error fetching content:', error);
        setError('خطا در دریافت محتوا');
        toast({
          title: "خطا در دریافت محتوا",
          description: "لطفا دوباره تلاش کنید",
          variant: "destructive",
        });
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

  if (error || !content) {
    return (
      <Layout>
        <div className="trader-container py-8">
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-4">
              {error || "محتوای مورد نظر یافت نشد"}
            </p>
            <Button 
              onClick={() => navigate("/content")}
              className="mx-auto bg-trader-500 hover:bg-trader-600"
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
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <ContentDetailHeader title={content.title} />
            
            <div className="flex justify-end mb-6">
              <ContentActions 
                isBookmarked={isBookmarked}
                onBookmark={handleBookmark}
              />
            </div>

            <ContentStats
              author={content.author}
              publishDate={'published' in content ? content.published : content.created_at}
              duration={'duration' in content ? content.duration : undefined}
              viewCount={'view_count' in content ? content.view_count : undefined}
            />

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

            <ContentMedia content={content} />

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

            <RelatedContent />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ContentDetailPage;
