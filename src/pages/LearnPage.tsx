import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { TOKEN_STORAGE_KEY, API_BASE_URL, API_ENDPOINTS } from '@/lib/config';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  ArrowRight,
  Volume2,
  Maximize,
  Settings
} from 'lucide-react';

// Types
interface CourseLesson {
  id: string;
  title: string;
  content: string;
  video_url: string;
  duration: number;
  order: number;
  is_free_preview: boolean;
  progress: {
    is_completed: boolean;
    watched_duration: number;
    last_position: number;
    status: string;
  } | null;
}

interface CourseChapter {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: CourseLesson[];
  total_duration: number;
}

interface LearnPageData {
  course: {
    id: string;
    title: string;
    description: string;
    instructor: string;
    thumbnail: string;
    total_lessons: number;
    total_duration: number;
  };
  chapters: CourseChapter[];
  user_progress: {
    completion_percentage: number;
    completed_lessons: number;
    total_lessons: number;
    watched_duration: number;
    total_duration: number;
    last_activity: string | null;
  };
  next_lesson: CourseLesson | null;
}

// Helper function to get authorization headers
const getAuthHeaders = () => {
  const storedTokens = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (storedTokens) {
    const tokens = JSON.parse(storedTokens);
    if (tokens?.access) {
      return {
        'Authorization': `Bearer ${tokens.access}`,
        'Content-Type': 'application/json',
      };
    }
  }
  return {
    'Content-Type': 'application/json',
  };
};

const LearnPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [learnData, setLearnData] = useState<LearnPageData | null>(null);
  const [currentLesson, setCurrentLesson] = useState<CourseLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!courseId) {
      navigate('/courses');
      return;
    }

    fetchLearnData();
  }, [courseId, user, navigate]);

  const fetchLearnData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.COURSE_LEARN(courseId!)}`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setLearnData(data);
        
        // Set current lesson to next lesson or first lesson
        if (data.next_lesson) {
          setCurrentLesson(data.next_lesson);
        } else if (data.chapters.length > 0 && data.chapters[0].lessons.length > 0) {
          setCurrentLesson(data.chapters[0].lessons[0]);
        }
      } else if (response.status === 403) {
        toast({
          title: "خطا در دسترسی",
          description: "برای دسترسی به این دوره باید در آن ثبت‌نام کرده باشید.",
          variant: "destructive",
        });
        navigate(`/courses/${courseId}`);
      } else if (response.status === 401) {
        toast({
          title: "خطا در احراز هویت",
          description: "لطفا مجددا وارد شوید.",
          variant: "destructive",
        });
        navigate('/login');
      } else {
        throw new Error('Failed to fetch learn data');
      }
    } catch (error) {
      console.error('Error fetching learn data:', error);
      toast({
        title: "خطا",
        description: "مشکلی در دریافت اطلاعات دوره وجود دارد.",
        variant: "destructive",
      });
      navigate('/courses');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProgress = async (lessonId: string, position: number) => {
    try {
      await fetch(`${API_BASE_URL}${API_ENDPOINTS.LESSON_PROGRESS(courseId!, lessonId)}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          watched_duration: Math.floor(position),
          last_position: Math.floor(position),
        }),
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LESSON_COMPLETE(courseId!, lessonId)}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        toast({
          title: "موفقیت",
          description: "درس با موفقیت تکمیل شد!",
        });
        
        // Refresh data to update progress
        fetchLearnData();
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  const selectLesson = (lesson: CourseLesson) => {
    setCurrentLesson(lesson);
    setCurrentTime(lesson.progress?.last_position || 0);
  };

  const getNextLesson = (): CourseLesson | null => {
    if (!learnData || !currentLesson) return null;

    for (const chapter of learnData.chapters) {
      const currentIndex = chapter.lessons.findIndex(l => l.id === currentLesson.id);
      if (currentIndex !== -1) {
        // Try next lesson in same chapter
        if (currentIndex < chapter.lessons.length - 1) {
          return chapter.lessons[currentIndex + 1];
        }
        // Try first lesson of next chapter
        const chapterIndex = learnData.chapters.findIndex(c => c.id === chapter.id);
        if (chapterIndex < learnData.chapters.length - 1) {
          const nextChapter = learnData.chapters[chapterIndex + 1];
          if (nextChapter.lessons.length > 0) {
            return nextChapter.lessons[0];
          }
        }
      }
    }
    return null;
  };

  const goToNextLesson = () => {
    const nextLesson = getNextLesson();
    if (nextLesson) {
      setCurrentLesson(nextLesson);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Video Player Skeleton */}
              <div className="lg:col-span-3">
                <Skeleton className="aspect-video w-full mb-4" />
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              
              {/* Sidebar Skeleton */}
              <div className="lg:col-span-1">
                <Skeleton className="h-96 w-full" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!learnData) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-bold mb-4">دوره یافت نشد</h2>
              <Button onClick={() => navigate('/courses')}>
                بازگشت به لیست دوره‌ها
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Video Area */}
            <div className="lg:col-span-3">
              {/* Video Player */}
              <Card className="mb-6">
                <CardContent className="p-0">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    {currentLesson?.video_url ? (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <div className="text-center">
                          <Play className="h-16 w-16 mx-auto mb-4 opacity-70" />
                          <p className="text-lg">{currentLesson.title}</p>
                          <p className="text-sm opacity-70 mt-2">
                            ویدیو پلیر در حال توسعه...
                          </p>
                          <div className="mt-4 flex gap-2 justify-center">
                            <Button variant="secondary" size="sm">
                              <Play className="h-4 w-4 ml-1" />
                              پخش
                            </Button>
                            <Button variant="secondary" size="sm">
                              <Volume2 className="h-4 w-4 ml-1" />
                              صدا
                            </Button>
                            <Button variant="secondary" size="sm">
                              <Maximize className="h-4 w-4 ml-1" />
                              تمام صفحه
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <p>ویدیو دردسترس نیست</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Video Controls */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold" dir="rtl">
                      {currentLesson?.title}
                    </h1>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => currentLesson && markLessonComplete(currentLesson.id)}
                        disabled={currentLesson?.progress?.is_completed}
                      >
                        <CheckCircle className="h-4 w-4 ml-1" />
                        {currentLesson?.progress?.is_completed ? 'تکمیل شده' : 'تکمیل درس'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={goToNextLesson}
                        disabled={!getNextLesson()}
                      >
                        <SkipForward className="h-4 w-4 ml-1" />
                        درس بعدی
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>پیشرفت درس</span>
                      <span>
                        {currentLesson?.progress ? 
                          `${Math.floor((currentLesson.progress.watched_duration / (currentLesson.duration * 60)) * 100)}%` : 
                          '0%'
                        }
                      </span>
                    </div>
                    <Progress 
                      value={currentLesson?.progress ? 
                        (currentLesson.progress.watched_duration / (currentLesson.duration * 60)) * 100 : 
                        0
                      } 
                      className="h-2" 
                    />
                  </div>

                  {/* Lesson Info */}
                  <div className="text-sm text-gray-600" dir="rtl">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 ml-1" />
                        {currentLesson?.duration} دقیقه
                      </span>
                      <span className="flex items-center">
                        <BookOpen className="h-4 w-4 ml-1" />
                        {learnData.course.instructor}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lesson Description */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4" dir="rtl">توضیحات درس</h3>
                  <div className="prose prose-sm max-w-none" dir="rtl">
                    <p>{currentLesson?.content || 'توضیحی برای این درس ارائه نشده است.'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Course Progress */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4" dir="rtl">پیشرفت دوره</h3>
                  
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-orange-600">
                      {Math.round(learnData.user_progress.completion_percentage)}%
                    </div>
                    <div className="text-sm text-gray-600">تکمیل شده</div>
                  </div>

                  <Progress value={learnData.user_progress.completion_percentage} className="mb-4" />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>دروس تکمیل شده:</span>
                      <span>{learnData.user_progress.completed_lessons} از {learnData.user_progress.total_lessons}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>زمان مشاهده:</span>
                      <span>{Math.floor(learnData.user_progress.watched_duration / 60)} دقیقه</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Course Content */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4" dir="rtl">محتوای دوره</h3>
                  
                  <div className="space-y-4">
                    {learnData.chapters.map((chapter) => (
                      <div key={chapter.id} className="border rounded-lg p-3">
                        <h4 className="font-semibold mb-2" dir="rtl">{chapter.title}</h4>
                        
                        <div className="space-y-2">
                          {chapter.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                                currentLesson?.id === lesson.id
                                  ? 'bg-orange-100 border border-orange-300'
                                  : 'hover:bg-gray-100'
                              }`}
                              onClick={() => selectLesson(lesson)}
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <div className="flex-shrink-0">
                                  {lesson.progress?.is_completed ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Play className="h-4 w-4 text-gray-400" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate" dir="rtl">
                                    {lesson.title}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {lesson.duration} دقیقه
                                  </p>
                                </div>
                              </div>
                              
                              {lesson.progress?.is_completed && (
                                <Badge variant="secondary" className="ml-2">
                                  تکمیل
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LearnPage; 