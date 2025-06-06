import React, { createContext, useContext, useState, useEffect } from "react";
import { articlesApi, videosApi, podcastsApi, bookmarksApi, BookmarkResponse } from "@/lib/api";
import { Article, Video, Podcast, Webinar, File, Bookmark, Comment, ItemType } from "@/types/content";
import { useAuth } from "./AuthContext";

interface ContentContextType {
  articles: Article[];
  podcasts: Podcast[];
  videos: Video[];
  webinars: Webinar[];
  files: File[];
  bookmarks: Bookmark[];
  comments: Comment[];
  addBookmark: (articleId: string) => Promise<void>;
  removeBookmark: (articleId: string) => Promise<void>;
  isBookmarked: (articleId: string) => boolean;
  addComment: (comment: Omit<Comment, "id" | "date">) => void;
  clearContentCache: () => void;
  isLoading: {
    articles: boolean;
    videos: boolean;
    podcasts: boolean;
    bookmarks: boolean;
  };
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState({
    articles: true,
    videos: true,
    podcasts: true,
    bookmarks: false
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

  // Clear all content cache and reset state
  const clearContentCache = () => {
    console.log('ContentContext: Clearing content cache and resetting state');
    setArticles([]);
    setPodcasts([]);
    setVideos([]);
    setWebinars([]);
    setFiles([]);
    setBookmarks([]);
    setComments([]);
    setIsLoading({ articles: true, videos: true, podcasts: true, bookmarks: false });
  };

  // Listen for logout event to clear cache
  useEffect(() => {
    const handleLogout = () => {
      console.log('ContentContext: Received logout event, clearing cache');
      clearContentCache();
    };

    window.addEventListener('auth:logout', handleLogout);
    
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  // Fetch articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(prev => ({ ...prev, articles: true }));
        const data = await articlesApi.getAll();
        setArticles(data);
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
        const data = await videosApi.getAll();
        setVideos(data);
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
        const apiPodcasts = await podcastsApi.getAll();
        // Transform API podcasts to match our Podcast type
        const transformedPodcasts: Podcast[] = apiPodcasts.map(podcast => ({
          id: podcast.id,
          title: podcast.title,
          description: podcast.description,
          thumbnail: podcast.thumbnail || '',
          audioUrl: podcast.audio_file,
          author: podcast.author,
          date: podcast.date,
          duration: podcast.duration,
          tags: podcast.tags.map(tag => tag.name)
        }));
        setPodcasts(transformedPodcasts);
      } catch (error) {
        console.error('Error fetching podcasts:', error);
        setPodcasts([]);
      } finally {
        setIsLoading(prev => ({ ...prev, podcasts: false }));
      }
    };

    fetchPodcasts();
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

  return (
    <ContentContext.Provider
      value={{
        articles,
        podcasts,
        videos,
        webinars,
        files,
        bookmarks,
        comments,
        addBookmark,
        removeBookmark,
        isBookmarked,
        addComment,
        clearContentCache,
        isLoading
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
