
import React from "react";
import ContentCard from "./ContentCard";
import ContentCardSkeleton from "./ContentCardSkeleton";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import CarouselCard from "../ui/carousel-card";
import { formatAuthor } from "@/lib/utils";
import { 
  Article, 
  Podcast, 
  Video, 
  Webinar, 
  File as FileType,
  CourseUser,
  Livestream
} from "@/contexts/DataContext";

type ContentListProps<T> = {
  items: T[];
  type: "article" | "podcast" | "video" | "webinar" | "file" | "livestream";
  title?: string;
  viewAllLink?: string;
  showCarousel?: boolean;
  isLoading?: boolean;
  skeletonCount?: number;
};

type ContentItem = Article | Podcast | Video | Webinar | FileType | Livestream;

const ContentList = <T extends ContentItem>({ 
  items, 
  type, 
  title,
  viewAllLink,
  showCarousel = false,
  isLoading = false,
  skeletonCount = 4
}: ContentListProps<T>) => {
  
  const renderContentCard = (item: ContentItem, contentType: string, key: string) => {
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
          date={'date' in podcast ? podcast.date : podcast.created_at}
          author={formatAuthor(podcast.author)}
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
          date={'date' in video ? video.date : video.created_at}
          author={formatAuthor(video.author)}
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
          author={formatAuthor(webinar.author)}
          duration={webinar.duration}
          className="h-full"
        />
      );
    }
    
    if (contentType === "livestream") {
      const livestream = item as unknown as Livestream;
      return (
        <ContentCard
          key={`${key}-${livestream.id}`}
          id={livestream.id}
          title={livestream.title}
          description={livestream.description}
          thumbnail={livestream.thumbnail}
          type={contentType as "livestream"}
          date={livestream.created_at}
          author={formatAuthor(livestream.author)}
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
          author={formatAuthor(file.author)}
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
        description={'description' in article ? article.description : article.content?.slice(0, 200)}
        thumbnail={article.thumbnail}
        type={contentType as "article"}
        date={'date' in article ? article.date : article.created_at}
        author={formatAuthor(article.author)}
        className="h-full"
      />
    );
  };
  
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
};

export default ContentList;
