import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_IMAGES } from "@/lib/config";

type ContentType = "article" | "podcast" | "video" | "webinar" | "file" | "livestream";

const defaultThumbnail = DEFAULT_IMAGES.PLACEHOLDER_CONTENT;

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

const ContentCard: React.FC<ContentCardProps> = React.memo(({
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
  // Convert id to string for consistency
  const stringId = String(id);
  
  const getContentUrl = React.useCallback(() => {
    switch (type) {
      case "article": return `/articles/${stringId}`;
      case "podcast": return `/podcasts/${stringId}`;
      case "video": return `/videos/${stringId}`;
      case "webinar": return `/webinars/${stringId}`;
      case "livestream": return `/livestreams/${stringId}`;
      case "file": return `/files/${stringId}`;
      default: return "#";
    }
  }, [type, stringId]);

  // Mapping for content type labels in Persian
  const getTypeLabel = React.useCallback(() => {
    switch (type) {
      case "article": return "مقاله";
      case "podcast": return "پادکست";
      case "video": return "ویدیو";
      case "webinar": return "وبینار";
      case "livestream": return "لایو";
      case "file": return "فایل";
      default: return type;
    }
  }, [type]);

  // Get a background color based on content type
  const getTypeBgColor = React.useCallback(() => {
    switch (type) {
      case "article": return "bg-blue-500"; 
      case "podcast": return "bg-purple-500";
      case "video": return "bg-trader-500";
      case "webinar": return "bg-green-500";
      case "livestream": return "bg-red-500";
      case "file": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  }, [type]);

  // Format date to show only date without time
  const formatDateOnly = React.useCallback((dateString?: string) => {
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
  }, []);

  const handleImageError = React.useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = defaultThumbnail;
  }, []);

  return (
    <Link to={getContentUrl()} className={cn("block", className)}>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 h-full min-h-[220px] sm:min-h-[280px] flex flex-col">
        <div className="relative">
          <img
            src={thumbnail || defaultThumbnail}
            alt={title}
            className="w-full h-28 sm:h-36 object-contain rounded-t-lg bg-gray-50"
            onError={handleImageError}
            loading="lazy"
          />
          <div className={cn("absolute top-2 left-2 px-2 py-1 text-xs text-white rounded-full", getTypeBgColor())}>
            {getTypeLabel()}
          </div>
        </div>
        <div className="p-3 sm:p-4 flex-1 flex flex-col">
          <h3 className="text-sm sm:text-base font-semibold mb-2 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">{title}</h3>
          {description && (
            <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 flex-1">{description}</p>
          )}
          <div className="flex items-center text-xs sm:text-sm text-gray-500 gap-2 sm:gap-4 mt-auto">
            {date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs">{formatDateOnly(date)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.id === nextProps.id &&
    prevProps.title === nextProps.title &&
    prevProps.thumbnail === nextProps.thumbnail &&
    prevProps.type === nextProps.type &&
    prevProps.date === nextProps.date &&
    prevProps.author === nextProps.author &&
    prevProps.duration === nextProps.duration
  );
});

ContentCard.displayName = 'ContentCard';

export default ContentCard;
