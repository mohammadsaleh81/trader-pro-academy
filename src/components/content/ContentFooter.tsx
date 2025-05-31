
import React from "react";
import { Clock, Eye, User, Play } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ContentFooterProps {
  author?: string;
  publishDate: string;
  duration?: string;
  viewCount?: number;
  tags: Array<{ id: string; name: string }>;
}

const ContentFooter: React.FC<ContentFooterProps> = ({
  author,
  publishDate,
  duration,
  viewCount,
  tags
}) => {
  return (
    <div className="border-t border-gray-200 pt-8 mt-8">
      <div className="flex items-center gap-6 text-sm text-gray-500 mb-6 justify-end flex-wrap">
        {author && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{author}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{formatDate(publishDate)}</span>
        </div>
        
        {duration && (
          <div className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            <span>{duration}</span>
          </div>
        )}
        
        {viewCount !== undefined && (
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>{viewCount.toLocaleString()} بازدید</span>
          </div>
        )}
      </div>

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-end">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="bg-trader-100 text-trader-800 text-xs px-3 py-1 rounded-full"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentFooter;
