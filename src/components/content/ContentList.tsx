
import React from "react";
import ContentCard from "./ContentCard";
import ContentCardSkeleton from "./ContentCardSkeleton";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import CarouselCard from "../ui/carousel-card";
import { idToString } from "@/utils/idConverter";
import { 
  Article, 
  Podcast, 
  Video, 
  Webinar, 
  File as FileType 
} from "@/contexts/DataContext";

type ContentListProps<T> = {
  items: T[];
  type: "article" | "podcast" | "video" | "webinar" | "file";
  title?: string;
  viewAllLink?: string;
  showCarousel?: boolean;
  isLoading?: boolean;
  skeletonCount?: number;
};

type ContentItem = Article | Podcast | Video | Webinar | FileType;

const ContentList = <T extends ContentItem>({ 
  items, 
  type, 
  title,
  viewAllLink,
  showCarousel = false,
  isLoading = false,
  skeletonCount = 4
}: ContentListProps<T>) => {
  
  if (showCarousel) {
    return (
      <div className="my-4">
        {title && (
          <div className="flex justify-between items-center mb-4 px-2 sm:px-0">
            <div className="flex items-center">
              <span className="w-1 h-6 bg-trader-500 rounded-sm ml-2"></span>
              <h2 className="text-xl font-bold">{title}</h2>
            </div>
            {items.length > 3 && viewAllLink && !isLoading && (
              <Link to={viewAllLink} className="text-trader-500 text-sm flex items-center">
                <span>مشاهده همه</span>
                <ChevronLeft className="h-4 w-4 mr-1" />
              </Link>
            )}
          </div>
        )}
        
        <CarouselCard controlsClassName="bg-white shadow-md">
          {isLoading 
            ? Array.from({ length: skeletonCount }).map((_, index) => (
                <ContentCardSkeleton key={`carousel-skeleton-${index}`} className="px-1" />
              ))
            : items.map((item, index) => renderContentCard(item, type, `carousel-${index}`))
          }
        </CarouselCard>
      </div>
    );
  }

  return (
    <div className="my-4">
      {title && (
        <div className="flex justify-between items-center mb-4 px-2 sm:px-0">
          <div className="flex items-center">
            <span className="w-1 h-6 bg-trader-500 rounded-sm ml-2"></span>
            <h2 className="text-xl font-bold">{title}</h2>
          </div>
          {items.length > 3 && viewAllLink && !isLoading && (
            <Link to={viewAllLink} className="text-trader-500 text-sm flex items-center">
              <span>مشاهده همه</span>
              <ChevronLeft className="h-4 w-4 mr-1" />
            </Link>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        {isLoading 
          ? Array.from({ length: skeletonCount }).map((_, index) => (
              <ContentCardSkeleton key={`skeleton-${index}`} />
            ))
          : items.map((item, index) => renderContentCard(item, type, index.toString()))
        }
      </div>
    </div>
  );
  
  function renderContentCard(item: ContentItem, contentType: string, key: string) {
    // Get description and format date from item
    const getDescription = (item: ContentItem): string => {
      if ('summary' in item && item.summary) return item.summary;
      if ('description' in item && item.description) return item.description;
      if ('content' in item) return item.content.substring(0, 150);
      return '';
    };

    // Get formatted date
    const getDate = (item: ContentItem): string => {
      if ('date' in item && item.date) return item.date;
      if ('published_at' in item && item.published_at) 
        return item.published_at;
      if ('created_at' in item) 
        return item.created_at;
      return '';
    };

    // Get author display
    const getAuthor = (item: ContentItem) => {
      if ('author' in item) {
        if (typeof item.author === 'string') return item.author;
        if (item.author && typeof item.author === 'object') return item.author;
      }
      return 'نویسنده ناشناس';
    };

    const description = getDescription(item);
    const date = getDate(item);
    const author = getAuthor(item);
    const thumbnail = item.thumbnail || '';
    const itemId = idToString(item.id);

    if (contentType === "podcast") {
      const podcast = item as Podcast;
      return (
        <ContentCard
          key={`${key}-${itemId}`}
          id={itemId}
          title={podcast.title}
          description={description}
          thumbnail={thumbnail}
          type={contentType as "podcast"}
          date={date}
          author={author}
          duration={podcast.duration}
          className="h-full"
        />
      );
    }
    
    if (contentType === "video") {
      const video = item as Video;
      return (
        <ContentCard
          key={`${key}-${itemId}`}
          id={itemId}
          title={video.title}
          description={description}
          thumbnail={thumbnail}
          type={contentType as "video"}
          date={date}
          author={author}
          duration={video.duration}
          className="h-full"
        />
      );
    }
    
    if (contentType === "webinar") {
      const webinar = item as Webinar;
      return (
        <ContentCard
          key={`${key}-${itemId}`}
          id={itemId}
          title={webinar.title}
          description={description}
          thumbnail={thumbnail}
          type={contentType as "webinar"}
          date={date}
          author={author}
          duration={webinar.duration}
          className="h-full"
        />
      );
    }
    
    if (contentType === "file") {
      const file = item as FileType;
      return (
        <ContentCard
          key={`${key}-${itemId}`}
          id={itemId}
          title={file.title}
          description={description}
          thumbnail={thumbnail}
          type={contentType as "file"}
          date={date}
          author={author}
          fileSize={file.fileSize}
          fileType={file.fileType}
          className="h-full"
        />
      );
    }
    
    // Default case: article
    const article = item as Article;
    return (
      <ContentCard
        key={`${key}-${itemId}`}
        id={itemId}
        title={article.title}
        description={description}
        thumbnail={thumbnail}
        type={contentType as "article"}
        date={date}
        author={author}
        className="h-full"
      />
    );
  }
};

export default ContentList;
