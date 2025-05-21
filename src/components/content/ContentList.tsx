
import React from "react";
import ContentCard from "./ContentCard";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import CarouselCard from "../ui/carousel-card";
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
};

type ContentItem = Article | Podcast | Video | Webinar | FileType;

const ContentList = <T extends ContentItem>({ 
  items, 
  type, 
  title,
  viewAllLink,
  showCarousel = false
}: ContentListProps<T>) => {
  
  if (showCarousel) {
    return (
      <div className="my-6">
        {title && (
          <div className="flex justify-between items-center mb-4 px-2 sm:px-0">
            <div className="flex items-center">
              <span className="w-1 h-6 bg-trader-500 rounded-sm ml-2"></span>
              <h2 className="text-xl font-bold">{title}</h2>
            </div>
            {items.length > 3 && viewAllLink && (
              <Link to={viewAllLink} className="text-trader-500 text-sm flex items-center">
                <span>مشاهده همه</span>
                <ChevronLeft className="h-4 w-4 mr-1" />
              </Link>
            )}
          </div>
        )}
        
        <CarouselCard controlsClassName="bg-white shadow-md">
          {items.map((item, index) => renderContentCard(item, type, `carousel-${index}`))}
        </CarouselCard>
      </div>
    );
  }

  return (
    <div className="my-6">
      {title && (
        <div className="flex justify-between items-center mb-4 px-2 sm:px-0">
          <div className="flex items-center">
            <span className="w-1 h-6 bg-trader-500 rounded-sm ml-2"></span>
            <h2 className="text-xl font-bold">{title}</h2>
          </div>
          {items.length > 3 && viewAllLink && (
            <Link to={viewAllLink} className="text-trader-500 text-sm flex items-center">
              <span>مشاهده همه</span>
              <ChevronLeft className="h-4 w-4 mr-1" />
            </Link>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {items.map((item, index) => renderContentCard(item, type, index.toString()))}
      </div>
    </div>
  );
  
  function renderContentCard(item: ContentItem, contentType: string, key: string) {
    if (contentType === "podcast") {
      const podcast = item as unknown as Podcast;
      return (
        <ContentCard
          key={`${key}-${podcast.id}`}
          id={podcast.id}
          title={podcast.title}
          description={podcast.description}
          thumbnail={podcast.thumbnail}
          type={contentType as "podcast"}
          date={podcast.date}
          author={podcast.author}
          duration={podcast.duration}
          className="h-full"
        />
      );
    }
    
    if (contentType === "video") {
      const video = item as unknown as Video;
      return (
        <ContentCard
          key={`${key}-${video.id}`}
          id={video.id}
          title={video.title}
          description={video.description}
          thumbnail={video.thumbnail}
          type={contentType as "video"}
          date={video.date}
          author={video.author}
          duration={video.duration}
          className="h-full"
        />
      );
    }
    
    if (contentType === "webinar") {
      const webinar = item as unknown as Webinar;
      return (
        <ContentCard
          key={`${key}-${webinar.id}`}
          id={webinar.id}
          title={webinar.title}
          description={webinar.description}
          thumbnail={webinar.thumbnail}
          type={contentType as "webinar"}
          date={webinar.date}
          author={webinar.author}
          duration={webinar.duration}
          className="h-full"
        />
      );
    }
    
    if (contentType === "file") {
      const file = item as unknown as FileType;
      return (
        <ContentCard
          key={`${key}-${file.id}`}
          id={file.id}
          title={file.title}
          description={file.description}
          thumbnail={file.thumbnail}
          type={contentType as "file"}
          date={file.date}
          author={file.author}
          fileSize={file.fileSize}
          fileType={file.fileType}
          className="h-full"
        />
      );
    }
    
    // Default case: article
    const article = item as unknown as Article;
    return (
      <ContentCard
        key={`${key}-${article.id}`}
        id={article.id}
        title={article.title}
        description={article.description}
        thumbnail={article.thumbnail}
        type={contentType as "article"}
        date={article.date}
        author={article.author}
        className="h-full"
      />
    );
  }
};

export default ContentList;
