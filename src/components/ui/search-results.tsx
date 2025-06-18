import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, Video, Mic, Clock, Star, Users } from 'lucide-react';

interface Course {
  id: number;
  title: string;
  slug: string;
  instructor_name: string;
  thumbnail: string;
  price: string;
  is_free: boolean;
  status: string;
  level: string;
  rating_avg: number;
  student_count: number;
  total_duration: number;
  created_at: string;
  updated_at: string;
  is_enrolled: boolean;
  progress_percentage: number;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  thumbnail?: string;
  excerpt?: string;
  created_at: string;
}

interface Video {
  id: number;
  title: string;
  slug: string;
  thumbnail?: string;
  duration?: number;
  created_at: string;
}

interface Podcast {
  id: number;
  title: string;
  slug: string;
  thumbnail?: string;
  duration?: number;
  created_at: string;
}

interface SearchResults {
  courses: Course[] | string;
  articles: Article[] | string;
  videos: Video[] | string;
  podcasts: Podcast[] | string;
}

interface SearchResultsProps {
  results: SearchResults;
  onClose: () => void;
}

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  }
  return `${minutes} دقیقه`;
};

const SearchResults: React.FC<SearchResultsProps> = ({ results, onClose }) => {
  const hasResults = 
    (Array.isArray(results.courses) && results.courses.length > 0) ||
    (Array.isArray(results.articles) && results.articles.length > 0) ||
    (Array.isArray(results.videos) && results.videos.length > 0) ||
    (Array.isArray(results.podcasts) && results.podcasts.length > 0);

  if (!hasResults) {
    return (
      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 p-4 z-50">
        <p className="text-gray-500 text-center">نتیجه‌ای یافت نشد</p>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-96 overflow-y-auto z-50">
      {/* Courses */}
      {Array.isArray(results.courses) && results.courses.length > 0 && (
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-trader-600" />
            <h3 className="font-medium text-sm text-gray-900">دوره‌ها</h3>
          </div>
          {results.courses.slice(0, 3).map((course) => (
            <Link
              key={course.id}
              to={`/courses/${course.slug || course.id}`}
              onClick={onClose}
              className="block p-2 hover:bg-gray-50 rounded-lg mb-1 last:mb-0"
            >
              <div className="flex items-start gap-3">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-12 h-8 object-cover rounded flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-gray-900 truncate">
                    {course.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <span>{course.instructor_name}</span>
                    {course.rating_avg > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{course.rating_avg.toFixed(1)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{course.student_count}</span>
                    </div>
                  </div>
                  <div className="text-xs text-trader-600 font-medium mt-1">
                    {course.is_free ? 'رایگان' : course.price}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Articles */}
      {Array.isArray(results.articles) && results.articles.length > 0 && (
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <h3 className="font-medium text-sm text-gray-900">مقالات</h3>
          </div>
          {results.articles.slice(0, 3).map((article) => (
            <Link
              key={article.id}
              to={`/blog/${article.slug || article.id}`}
              onClick={onClose}
              className="block p-2 hover:bg-gray-50 rounded-lg mb-1 last:mb-0"
            >
              <div className="flex items-start gap-3">
                {article.thumbnail && (
                  <img
                    src={article.thumbnail}
                    alt={article.title}
                    className="w-12 h-8 object-cover rounded flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-gray-900 truncate">
                    {article.title}
                  </h4>
                  {article.excerpt && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Videos */}
      {Array.isArray(results.videos) && results.videos.length > 0 && (
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Video className="h-4 w-4 text-red-600" />
            <h3 className="font-medium text-sm text-gray-900">ویدیوها</h3>
          </div>
          {results.videos.slice(0, 3).map((video) => (
            <Link
              key={video.id}
              to={`/videos/${video.slug || video.id}`}
              onClick={onClose}
              className="block p-2 hover:bg-gray-50 rounded-lg mb-1 last:mb-0"
            >
              <div className="flex items-start gap-3">
                {video.thumbnail && (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-12 h-8 object-cover rounded flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-gray-900 truncate">
                    {video.title}
                  </h4>
                  {video.duration && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDuration(video.duration)}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Podcasts */}
      {Array.isArray(results.podcasts) && results.podcasts.length > 0 && (
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <Mic className="h-4 w-4 text-purple-600" />
            <h3 className="font-medium text-sm text-gray-900">پادکست‌ها</h3>
          </div>
          {results.podcasts.slice(0, 3).map((podcast) => (
            <Link
              key={podcast.id}
              to={`/podcasts/${podcast.slug || podcast.id}`}
              onClick={onClose}
              className="block p-2 hover:bg-gray-50 rounded-lg mb-1 last:mb-0"
            >
              <div className="flex items-start gap-3">
                {podcast.thumbnail && (
                  <img
                    src={podcast.thumbnail}
                    alt={podcast.title}
                    className="w-12 h-8 object-cover rounded flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-gray-900 truncate">
                    {podcast.title}
                  </h4>
                  {podcast.duration && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDuration(podcast.duration)}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults; 