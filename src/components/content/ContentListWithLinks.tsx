
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <Link to={`/${pluralType}/${item.id}`} key={item.id}>
          <Card className="h-full hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                {type === "podcast" && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                    {(item as Podcast).duration}
                  </div>
                )}
                {(type === "video" || type === "webinar") && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                    {type === "video" 
                      ? (item as Video).duration
                      : (item as Webinar).duration}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-2">{item.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                  {item.description}
                </p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{item.author}</span>
                  <span>{item.date}</span>
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
