import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkPlus, Loader, Heart, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useContent } from "@/contexts/ContentContext";
import { useAuth } from "@/contexts/AuthContext";
import ShareMenu from "./ShareMenu";

interface EnhancedContentActionsProps {
  contentId: string;
  contentType: "article" | "video" | "podcast";
  title?: string;
  showLike?: boolean;
  showShare?: boolean;
  className?: string;
}

const EnhancedContentActions: React.FC<EnhancedContentActionsProps> = ({
  contentId,
  contentType,
  title = "محتوای جالب",
  showLike = true,
  showShare = true,
  className = ""
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { addBookmark, removeBookmark, isBookmarked } = useContent();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const handleBookmarkToggle = async () => {
    if (!user) {
      toast({
        title: "خطا",
        description: "برای بوکمارک کردن باید وارد شوید",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // فعلاً فقط articles پشتیبانی می‌شوند
      if (contentType !== "article") {
        toast({
          title: "اطلاع",
          description: "فعلاً فقط مقالات قابل بوکمارک هستند",
          variant: "default",
        });
        setIsProcessing(false);
        return;
      }

      const currentlyBookmarked = isBookmarked(contentId);
      
      if (currentlyBookmarked) {
        await removeBookmark(contentId);
        toast({
          title: "موفقیت",
          description: "محتوا از نشان‌شده‌ها حذف شد",
          variant: "default",
        });
      } else {
        await addBookmark(contentId);
        toast({
          title: "موفقیت",
          description: "محتوا به نشان‌شده‌ها اضافه شد",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "خطا",
        description: error instanceof Error ? error.message : "مشکلی در عملیات بوکمارک وجود دارد",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLikeToggle = async () => {
    if (!user) {
      toast({
        title: "خطا",
        description: "برای پسندیدن باید وارد شوید",
        variant: "destructive",
      });
      return;
    }

    try {
      // TODO: Implement like API
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
      
      toast({
        title: "موفقیت",
        description: isLiked ? "پسند شما حذف شد" : "محتوا پسندیده شد",
        variant: "default",
      });
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "خطا",
        description: "مشکلی در عملیات پسندیدن وجود دارد",
        variant: "destructive",
      });
    }
  };

  const currentlyBookmarked = contentType === "article" ? isBookmarked(contentId) : false;

  const getContentTypeLabel = () => {
    switch (contentType) {
      case "article": return "مقاله";
      case "video": return "ویدیو";
      case "podcast": return "پادکست";
      default: return "محتوا";
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      {/* Bookmark Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={handleBookmarkToggle}
        disabled={isProcessing || (contentType !== "article")}
        className="rounded-full relative group"
        title={
          contentType !== "article" 
            ? `بوکمارک برای ${getContentTypeLabel()} فعلاً در دسترس نیست`
            : currentlyBookmarked 
              ? "حذف از نشان‌شده‌ها" 
              : "اضافه به نشان‌شده‌ها"
        }
      >
        {isProcessing ? (
          <Loader className="h-5 w-5 animate-spin" />
        ) : currentlyBookmarked ? (
                      <Bookmark className="h-5 w-5 fill-current text-trader-600" />
        ) : (
          <BookmarkPlus className={`h-5 w-5 ${contentType !== "article" ? "text-gray-400" : ""}`} />
        )}
        
        {/* Tooltip for unsupported content */}
        {contentType !== "article" && (
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 
                          bg-gray-800 text-white text-xs rounded px-2 py-1 
                          opacity-0 group-hover:opacity-100 transition-opacity
                          pointer-events-none whitespace-nowrap z-10">
            بوکمارک برای {getContentTypeLabel()} فعلاً در دسترس نیست
          </div>
        )}
      </Button>

      {/* Like Button */}
      {showLike && (
        <Button
          variant="outline"
          size="icon"
          onClick={handleLikeToggle}
          className="rounded-full"
          title={isLiked ? "حذف پسند" : "پسندیدن"}
        >
          <Heart className={`h-5 w-5 ${isLiked ? "fill-current text-red-500" : ""}`} />
          {likeCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {likeCount}
            </span>
          )}
        </Button>
      )}

      {/* Share Button */}
      {showShare && <ShareMenu title={title} />}
    </div>
  );
};

export default EnhancedContentActions; 