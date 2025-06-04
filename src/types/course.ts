export interface Course {
  id: string;
  slug?: string;
  title: string;
  instructor: string;
  thumbnail: string;
  description: string;
  price: number;
  rating: number;
  totalLessons?: number;
  completedLessons?: number;
  createdAt: string;
  updatedAt: string;
  categories: string[];
  duration?: string;
  level?: "beginner" | "intermediate" | "advanced";
  is_enrolled?: boolean;
  progress_percentage?: number;
}

export interface CourseChapter {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: CourseLesson[];
  total_duration: number;
}

export interface CourseLesson {
  id: string;
  title: string;
  content: string;
  content_type: string;
  video_url: string;
  duration: number;
  order: number;
  is_free_preview: boolean;
  points: number;
  progress?: {
    is_completed: boolean;
    watched_duration: number;
  };
}

export interface CourseComment {
  id: string;
  user: {
    id: number;
    phone_number: string;
    first_name: string;
    last_name: string;
    email: string;
    thumbnail: string;
  };
  content: string;
  replies: any[];
  created_at: string;
}

export interface UserProgress {
  course_progress: {
    completion_percentage: number;
    completed_lessons: number;
    watched_duration: number;
  };
  chapter_progress: Array<{
    id: string;
    title: string;
    progress_percentage: number;
  }>;
  next_lesson?: {
    id: string;
    title: string;
    chapter: string;
  };
}

export interface CourseDetails {
  info: {
    id: string;
    title: string;
    description: string;
    instructor: string;
    price: number;
    created_at: string;
    updated_at: string;
    status: string;
    level: string;
    language?: string;
    tags: string[];
    total_students: number;
    total_duration: number;
    get_average_rating: number;
    total_chapters: number;
    total_lessons: number;
    thumbnail: string;
  };
  chapters?: CourseChapter[];
  comments?: CourseComment[];
  user_progress?: UserProgress;
}
