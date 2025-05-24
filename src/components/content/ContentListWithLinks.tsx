
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ItemType } from "@/contexts/DataContext";
import { Article, Podcast, Video, Webinar, File } from "@/contexts/DataContext";
import { idToString } from "@/utils/idConverter";

type ContentItem = Article | Podcast | Video | Webinar | File;

interface ContentListProps {
  items: ContentItem[];
  type: ItemType;
}

const typeToPlural: Record<ItemType, string> = {
  article: "articles",
  podcast: "podcasts",
  video: "videos",
  webinar: "webinars",
  file: "files",
  course: "courses",
};

const ContentListWithLinks: React.FC<ContentListProps> = ({ items, type }) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">موردی یافت نشد</p>
      </div>
    );
  }

  const pluralType = typeToPlural[type];

  // Helper functions to extract common properties
  const getDescription = (item: ContentItem): string => {
    if ('summary' in item && item.summary) return item.summary;
    if ('description' in item && item.description) return item.description;
    if ('content' in item) return item.content.substring(0, 150);
    return '';
  };

  const getDate = (item: ContentItem): string => {
    if ('date' in item && item.date) return item.date;
    if ('published_at' in item && item.published_at) 
      return item.published_at;
    if ('created_at' in item) 
      return item.created_at;
    return '';
  };

  const getAuthor = (item: ContentItem): string => {
    if ('author' in item) {
      if (typeof item.author === 'string') return item.author;
      if (item.author && typeof item.author === 'object' && 'first_name' in item.author && 'last_name' in item.author) {
        // @ts-ignore - we know this is an author object
        return item.author.first_name || item.author.last_name 
          // @ts-ignore - we know this is an author object
          ? `${item.author.first_name || ''} ${item.author.last_name || ''}`.trim()
          : 'نویسنده ناشناس';
      }
    }
    return 'نویسنده ناشناس';
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
      {items.map((item) => {
        const itemId = idToString(item.id);
        const description = getDescription(item);
        const date = getDate(item);
        const author = getAuthor(item);
        
        return (
          <Link to={`/${pluralType}/${itemId}`} key={itemId}>
            <Card className="h-full hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-32 object-cover rounded-t-lg"
                  />
                  {'duration' in item && item.duration && (
                    <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-[8px] px-1.5 py-0.5 rounded">
                      {item.duration}
                    </div>
                  )}
                </div>
                <div className="p-2 text-right rtl-card-content">
                  <h3 className="font-semibold text-xs mb-1 line-clamp-1">{item.title}</h3>
                  <p className="text-gray-500 text-[10px] line-clamp-1 mb-2">
                    {description}
                  </p>
                  <div className="flex justify-between text-[8px] text-gray-500">
                    <span>{date}</span>
                    <span>{author}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
};

export default ContentListWithLinks;
