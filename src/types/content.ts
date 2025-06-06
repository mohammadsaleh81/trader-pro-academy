import { Article, Video, Podcast as ApiPodcast } from "@/lib/api";

// Content Types
export type Podcast = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  audioUrl: string;
  author: string;
  date: string;
  duration: string;
  tags: string[];
};

export type Webinar = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  author: string;
  date: string;
  duration: string;
  tags: string[];
  isLive: boolean;
  startTime: string;
};

export type File = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  fileUrl: string;
  author: string;
  date: string;
  fileSize: string;
  fileType: string;
  tags: string[];
};

// Item Types for bookmarks
export type ItemType = "article" | "podcast" | "video" | "webinar" | "file" | "course";

// Updated Bookmark Type to match API response
export type Bookmark = {
  id: string;
  user: {
    id: string;
    username?: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  article: {
    id: string;
    title: string;
    slug: string;
    thumbnail?: string;
  };
  created_at: string;
  // Computed properties for backward compatibility
  itemId: string; // derived from article.id
  itemType: ItemType; // always "article" for now
  userId: string; // derived from user.id
  date: string; // derived from created_at
};

// Comment Type
export type Comment = {
  id: string;
  itemId: string;
  itemType: ItemType;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  date: string;
  rating?: number;
};

// Export types using proper export type syntax
export type { Article, Video, ApiPodcast };
