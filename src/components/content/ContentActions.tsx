import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkPlus, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useContent } from "@/contexts/ContentContext";
import { useAuth } from "@/contexts/AuthContext";
import ShareMenu from "./ShareMenu";

interface ContentActionsProps {
  articleId: string;
  title?: string;
}

const ContentActions: React.FC<ContentActionsProps> = ({
  articleId,
  title = "محتوای جالب"
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { addBookmark, removeBookmark, isBookmarked } = useContent();
  const [isProcessing, setIsProcessing] = useState(false);

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
      const currentlyBookmarked = isBookmarked(articleId);
      
      if (currentlyBookmarked) {
        await removeBookmark(articleId);
        toast({
          title: "موفقیت",
          description: "محتوا از نشان‌شده‌ها حذف شد",
          variant: "default",
        });
      } else {
        await addBookmark(articleId);
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

  const currentlyBookmarked = isBookmarked(articleId);

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handleBookmarkToggle}
        disabled={isProcessing}
        className="rounded-full"
      >
        {isProcessing ? (
          <Loader className="h-5 w-5 animate-spin" />
        ) : currentlyBookmarked ? (
          <Bookmark className="h-5 w-5 fill-current text-trader-600" />
        ) : (
          <BookmarkPlus className="h-5 w-5" />
        )}
      </Button>
      <ShareMenu title={title} />
    </div>
  );
};

export default ContentActions;
