
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, Play, Check, BookOpen, Clock } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

interface LearnPageData {
  course: {
    id: string;
    title: string;
    instructor: string;
    thumbnail: string;
  };
  chapters: Array<{
    id: string;
    title: string;
    order: number;
    progress_percentage: number;
    lessons: Array<{
      id: string;
      title: string;
      duration: number;
      is_free_preview: boolean;
      progress: {
        is_completed: boolean;
        watched_duration: number;
      } | null;
    }>;
  }>;
  progress: number;
  next_lesson: {
    id: string;
    title: string;
    chapter: string;
  } | null;
  total_duration: number;
  watched_duration: number;
}

const LearnPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [learnData, setLearnData] = useState<LearnPageData | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchLearnData();
    }
  }, [courseId]);

  const fetchLearnData = async () => {
    try {
      setIsLoading(true);
      const auth = localStorage.getItem('auth_tokens');
      if (!auth) {
        navigate('/login');
        return;
      }

      const tokens = JSON.parse(auth);
      const response = await api.get(`/crs/courses/${courseId}/learn/`, {
        headers: {
          'Authorization': `Bearer ${tokens.access}`
        }
      });

      setLearnData(response.data);
      
      // Set the first incomplete lesson as selected
      if (response.data.next_lesson) {
        setSelectedLesson(response.data.next_lesson.id);
      }
    } catch (error) {
      console.error('Error fetching learn data:', error);
      toast.error('خطا در بارگذاری اطلاعات دوره');
    } finally {
      setIsLoading(false);
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    try {
      const auth = localStorage.getItem('auth_tokens');
      if (!auth) return;

      const tokens = JSON.parse(auth);
      await api.post(`/crs/lessons/${lessonId}/progress/`, {
        mark_completed: true
      }, {
        headers: {
          'Authorization': `Bearer ${tokens.access}`
        }
      });

      toast.success('درس با موفقیت تکمیل شد');
      fetchLearnData(); // Refresh data
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      toast.error('خطا در تکمیل درس');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!learnData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">دوره یافت نشد</h2>
          <Button onClick={() => navigate('/my-courses')}>
            بازگشت به دوره‌های من
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/my-courses')}
                className="flex items-center space-x-2 space-x-reverse"
              >
                <ChevronLeft size={16} />
                <span>بازگشت</span>
              </Button>
              <div>
                <h1 className="text-lg font-semibold">{learnData.course.title}</h1>
                <p className="text-sm text-gray-600">مدرس: {learnData.course.instructor}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="text-sm text-gray-600">
                {Math.round(learnData.progress)}% تکمیل شده
              </div>
              <Progress value={learnData.progress} className="w-32" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Course Content */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-4">محتوای دوره</h3>
                <div className="space-y-4">
                  {learnData.chapters.map((chapter) => (
                    <div key={chapter.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{chapter.title}</h4>
                        <span className="text-xs text-gray-500">
                          {Math.round(chapter.progress_percentage)}%
                        </span>
                      </div>
                      <Progress value={chapter.progress_percentage} className="h-2 mb-3" />
                      
                      <div className="space-y-2">
                        {chapter.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                              selectedLesson === lesson.id
                                ? 'bg-blue-100 border border-blue-300'
                                : 'hover:bg-gray-100'
                            }`}
                            onClick={() => setSelectedLesson(lesson.id)}
                          >
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <div className="flex-shrink-0">
                                {lesson.progress?.is_completed ? (
                                  <Check size={16} className="text-green-600" />
                                ) : (
                                  <Play size={16} className="text-gray-400" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{lesson.title}</p>
                                <div className="flex items-center space-x-1 space-x-reverse text-xs text-gray-500">
                                  <Clock size={12} />
                                  <span>{lesson.duration} دقیقه</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {selectedLesson ? (
              <Card>
                <CardContent className="p-6">
                  <div className="aspect-video bg-gray-900 rounded-lg mb-6 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Play size={48} className="mx-auto mb-4" />
                      <p>ویدیو پلیر اینجا قرار می‌گیرد</p>
                      <p className="text-sm opacity-75">درس ID: {selectedLesson}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">
                        {learnData.chapters
                          .flatMap(c => c.lessons)
                          .find(l => l.id === selectedLesson)?.title}
                      </h2>
                    </div>
                    <Button
                      onClick={() => markLessonComplete(selectedLesson)}
                      className="flex items-center space-x-2 space-x-reverse"
                    >
                      <Check size={16} />
                      <span>تکمیل درس</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">یک درس انتخاب کنید</h3>
                  <p className="text-gray-600">
                    از فهرست سمت راست یک درس انتخاب کنید تا شروع به یادگیری کنید
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnPage;
