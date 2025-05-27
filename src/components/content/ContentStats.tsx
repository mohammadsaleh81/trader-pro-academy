
import React from "react";
import { Clock, Eye, User, Play } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ContentStatsProps {
  author?: string;
  publishDate: string;
  duration?: string;
  viewCount?: number;
}

const ContentStats: React.FC<ContentStatsProps> = ({
  author,
  publishDate,
  duration,
  viewCount
}) => {
  return (
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
  );
};

export default ContentStats;
