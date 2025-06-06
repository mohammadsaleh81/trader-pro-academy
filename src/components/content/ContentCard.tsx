
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
  const stringId = String(id);
  
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

  const formatDateOnly = React.useCallback((dateString?: string) => {
    if (!dateString) return "";
    
    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      
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

  const getContentUrl = React.useCallback(() => {
    const baseType = type === "webinar" ? "webinar" : type;
    return `/content/${baseType}/${stringId}`;
  }, [type, stringId]);

  return (
    <Link to={getContentUrl()} className={cn("block group", className)}>
      <div className="bg-card text-card-foreground rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col group-hover:scale-[1.02] group-hover:-translate-y-1 border border-border">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={thumbnail || defaultThumbnail}
            alt={title}
            className="w-full h-24 sm:h-32 md:h-40 object-cover transition-transform duration-500 group-hover:scale-110"
            onError={handleImageError}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className={cn("absolute top-1 sm:top-2 left-1 sm:left-2 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs text-white rounded-full backdrop-blur-sm transition-transform duration-300 group-hover:scale-110", getTypeBgColor())}>
            {getTypeLabel()}
          </div>
        </div>
        <div className="p-2 sm:p-3 md:p-4 flex-1 flex flex-col">
          <h3 className="text-xs sm:text-sm md:text-base font-semibold mb-1 sm:mb-2 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] md:min-h-[3rem] group-hover:text-primary transition-colors duration-300">{title}</h3>
          {description && (
            <p className="text-muted-foreground text-[10px] sm:text-xs md:text-sm mb-2 sm:mb-3 md:mb-4 line-clamp-2 flex-1 group-hover:text-foreground/80 transition-colors duration-300">{description}</p>
          )}
          <div className="flex items-center text-[9px] sm:text-xs md:text-sm text-muted-foreground gap-1 sm:gap-2 md:gap-4 mt-auto flex-wrap">
            {author && (
              <div className="flex items-center gap-0.5 sm:gap-1 group-hover:text-foreground transition-colors duration-300 min-w-0">
                <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 flex-shrink-0" />
                <span className="truncate text-[9px] sm:text-[10px] md:text-xs">{author}</span>
              </div>
            )}
            {date && (
              <div className="flex items-center gap-0.5 sm:gap-1 group-hover:text-foreground transition-colors duration-300">
                <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 flex-shrink-0" />
                <span className="text-[9px] sm:text-[10px] md:text-xs">{formatDateOnly(date)}</span>
              </div>
            )}
            {duration && (
              <div className="flex items-center gap-0.5 sm:gap-1 group-hover:text-foreground transition-colors duration-300">
                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 flex-shrink-0" />
                <span className="text-[9px] sm:text-[10px] md:text-xs">{duration}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}, (prevProps, nextProps) => {
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
