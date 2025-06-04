
import { Article, Video } from "@/lib/api";

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

// Bookmark Type
export type Bookmark = {
  id: string;
  itemId: string;
  itemType: ItemType;
  userId: string;
  date: string;
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
export type { Article, Video };
