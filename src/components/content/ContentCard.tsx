
import React from "react";
import { Link } from "react-router-dom";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";

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
  fileType
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

  return (
    <Link to={getContentUrl()}>
      <div className="trader-card flex h-full overflow-hidden">
        <div className="w-1/3 h-full min-h-[120px]">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-2/3 p-3 flex flex-col relative">
          <div className="flex justify-between">
            <span className="text-xs text-trader-500 font-medium mb-1">
              {getTypeLabel()}
            </span>
            <span className="text-xs text-gray-500">{date}</span>
          </div>
          
          <h3 className="font-bold text-sm mb-1 line-clamp-1">{title}</h3>
          <p className="text-gray-600 text-xs line-clamp-2 mb-2">{description}</p>
          
          <div className="flex items-center justify-between mt-auto">
            <span className="text-xs text-gray-500">
              {author}
            </span>
            
            {duration && (
              <span className="text-xs text-gray-500">
                {duration}
              </span>
            )}
            
            {fileSize && fileType && (
              <span className="text-xs text-gray-500">
                {fileSize} {fileType}
              </span>
            )}
          </div>
          
          {user && (
            <button 
              onClick={handleBookmark}
              className="absolute top-3 left-3 text-trader-500"
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
