
import React from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkPlus } from "lucide-react";
import ShareMenu from "./ShareMenu";

interface ContentActionsProps {
  isBookmarked: boolean;
  onBookmark: () => void;
  title?: string;
}

const ContentActions: React.FC<ContentActionsProps> = ({
  isBookmarked,
  onBookmark,
  title = "محتوای جالب"
}) => {
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
      <ShareMenu title={title} />
    </div>
  );
};

export default ContentActions;
