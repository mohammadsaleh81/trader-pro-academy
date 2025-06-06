// Course Types
export type CourseLesson = {
  id: string;
  chapter: string;
  title: string;
  content: string;
  content_type: string;
  video_url: string;
  duration: number;
  order: number;
  is_free_preview: boolean;
  points: number;
  progress: number | null;
};

export type CourseChapter = {
  id: string;
  course: string;
  title: string;
  description: string;
  order: number;
  lessons: CourseLesson[];
  total_duration: number;
};

export type CourseUser = {
  id: string;
  username: string | null;
  email: string;
  first_name: string;
  last_name: string;
  thumbnail: string;
};

export type CourseComment = {
  id: string;
  user: CourseUser;
  content: string;
  replies: CourseComment[];
  created_at: string;
};

// Course Progress Types
export type CourseProgressData = {
  completion_percentage: number;
  completed_lessons: number;
  total_lessons: number;
  in_progress_lessons: number;
  watched_duration: number;
  total_duration: number;
  time_spent_percentage: number;
  last_activity: string | null;
};

export type ChapterProgress = {
  id: string;
  title: string;
  order: number;
  progress_percentage: number;
};

export type NextLesson = {
  id: string;
  title: string;
  chapter: string;
  order: number;
};

export type CourseEnrollment = {
  id: string;
  user: string;
  course: string;
  course_title: string;
  price_paid: string;
  discount_used: number | null;
  status: string;
  created_at: string;
  completion_date: string | null;
  progress_percentage: number;
  progress: CourseProgressData;
  chapters_progress: ChapterProgress[];
  next_lesson: NextLesson;
};

export type UserProgress = {
  enrollment: CourseEnrollment;
  course_progress: CourseProgressData;
  chapter_progress: ChapterProgress[];
  next_lesson: NextLesson | null;
};

export type CourseDetails = {
  info: {
    id: string;
    title: string;
    description: string;
    instructor: string;
    price: string;
    created_at: string;
    updated_at: string;
    status: string;
    tags: string[];
    thumbnail: string;
    total_duration: number;
    total_lessons: number;
    total_chapters: number;
    average_rating: number;
    total_students: number;
    language: string;
    level: "beginner" | "intermediate" | "advanced" | string;
    is_enrolled?: boolean;
    progress_percentage?: number;
  };
  chapters: CourseChapter[];
  comments: CourseComment[];
  user_progress?: UserProgress;
};

export type Course = {
  id: string;
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
};
