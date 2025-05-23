
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bookmark, BookmarkPlus, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

const ContentDetailPage: React.FC = () => {
  const { id, type } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    articles, 
    podcasts, 
    videos, 
    webinars, 
    files,
    bookmarks,
    addBookmark,
    removeBookmark 
  } = useData();
  
  const [content, setContent] = useState<any>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (!id || !type) return;

    let item;
    switch (type) {
      case "articles":
        item = articles.find(article => article.id === id);
        break;
      case "podcasts":
        item = podcasts.find(podcast => podcast.id === id);
        break;
      case "videos":
        item = videos.find(video => video.id === id);
        break;
      case "webinars":
        item = webinars.find(webinar => webinar.id === id);
        break;
      case "files":
        item = files.find(file => file.id === id);
        break;
      default:
        break;
    }

    setContent(item);
    
    // Check if the item is bookmarked
    const bookmarked = bookmarks.some(
      bookmark => bookmark.itemId === id && bookmark.itemType === convertTypeToSingular(type)
    );
    setIsBookmarked(bookmarked);
  }, [id, type, articles, podcasts, videos, webinars, files, bookmarks]);

  const convertTypeToSingular = (pluralType: string): string => {
    const typeMap: Record<string, string> = {
      "articles": "article",
      "podcasts": "podcast",
      "videos": "video",
      "webinars": "webinar",
      "files": "file"
    };
    return typeMap[pluralType] || pluralType;
  };

  const handleBookmark = () => {
    if (!content || !id || !type) return;
    
    if (isBookmarked) {
      const bookmarkToRemove = bookmarks.find(
        bookmark => bookmark.itemId === id && bookmark.itemType === convertTypeToSingular(type)
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
      addBookmark(id, convertTypeToSingular(type) as any, "user1");
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
    if (!content || !type) return null;

    switch (type) {
      case "videos":
      case "webinars":
        return (
          <div className="w-full aspect-video bg-gray-100 rounded-lg mb-6">
            <video
              className="w-full h-full rounded-lg"
              controls
              poster={content.thumbnail}
              src={content.videoUrl}
            />
          </div>
        );
      case "podcasts":
        return (
          <div className="w-full mb-6">
            <img
              src={content.thumbnail}
              alt={content.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <audio
              className="w-full"
              controls
              src={content.audioUrl}
            />
          </div>
        );
      case "files":
        return (
          <div className="w-full flex flex-col items-center mb-6">
            <img
              src={content.thumbnail}
              alt={content.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <Button className="mt-4">
              <a href={content.fileUrl} download>
                دانلود فایل ({content.fileSize})
              </a>
            </Button>
          </div>
        );
      default:
        return (
          <img
            src={content.thumbnail}
            alt={content.title}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
        );
    }
  };

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
              <h1 className="text-2xl font-bold text-right">{content.title}</h1>
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
              <span>{content.author}</span>
              <span>•</span>
              <span>{content.date}</span>
              {content.readTime && (
                <>
                  <span>•</span>
                  <span>{content.readTime}</span>
                </>
              )}
              {content.duration && (
                <>
                  <span>•</span>
                  <span>{content.duration}</span>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-8 justify-end">
              {content.tags && content.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="bg-trader-100 text-trader-800 text-xs px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {renderContentMedia()}

            <div className="prose max-w-none text-right">
              {type === "articles" ? (
                <div>
                  <p className="text-gray-600 mb-4">{content.description}</p>
                  <div dangerouslySetInnerHTML={{ __html: content.content }} />
                </div>
              ) : (
                <p className="text-gray-600">{content.description}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ContentDetailPage;
