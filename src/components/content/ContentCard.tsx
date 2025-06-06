
import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_IMAGES } from "@/lib/config";

type ContentType = "article" | "podcast" | "video" | "webinar" | "file";

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
  
  // Mapping for content type labels in Persian
  const getTypeLabel = React.useCallback(() => {
    switch (type) {
      case "article": return "مقاله";
      case "podcast": return "پادکست";
      case "video": return "ویدیو";
      case "webinar": return "وبینار";
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

  // Generate content URL based on type and id
  const getContentUrl = React.useCallback(() => {
    const baseType = type === "webinar" ? "webinar" : type;
    return `/content/${baseType}/${stringId}`;
  }, [type, stringId]);

  return (
    <Link to={getContentUrl()} className={cn("block group", className)}>
      <div className="bg-card text-card-foreground rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 h-full min-h-[260px] sm:min-h-[320px] flex flex-col group-hover:scale-[1.02] group-hover:-translate-y-1 border border-border">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={thumbnail || defaultThumbnail}
            alt={title}
            className="w-full h-32 sm:h-44 object-cover transition-transform duration-500 group-hover:scale-110"
            onError={handleImageError}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className={cn("absolute top-2 left-2 px-2 py-1 text-xs text-white rounded-full backdrop-blur-sm transition-transform duration-300 group-hover:scale-110", getTypeBgColor())}>
            {getTypeLabel()}
          </div>
        </div>
        <div className="p-3 sm:p-4 flex-1 flex flex-col">
          <h3 className="text-sm sm:text-base font-semibold mb-2 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] group-hover:text-primary transition-colors duration-300">{title}</h3>
          {description && (
            <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 flex-1 group-hover:text-foreground/80 transition-colors duration-300">{description}</p>
          )}
          <div className="flex items-center text-xs sm:text-sm text-muted-foreground gap-2 sm:gap-4 mt-auto">
            {author && (
              <div className="flex items-center gap-1 group-hover:text-foreground transition-colors duration-300">
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="truncate text-xs">{author}</span>
              </div>
            )}
            {date && (
              <div className="flex items-center gap-1 group-hover:text-foreground transition-colors duration-300">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs">{formatDateOnly(date)}</span>
              </div>
            )}
            {duration && (
              <div className="flex items-center gap-1 group-hover:text-foreground transition-colors duration-300">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs">{duration}</span>
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
