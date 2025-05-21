
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
    <div className="grid grid-cols-1 gap-6 px-3">
      {items.map((item) => (
        <Link to={`/${pluralType}/${item.id}`} key={item.id}>
          <Card className="h-full hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-0">
              <div className="flex flex-col">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm line-clamp-3 mb-4">
                    {item.description}
                  </p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{item.author}</span>
                    <span>{item.date}</span>
                  </div>
                  {type === "podcast" && (
                    <div className="mt-2 text-xs text-gray-600">
                      مدت زمان: {(item as Podcast).duration}
                    </div>
                  )}
                  {(type === "video" || type === "webinar") && (
                    <div className="mt-2 text-xs text-gray-600">
                      مدت زمان: {type === "video" 
                        ? (item as Video).duration
                        : (item as Webinar).duration}
                    </div>
                  )}
                  {type === "file" && (
                    <div className="mt-2 text-xs text-gray-600">
                      حجم: {(item as File).fileSize} {(item as File).fileType}
                    </div>
                  )}
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
