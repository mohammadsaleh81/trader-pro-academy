
import React from "react";
import { Link } from "react-router-dom";
import { Bookmark, BookmarkCheck, Calendar, Clock, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { cn } from "@/lib/utils";

type ContentType = "article" | "podcast" | "video" | "webinar" | "file";

const defaultThumbnail = "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image";

interface ContentCardProps {
  id: string | number;
  title: string;
  description?: string;
  thumbnail: string | null;
  type: ContentType;
  date?: string;
  author?: string;
  duration?: string;
  fileSize?: string;
  fileType?: string;
  className?: string;
}

const ContentCard: React.FC<ContentCardProps> = ({
  id,
  title,
  description,
  thumbnail,
  type,
  date,
  author,
  duration,
  fileSize,
  fileType,
  className
}) => {
  const { user } = useAuth();
  const { bookmarks, addBookmark, removeBookmark } = useData();
  
  // Convert id to string for consistency
  const stringId = String(id);
  
  const bookmark = user ? bookmarks.find(
    b => b.itemId === stringId && b.itemType === type && b.userId === user.id
  ) : null;
  
  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) return;
    
    if (bookmark) {
      removeBookmark(bookmark.id);
    } else {
      addBookmark(stringId, type, user.id);
    }
  };
  
  const getContentUrl = () => {
    switch (type) {
      case "article": return `/articles/${stringId}`;
      case "podcast": return `/podcasts/${stringId}`;
      case "video": return `/videos/${stringId}`;
      case "webinar": return `/webinars/${stringId}`;
      case "file": return `/files/${stringId}`;
      default: return "#";
    }
  };

  // Mapping for content type labels in Persian
  const getTypeLabel = () => {
    switch (type) {
      case "article": return "مقاله";
      case "podcast": return "پادکست";
      case "video": return "ویدیو";
      case "webinar": return "وبینار";
      case "file": return "فایل";
      default: return type;
    }
  };

  // Get a background color based on content type
  const getTypeBgColor = () => {
    switch (type) {
      case "article": return "bg-blue-500"; 
      case "podcast": return "bg-purple-500";
      case "video": return "bg-trader-500";
      case "webinar": return "bg-green-500";
      case "file": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  // Format date to show only date without time
  const formatDateOnly = (dateString?: string) => {
    if (!dateString) return "";
    
    try {
      // If it's already in YYYY-MM-DD format, just return it
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      // If it contains time, extract only the date part
      if (dateString.includes('T') || dateString.includes(' ')) {
        return dateString.split('T')[0].split(' ')[0];
      }
      
      return dateString;
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Link to={getContentUrl()} className={cn("block", className)}>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="relative">
          <img
            src={thumbnail || defaultThumbnail}
            alt={title}
            className="w-full h-48 object-cover rounded-t-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = defaultThumbnail;
            }}
          />
          <div className="absolute top-2 right-2">
            {user && (
              <button
                onClick={handleBookmark}
                className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200"
              >
                {bookmark ? (
                  <BookmarkCheck className="w-5 h-5 text-trader-500" />
                ) : (
                  <Bookmark className="w-5 h-5 text-gray-500" />
                )}
              </button>
            )}
          </div>
          <div className={cn("absolute top-2 left-2 px-2 py-1 text-xs text-white rounded-full", getTypeBgColor())}>
            {getTypeLabel()}
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2 line-clamp-2 min-h-[3.5rem]">{title}</h3>
          {description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
          )}
          <div className="flex items-center text-sm text-gray-500 gap-4">
            {author && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{author}</span>
              </div>
            )}
            {date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDateOnly(date)}</span>
              </div>
            )}
            {duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{duration}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ContentCard;
