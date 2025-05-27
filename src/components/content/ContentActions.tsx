
import React from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkPlus, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContentActionsProps {
  isBookmarked: boolean;
  onBookmark: () => void;
}

const ContentActions: React.FC<ContentActionsProps> = ({
  isBookmarked,
  onBookmark
}) => {
  const { toast } = useToast();

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "لینک کپی شد",
      description: "لینک این محتوا در کلیپ‌بورد کپی شد",
    });
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={onBookmark}
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
  );
};

export default ContentActions;
