
import React from "react";
import { Link } from "react-router-dom";
import { Bookmark, BookmarkCheck, Calendar, Clock, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { cn } from "@/lib/utils";

type ContentType = "article" | "podcast" | "video" | "webinar" | "file";

type ContentCardProps = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  type: ContentType;
  date: string;
  author: string;
  duration?: string;
  fileSize?: string;
  fileType?: string;
  className?: string;
};

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
  
  const bookmark = user ? bookmarks.find(
    b => b.itemId === id && b.itemType === type && b.userId === user.id
  ) : null;
  
  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) return;
    
    if (bookmark) {
      removeBookmark(bookmark.id);
    } else {
      addBookmark(id, type, user.id);
    }
  };
  
  const getContentUrl = () => {
    switch (type) {
      case "article": return `/articles/${id}`;
      case "podcast": return `/podcasts/${id}`;
      case "video": return `/videos/${id}`;
      case "webinar": return `/webinars/${id}`;
      case "file": return `/files/${id}`;
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

  return (
    <Link to={getContentUrl()} className={cn("block h-full", className)}>
      <div className="trader-card flex flex-col h-full overflow-hidden hover:shadow-md transition-all duration-300">
        <div className="w-full h-32 min-h-[80px] relative">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className={`absolute top-1.5 right-1.5 ${getTypeBgColor()} text-white text-[8px] px-1.5 py-0.5 rounded-full`}>
            {getTypeLabel()}
          </div>
          {duration && (
            <div className="absolute bottom-1.5 right-1.5 bg-black bg-opacity-60 text-white text-[8px] px-1.5 py-0.5 rounded">
              <Clock className="inline-block w-2 h-2 ml-0.5" />
              {duration}
            </div>
          )}
        </div>
        <div className="w-full p-2 flex flex-col relative flex-grow">
          <h3 className="font-bold text-xs mb-1 line-clamp-1">{title}</h3>
          <p className="text-gray-600 text-[10px] line-clamp-1 mb-2">{description}</p>
          
          <div className="flex items-center justify-between mt-auto pt-1 border-t border-gray-100">
            <div className="flex items-center text-[8px] text-gray-500">
              <User className="w-2 h-2 ml-0.5" />
              {author}
            </div>
            
            <div className="flex items-center text-[8px] text-gray-500">
              <Calendar className="w-2 h-2 ml-0.5" />
              {date}
            </div>
          </div>
          
          {user && (
            <button 
              onClick={handleBookmark}
              className="absolute top-2 left-2 text-trader-500"
              aria-label={bookmark ? "حذف از نشان‌ها" : "افزودن به نشان‌ها"}
            >
              {bookmark ? (
                <BookmarkCheck className="h-3.5 w-3.5" />
              ) : (
                <Bookmark className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ContentCard;
