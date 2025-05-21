
import React from "react";
import ContentCard from "./ContentCard";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
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
};

type ContentItem = Article | Podcast | Video | Webinar | FileType;

const ContentList = <T extends ContentItem>({ 
  items, 
  type, 
  title,
  viewAllLink 
}: ContentListProps<T>) => {
  return (
    <div className="my-6 px-3">
      {title && (
        <div className="flex justify-between items-center mb-4">
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
      
      <div className="flex flex-col gap-4">
        {items.map((item) => {
          if (type === "podcast") {
            const podcast = item as unknown as Podcast;
            return (
              <ContentCard
                key={podcast.id}
                id={podcast.id}
                title={podcast.title}
                description={podcast.description}
                thumbnail={podcast.thumbnail}
                type={type}
                date={podcast.date}
                author={podcast.author}
                duration={podcast.duration}
              />
            );
          }
          
          if (type === "video") {
            const video = item as unknown as Video;
            return (
              <ContentCard
                key={video.id}
                id={video.id}
                title={video.title}
                description={video.description}
                thumbnail={video.thumbnail}
                type={type}
                date={video.date}
                author={video.author}
                duration={video.duration}
              />
            );
          }
          
          if (type === "webinar") {
            const webinar = item as unknown as Webinar;
            return (
              <ContentCard
                key={webinar.id}
                id={webinar.id}
                title={webinar.title}
                description={webinar.description}
                thumbnail={webinar.thumbnail}
                type={type}
                date={webinar.date}
                author={webinar.author}
                duration={webinar.duration}
              />
            );
          }
          
          if (type === "file") {
            const file = item as unknown as FileType;
            return (
              <ContentCard
                key={file.id}
                id={file.id}
                title={file.title}
                description={file.description}
                thumbnail={file.thumbnail}
                type={type}
                date={file.date}
                author={file.author}
                fileSize={file.fileSize}
                fileType={file.fileType}
              />
            );
          }
          
          // Default case: article
          const article = item as unknown as Article;
          return (
            <ContentCard
              key={article.id}
              id={article.id}
              title={article.title}
              description={article.description}
              thumbnail={article.thumbnail}
              type={type}
              date={article.date}
              author={article.author}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ContentList;
