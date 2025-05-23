
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ItemType } from "@/contexts/DataContext";
import { Article, Podcast, Video, Webinar, File } from "@/contexts/DataContext";

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

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
      {items.map((item) => (
        <Link to={`/${pluralType}/${item.id}`} key={item.id}>
          <Card className="h-full hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-32 object-cover rounded-t-lg"
                />
                {type === "podcast" && (
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-[8px] px-1.5 py-0.5 rounded">
                    {(item as Podcast).duration}
                  </div>
                )}
                {(type === "video" || type === "webinar") && (
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-[8px] px-1.5 py-0.5 rounded">
                    {type === "video" 
                      ? (item as Video).duration
                      : (item as Webinar).duration}
                  </div>
                )}
              </div>
              <div className="p-2 text-right rtl-card-content">
                <h3 className="font-semibold text-xs mb-1 line-clamp-1">{item.title}</h3>
                <p className="text-gray-500 text-[10px] line-clamp-1 mb-2">
                  {item.description}
                </p>
                <div className="flex justify-between text-[8px] text-gray-500">
                  <span>{item.date}</span>
                  <span>{item.author}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default ContentListWithLinks;
