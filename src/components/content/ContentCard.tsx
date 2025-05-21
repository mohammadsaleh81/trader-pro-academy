
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
      <div className="trader-card flex flex-col md:flex-row h-full overflow-hidden hover:shadow-md transition-all duration-300">
        <div className="w-full md:w-1/3 h-48 md:h-full min-h-[120px] relative">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className={`absolute top-3 right-3 ${getTypeBgColor()} text-white text-xs px-3 py-1 rounded-full`}>
            {getTypeLabel()}
          </div>
          {duration && (
            <div className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
              <Clock className="inline-block w-3 h-3 ml-1" />
              {duration}
            </div>
          )}
        </div>
        <div className="w-full md:w-2/3 p-4 flex flex-col relative">
          <h3 className="font-bold text-base mb-2 line-clamp-2">{title}</h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{description}</p>
          
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
            <div className="flex items-center text-xs text-gray-500">
              <User className="w-3 h-3 ml-1" />
              {author}
            </div>
            
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="w-3 h-3 ml-1" />
              {date}
            </div>
          </div>
          
          {user && (
            <button 
              onClick={handleBookmark}
              className="absolute top-4 left-4 text-trader-500"
            >
              {bookmark ? (
                <BookmarkCheck className="h-5 w-5" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ContentCard;
