import React from "react";
import { Clock, Play } from "lucide-react";
import { formatStartTime, getTimeUntilStart } from "@/lib/utils";

interface LivestreamPlayerProps {
  livestream: {
    title: string;
    thumbnail: string;
    stream_url: string | null;
    stream_status: "live" | "scheduled" | "ended";
    start_at: string | null;
  };
}

const LivestreamPlayer: React.FC<LivestreamPlayerProps> = ({ livestream }) => {
  const formatStartTime = (startAt: string | null) => {
    if (!startAt) return "زمان شروع مشخص نشده";
    
    try {
      const date = new Date(startAt);
      return date.toLocaleString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return startAt;
    }
  };

  const getTimeUntilStart = (startAt: string | null) => {
    if (!startAt) return null;
    
    try {
      const startTime = new Date(startAt);
      const now = new Date();
      const diff = startTime.getTime() - now.getTime();
      
      if (diff <= 0) return null;
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        return `${days} روز و ${hours} ساعت دیگر`;
      } else if (hours > 0) {
        return `${hours} ساعت و ${minutes} دقیقه دیگر`;
      } else {
        return `${minutes} دقیقه دیگر`;
      }
    } catch (error) {
      return null;
    }
  };

  if (livestream.stream_status === 'live' && livestream.stream_url) {
    return (
      <div className="relative">
        <div className="bg-black rounded-lg overflow-hidden">
          <iframe
            src={livestream.stream_url}
            className="w-full h-96 md:h-[500px]"
            frameBorder="0"
            allowFullScreen
            title={livestream.title}
          />
        </div>
        <div className="absolute top-4 right-4">
          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
            🔴 زنده
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <img
        src={livestream.thumbnail}
        alt={livestream.title}
        className="w-full h-64 md:h-80 object-cover rounded-lg"
        loading="lazy"
      />
      {livestream.stream_status === 'scheduled' && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
          <div className="text-center text-white">
            <Clock className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">هنوز شروع نشده</h3>
            <p className="text-lg">{formatStartTime(livestream.start_at)}</p>
            {getTimeUntilStart(livestream.start_at) && (
              <p className="text-sm mt-2">{getTimeUntilStart(livestream.start_at)}</p>
            )}
          </div>
        </div>
      )}
      {livestream.stream_status === 'ended' && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
          <div className="text-center text-white">
            <Play className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">پایان یافته</h3>
            <p className="text-sm">این لایو استریم به پایان رسیده است</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LivestreamPlayer; 