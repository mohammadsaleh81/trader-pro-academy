import { useState, useEffect, useCallback } from 'react';

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

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchAPI = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/search/?q=${encodeURIComponent(searchQuery)}`
      );
      
      if (!response.ok) {
        throw new Error('خطا در جستجو');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در جستجو');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      searchAPI(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchAPI]);

  const clearSearch = () => {
    setQuery('');
    setResults(null);
    setError(null);
  };

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    clearSearch,
  };
}; 