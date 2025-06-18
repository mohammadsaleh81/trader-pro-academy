import { Article, Video, Podcast as ApiPodcast } from "@/lib/api";

// Content Types
export type Podcast = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  audio_type: string;
  audio_file: string | null;
  audio_url: string;
  author: string;
  date: string;
  duration: string;
  tags: string[];
};

export type Webinar = {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  stream_url: string | null;
  start_at: string | null;
  stream_status: "live" | "scheduled" | "ended";
  max_viewers: number;
  current_viewers: number;
  author: {
    id: number;
    username: string | null;
    email: string;
    first_name: string;
    last_name: string;
  };
  category: {
    id: number;
    name: string;
    slug: string;
    description: string;
    created_at: string;
  };
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  status: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  view_count: number;
  // Computed properties for backward compatibility
  videoUrl: string;
  isLive: boolean;
  startTime: string;
  date: string;
  duration: string;
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
export type ItemType = "article" | "podcast" | "video" | "webinar" | "file" | "course" | "livestream";

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

// New Livestream type for API response
export type Livestream = {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  stream_url: string | null;
  start_at: string | null;
  stream_status: "live" | "scheduled" | "ended";
  max_viewers: number;
  current_viewers: number;
  author: {
    id: number;
    username: string | null;
    email: string;
    first_name: string;
    last_name: string;
  };
  category: {
    id: number;
    name: string;
    slug: string;
    description: string;
    created_at: string;
  };
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  status: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  view_count: number;
};

// Export types using proper export type syntax
export type { Article, Video, ApiPodcast };
