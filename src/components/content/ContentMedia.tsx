import React from "react";
import { Play, Volume2 } from "lucide-react";
import { Article, Video, Podcast } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";

interface ContentMediaProps {
  content: Article | Video | Podcast;
}

const ContentMedia: React.FC<ContentMediaProps> = ({ content }) => {
  if ('video_type' in content) { // It's a video
    return (
      <div className="w-full aspect-video bg-gray-100 rounded-lg mb-6 relative overflow-hidden">
        {content.video_embed && content.video_embed.trim() !== '' ? (
          <div 
            className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0 [&>iframe]:rounded-lg"
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
  } else if ('audio_url' in content) { // It's a podcast
    return (
      <div className="w-full bg-gray-100 rounded-lg mb-6 p-6 flex items-center">
        <div className="flex-1">
          {content.thumbnail ? (
            <img
              src={content.thumbnail}
              alt={content.title}
              className="w-32 h-32 object-cover rounded-lg mx-auto"
              loading="lazy"
            />
          ) : (
            <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center mx-auto">
              <Volume2 className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>
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
