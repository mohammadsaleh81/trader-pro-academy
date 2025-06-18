
import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface SearchResult {
  id: string;
  title: string;
  type: 'article' | 'video' | 'podcast' | 'course';
  slug?: string;
  thumbnail?: string;
  description?: string;
}

interface UseSearchOptions {
  enabled?: boolean;
  minLength?: number;
  debounceMs?: number;
}

export const useSearch = (options: UseSearchOptions = {}) => {
  const {
    enabled = true,
    minLength = 2,
    debounceMs = 300
  } = options;

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Debounce search query
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, debounceMs]);

  const searchQuery = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!debouncedQuery || debouncedQuery.length < minLength) {
        return [];
      }

      try {
        // Search across multiple content types
        const [articles, videos, podcasts, courses] = await Promise.allSettled([
          api.searchArticles(debouncedQuery),
          api.searchVideos(debouncedQuery),
          api.searchPodcasts(debouncedQuery),
          api.searchCourses(debouncedQuery)
        ]);

        const results: SearchResult[] = [];

        // Process articles
        if (articles.status === 'fulfilled') {
          articles.value.forEach((article: any) => {
            results.push({
              id: article.id.toString(),
              title: article.title,
              type: 'article',
              slug: article.slug,
              thumbnail: article.thumbnail,
              description: article.excerpt
            });
          });
        }

        // Process videos
        if (videos.status === 'fulfilled') {
          videos.value.forEach((video: any) => {
            results.push({
              id: video.id.toString(),
              title: video.title,
              type: 'video',
              slug: video.slug,
              thumbnail: video.thumbnail,
              description: video.description
            });
          });
        }

        // Process podcasts
        if (podcasts.status === 'fulfilled') {
          podcasts.value.forEach((podcast: any) => {
            results.push({
              id: podcast.id.toString(),
              title: podcast.title,
              type: 'podcast',
              slug: podcast.slug,
              thumbnail: podcast.thumbnail,
              description: podcast.description
            });
          });
        }

        // Process courses
        if (courses.status === 'fulfilled') {
          courses.value.forEach((course: any) => {
            results.push({
              id: course.id.toString(),
              title: course.title,
              type: 'course',
              slug: course.slug,
              thumbnail: course.thumbnail,
              description: course.description
            });
          });
        }

        return results;
      } catch (error) {
        console.error('Search error:', error);
        return [];
      }
    },
    enabled: enabled && debouncedQuery.length >= minLength,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  return {
    query,
    setQuery,
    results: searchQuery.data || [],
    isLoading: searchQuery.isLoading,
    error: searchQuery.error,
    clearSearch
  };
};
