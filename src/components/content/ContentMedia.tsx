
import React from "react";
import { Play } from "lucide-react";
import { Article, Video } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";

interface ContentMediaProps {
  content: Article | Video;
}

const ContentMedia: React.FC<ContentMediaProps> = ({ content }) => {
  if ('video_type' in content) { // It's a video
    return (
      <div className="w-full aspect-video bg-gray-100 rounded-lg mb-6 relative">
        {content.video_embed && content.video_embed.trim() !== '' ? (
          <div 
            className="w-full h-full rounded-lg overflow-hidden"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.video_embed) }} 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">ویدیو در دسترس نیست</p>
            </div>
          </div>
        )}
      </div>
    );
  } else { // It's an article
    return content.thumbnail ? (
      <img
        src={content.thumbnail}
        alt={content.title}
        className="w-full h-64 object-cover rounded-lg mb-6"
        loading="lazy"
      />
    ) : null;
  }
};

export default ContentMedia;
