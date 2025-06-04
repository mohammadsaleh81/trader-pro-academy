
import React, { createContext, useContext, useState, useEffect } from "react";
import { articlesApi, videosApi } from "@/lib/api";
import { Article, Video, Podcast, Webinar, File, Bookmark, Comment, ItemType } from "@/types/content";

interface ContentContextType {
  articles: Article[];
  podcasts: Podcast[];
  videos: Video[];
  webinars: Webinar[];
  files: File[];
  bookmarks: Bookmark[];
  comments: Comment[];
  addBookmark: (itemId: string, itemType: ItemType, userId: string) => void;
  removeBookmark: (id: string) => void;
  addComment: (comment: Omit<Comment, "id" | "date">) => void;
  isLoading: {
    articles: boolean;
    videos: boolean;
  };
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState({
    articles: true,
    videos: true
  });

  // Fetch articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(prev => ({ ...prev, articles: true }));
        const data = await articlesApi.getAll();
        setArticles(data);
      } catch (error) {
        console.error('Error fetching articles:', error);
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
      } finally {
        setIsLoading(prev => ({ ...prev, videos: false }));
      }
    };

    fetchVideos();
  }, []);

  const addBookmark = (itemId: string, itemType: ItemType, userId: string) => {
    const newBookmark: Bookmark = {
      id: Math.random().toString(),
      itemId,
      itemType,
      userId,
      date: new Date().toISOString(),
    };
    setBookmarks([...bookmarks, newBookmark]);
  };

  const removeBookmark = (id: string) => {
    setBookmarks(bookmarks.filter((bookmark) => bookmark.id !== id));
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
        addComment,
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
