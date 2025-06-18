import React, { createContext, useContext, useState, useEffect } from "react";
import { articlesApi, videosApi, podcastsApi, livestreamsApi, bookmarksApi, BookmarkResponse } from "@/lib/api";
import { Article, Video, Podcast, Webinar, File, Bookmark, Comment, ItemType, Livestream } from "@/types/content";
import { PaginationState } from "@/types/pagination";
import { useAuth } from "./AuthContext";

interface ContentContextType {
  articles: Article[];
  podcasts: Podcast[];
  videos: Video[];
  webinars: Webinar[];
  livestreams: Livestream[];
  files: File[];
  bookmarks: Bookmark[];
  comments: Comment[];
  addBookmark: (articleId: string) => Promise<void>;
  removeBookmark: (articleId: string) => Promise<void>;
  isBookmarked: (articleId: string) => boolean;
  addComment: (comment: Omit<Comment, "id" | "date">) => void;
  clearContentCache: () => void;
  loadMoreArticles: () => Promise<void>;
  loadMoreVideos: () => Promise<void>;
  loadMorePodcasts: () => Promise<void>;
  loadMoreLivestreams: () => Promise<void>;
  isLoading: {
    articles: boolean;
    videos: boolean;
    podcasts: boolean;
    livestreams: boolean;
    bookmarks: boolean;
  };
  pagination: {
    articles: PaginationState;
    videos: PaginationState;
    podcasts: PaginationState;
    livestreams: PaginationState;
  };
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [livestreams, setLivestreams] = useState<Livestream[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState({
    articles: true,
    videos: true,
    podcasts: true,
    livestreams: true,
    bookmarks: false
  });
  const [pagination, setPagination] = useState({
    articles: { currentPage: 1, totalPages: 1, totalCount: 0, hasNext: false, hasPrevious: false },
    videos: { currentPage: 1, totalPages: 1, totalCount: 0, hasNext: false, hasPrevious: false },
    podcasts: { currentPage: 1, totalPages: 1, totalCount: 0, hasNext: false, hasPrevious: false },
    livestreams: { currentPage: 1, totalPages: 1, totalCount: 0, hasNext: false, hasPrevious: false }
  });

  // Helper function to transform API bookmark to our Bookmark type
  const transformBookmark = (apiBookmark: BookmarkResponse): Bookmark => ({
    id: apiBookmark.id.toString(),
    user: apiBookmark.user,
    article: {
      ...apiBookmark.article,
      id: apiBookmark.article?.id?.toString() || apiBookmark.article?.id || 'unknown'
    },
    created_at: apiBookmark.created_at,
    // Computed properties for backward compatibility
    itemId: apiBookmark.article?.id?.toString() || apiBookmark.article?.id || 'unknown',
    itemType: "article" as ItemType,
    userId: apiBookmark.user?.id || 'unknown',
    date: apiBookmark.created_at
  });

  // Helper function to transform livestream to webinar for backward compatibility
  const transformLivestreamToWebinar = (livestream: Livestream): Webinar => ({
    id: livestream.id.toString(),
    title: livestream.title,
    slug: livestream.slug,
    description: livestream.description,
    thumbnail: livestream.thumbnail,
    stream_url: livestream.stream_url,
    start_at: livestream.start_at,
    stream_status: livestream.stream_status,
    max_viewers: livestream.max_viewers,
    current_viewers: livestream.current_viewers,
    author: livestream.author,
    category: livestream.category,
    tags: livestream.tags,
    status: livestream.status,
    featured: livestream.featured,
    created_at: livestream.created_at,
    updated_at: livestream.updated_at,
    published_at: livestream.published_at,
    view_count: livestream.view_count,
    // Computed properties for backward compatibility
    videoUrl: livestream.stream_url || '',
    isLive: livestream.stream_status === 'live',
    startTime: livestream.start_at || '',
    date: livestream.created_at,
    duration: '00:00:00' // Default duration for livestreams
  });

  // Clear all content cache and reset state
  const clearContentCache = () => {
    console.log('ContentContext: Clearing content cache and resetting state');
    setArticles([]);
    setPodcasts([]);
    setVideos([]);
    setWebinars([]);
    setLivestreams([]);
    setFiles([]);
    setBookmarks([]);
    setComments([]);
    setIsLoading({ articles: true, videos: true, podcasts: true, livestreams: true, bookmarks: false });
  };

  // Reload function to refresh all content
  const reloadAllContent = async () => {
    console.log('ContentContext: Reloading all content...');
    setIsLoading({ articles: true, videos: true, podcasts: true, livestreams: true, bookmarks: false });
    
    try {
      // Fetch articles
      const articlesResponse = await articlesApi.getAll(1, 10);
      setArticles(articlesResponse.results);
      setPagination(prev => ({
        ...prev,
        articles: {
          currentPage: articlesResponse.current_page,
          totalPages: articlesResponse.total_pages,
          totalCount: articlesResponse.count,
          hasNext: !!articlesResponse.next,
          hasPrevious: !!articlesResponse.previous
        }
      }));

      // Fetch videos
      const videosResponse = await videosApi.getAll(1, 10);
      setVideos(videosResponse.results);
      setPagination(prev => ({
        ...prev,
        videos: {
          currentPage: videosResponse.current_page,
          totalPages: videosResponse.total_pages,
          totalCount: videosResponse.count,
          hasNext: !!videosResponse.next,
          hasPrevious: !!videosResponse.previous
        }
      }));

      // Fetch podcasts
      const podcastsResponse = await podcastsApi.getAll(1, 10);
      const transformedPodcasts: Podcast[] = podcastsResponse.results.map(podcast => ({
        id: podcast.id,
        title: podcast.title,
        description: podcast.description,
        thumbnail: podcast.thumbnail || '',
        audio_type: podcast.audio_type,
        audio_file: podcast.audio_file,
        audio_url: podcast.audio_url,
        author: podcast.author,
        date: podcast.date,
        duration: podcast.duration,
        tags: podcast.tags.map(tag => tag.name)
      }));
      setPodcasts(transformedPodcasts);
      setPagination(prev => ({
        ...prev,
        podcasts: {
          currentPage: podcastsResponse.current_page,
          totalPages: podcastsResponse.total_pages,
          totalCount: podcastsResponse.count,
          hasNext: !!podcastsResponse.next,
          hasPrevious: !!podcastsResponse.previous
        }
      }));

      // Fetch livestreams
      const livestreamsResponse = await livestreamsApi.getAll(1, 10);
      setLivestreams(livestreamsResponse.results);
      
      // Transform livestreams to webinars for backward compatibility
      const transformedWebinars: Webinar[] = livestreamsResponse.results.map(transformLivestreamToWebinar);
      setWebinars(transformedWebinars);
      
      setPagination(prev => ({
        ...prev,
        livestreams: {
          currentPage: livestreamsResponse.current_page,
          totalPages: livestreamsResponse.total_pages,
          totalCount: livestreamsResponse.count,
          hasNext: !!livestreamsResponse.next,
          hasPrevious: !!livestreamsResponse.previous
        }
      }));

      // Refresh bookmarks if user is logged in
      if (user) {
        const bookmarksResponse = await bookmarksApi.getAll();
        const transformedBookmarks = bookmarksResponse.map(transformBookmark);
        setBookmarks(transformedBookmarks);
      }

      console.log('ContentContext: All content reloaded successfully');
    } catch (error) {
      console.error('ContentContext: Error reloading content:', error);
    } finally {
      setIsLoading({ articles: false, videos: false, podcasts: false, livestreams: false, bookmarks: false });
    }
  };

  // Listen for logout and reload events
  useEffect(() => {
    const handleLogout = () => {
      console.log('ContentContext: Received logout event, clearing cache');
      clearContentCache();
    };

    const handleReload = () => {
      console.log('ContentContext: Received reload event, refreshing content');
      reloadAllContent();
    };

    window.addEventListener('auth:logout', handleLogout);
    window.addEventListener('pwa:reload', handleReload);
    
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
      window.removeEventListener('pwa:reload', handleReload);
    };
  }, [user]);

  // Fetch articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(prev => ({ ...prev, articles: true }));
        const response = await articlesApi.getAll(1, 10);
        setArticles(response.results);
        setPagination(prev => ({
          ...prev,
          articles: {
            currentPage: response.current_page,
            totalPages: response.total_pages,
            totalCount: response.count,
            hasNext: !!response.next,
            hasPrevious: !!response.previous
          }
        }));
      } catch (error) {
        console.error('Error fetching articles:', error);
        setArticles([]);
      } finally {
        setIsLoading(prev => ({ ...prev, articles: false }));
      }
    };

    fetchArticles();
  }, []);

  // Fetch videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(prev => ({ ...prev, videos: true }));
        const response = await videosApi.getAll(1, 10);
        setVideos(response.results);
        setPagination(prev => ({
          ...prev,
          videos: {
            currentPage: response.current_page,
            totalPages: response.total_pages,
            totalCount: response.count,
            hasNext: !!response.next,
            hasPrevious: !!response.previous
          }
        }));
      } catch (error) {
        console.error('Error fetching videos:', error);
        setVideos([]);
      } finally {
        setIsLoading(prev => ({ ...prev, videos: false }));
      }
    };

    fetchVideos();
  }, []);

  // Fetch podcasts
  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        setIsLoading(prev => ({ ...prev, podcasts: true }));
        const response = await podcastsApi.getAll(1, 10);
        // Transform API podcasts to match our Podcast type
        const transformedPodcasts: Podcast[] = response.results.map(podcast => ({
          id: podcast.id,
          title: podcast.title,
          description: podcast.description,
          thumbnail: podcast.thumbnail || '',
          audio_type: podcast.audio_type,
          audio_file: podcast.audio_file,
          audio_url: podcast.audio_url,
          author: podcast.author,
          date: podcast.date,
          duration: podcast.duration,
          tags: podcast.tags.map(tag => tag.name)
        }));
        setPodcasts(transformedPodcasts);
        setPagination(prev => ({
          ...prev,
          podcasts: {
            currentPage: response.current_page,
            totalPages: response.total_pages,
            totalCount: response.count,
            hasNext: !!response.next,
            hasPrevious: !!response.previous
          }
        }));
      } catch (error) {
        console.error('Error fetching podcasts:', error);
        setPodcasts([]);
      } finally {
        setIsLoading(prev => ({ ...prev, podcasts: false }));
      }
    };

    fetchPodcasts();
  }, []);

  // Fetch livestreams
  useEffect(() => {
    const fetchLivestreams = async () => {
      try {
        setIsLoading(prev => ({ ...prev, livestreams: true }));
        const response = await livestreamsApi.getAll(1, 10);
        setLivestreams(response.results);
        
        // Transform livestreams to webinars for backward compatibility
        const transformedWebinars: Webinar[] = response.results.map(transformLivestreamToWebinar);
        setWebinars(transformedWebinars);
        
        setPagination(prev => ({
          ...prev,
          livestreams: {
            currentPage: response.current_page,
            totalPages: response.total_pages,
            totalCount: response.count,
            hasNext: !!response.next,
            hasPrevious: !!response.previous
          }
        }));
      } catch (error) {
        console.error('Error fetching livestreams:', error);
        setLivestreams([]);
        setWebinars([]);
      } finally {
        setIsLoading(prev => ({ ...prev, livestreams: false }));
      }
    };

    fetchLivestreams();
  }, []);

  // Fetch bookmarks when user is available
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user) {
        setBookmarks([]);
        return;
      }

      try {
        setIsLoading(prev => ({ ...prev, bookmarks: true }));
        const apiBookmarks = await bookmarksApi.getAll();
        const transformedBookmarks = apiBookmarks.map(transformBookmark);
        setBookmarks(transformedBookmarks);
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
        setBookmarks([]);
      } finally {
        setIsLoading(prev => ({ ...prev, bookmarks: false }));
      }
    };

    fetchBookmarks();
  }, [user]);

  const addBookmark = async (articleId: string): Promise<void> => {
    if (!user) {
      throw new Error('User must be logged in to bookmark articles');
    }

    try {
      const newBookmark = await bookmarksApi.create(articleId);
      const transformedBookmark = transformBookmark(newBookmark);
      setBookmarks(prev => [...prev, transformedBookmark]);
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  };

  const removeBookmark = async (articleId: string): Promise<void> => {
    if (!user) {
      throw new Error('User must be logged in to remove bookmarks');
    }

    try {
      // Find the bookmark by article ID
      const bookmark = bookmarks.find(b => b.article.id === articleId);
      if (!bookmark) {
        throw new Error('Bookmark not found');
      }

      await bookmarksApi.delete(bookmark.id);
      setBookmarks(prev => prev.filter(b => b.article.id !== articleId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw error;
    }
  };

  const isBookmarked = (articleId: string): boolean => {
    return bookmarks.some(bookmark => bookmark.article.id === articleId);
  };

  const addComment = (comment: Omit<Comment, "id" | "date">) => {
    const newComment: Comment = {
      ...comment,
      id: Math.random().toString(),
      date: new Date().toISOString(),
    };
    setComments([...comments, newComment]);
  };

  const loadMoreArticles = async () => {
    if (!pagination.articles.hasNext || isLoading.articles) return;
    
    try {
      setIsLoading(prev => ({ ...prev, articles: true }));
      const response = await articlesApi.getAll(pagination.articles.currentPage + 1, 10);
      setArticles(prev => [...prev, ...response.results]);
      setPagination(prev => ({
        ...prev,
        articles: {
          currentPage: response.current_page,
          totalPages: response.total_pages,
          totalCount: response.count,
          hasNext: !!response.next,
          hasPrevious: !!response.previous
        }
      }));
    } catch (error) {
      console.error('Error loading more articles:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, articles: false }));
    }
  };

  const loadMoreVideos = async () => {
    if (!pagination.videos.hasNext || isLoading.videos) return;
    
    try {
      setIsLoading(prev => ({ ...prev, videos: true }));
      const response = await videosApi.getAll(pagination.videos.currentPage + 1, 10);
      setVideos(prev => [...prev, ...response.results]);
      setPagination(prev => ({
        ...prev,
        videos: {
          currentPage: response.current_page,
          totalPages: response.total_pages,
          totalCount: response.count,
          hasNext: !!response.next,
          hasPrevious: !!response.previous
        }
      }));
    } catch (error) {
      console.error('Error loading more videos:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, videos: false }));
    }
  };

  const loadMorePodcasts = async () => {
    if (!pagination.podcasts.hasNext || isLoading.podcasts) return;
    
    try {
      setIsLoading(prev => ({ ...prev, podcasts: true }));
      const response = await podcastsApi.getAll(pagination.podcasts.currentPage + 1, 10);
      const transformedPodcasts: Podcast[] = response.results.map(podcast => ({
        id: podcast.id,
        title: podcast.title,
        description: podcast.description,
        thumbnail: podcast.thumbnail || '',
        audio_type: podcast.audio_type,
        audio_file: podcast.audio_file,
        audio_url: podcast.audio_url,
        author: podcast.author,
        date: podcast.date,
        duration: podcast.duration,
        tags: podcast.tags.map(tag => tag.name)
      }));
      setPodcasts(prev => [...prev, ...transformedPodcasts]);
      setPagination(prev => ({
        ...prev,
        podcasts: {
          currentPage: response.current_page,
          totalPages: response.total_pages,
          totalCount: response.count,
          hasNext: !!response.next,
          hasPrevious: !!response.previous
        }
      }));
    } catch (error) {
      console.error('Error loading more podcasts:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, podcasts: false }));
    }
  };

  const loadMoreLivestreams = async () => {
    if (!pagination.livestreams.hasNext || isLoading.livestreams) return;
    
    try {
      setIsLoading(prev => ({ ...prev, livestreams: true }));
      const response = await livestreamsApi.getAll(pagination.livestreams.currentPage + 1, 10);
      setLivestreams(prev => [...prev, ...response.results]);
      setPagination(prev => ({
        ...prev,
        livestreams: {
          currentPage: response.current_page,
          totalPages: response.total_pages,
          totalCount: response.count,
          hasNext: !!response.next,
          hasPrevious: !!response.previous
        }
      }));
    } catch (error) {
      console.error('Error loading more livestreams:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, livestreams: false }));
    }
  };

  return (
    <ContentContext.Provider
      value={{
        articles,
        podcasts,
        videos,
        webinars,
        livestreams,
        files,
        bookmarks,
        comments,
        addBookmark,
        removeBookmark,
        isBookmarked,
        addComment,
        clearContentCache,
        loadMoreArticles,
        loadMoreVideos,
        loadMorePodcasts,
        loadMoreLivestreams,
        isLoading,
        pagination
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
};
