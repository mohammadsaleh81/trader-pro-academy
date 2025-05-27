import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Star, Bookmark, BookmarkCheck, Clock, BarChart, User, FileText, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/axios";
import { TOKEN_STORAGE_KEY } from "@/lib/config";

interface CourseInfo {
  id: number;  // API returns number
  slug: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  thumbnail: string;
  total_duration: number;
  total_lessons: number;
  total_chapters: number;
  average_rating: number;
  total_students: number;
  language: string;
  level: "beginner" | "intermediate" | "advanced" | string;
  prerequisites: string[];
  what_you_will_learn: string[];
  certificate: boolean;
  created_at: string;
  updated_at: string;
  status: string;
  tags: string[];
  progress?: {
    completed_lessons: number;
    total_lessons: number;
    completed_duration: number;
    total_duration: number;
    progress_percentage: number;
    last_watched_lesson: null | number;
    certificate_eligible: boolean;
  };
  reviews?: {
    total_reviews: number;
    average_rating: number;
    rating_distribution: {
      [key: string]: number;
    };
  };
}

interface Lesson {
  id: number;
  chapter: number;
  title: string;
  content: string;
  content_type: string;
  video_url: string;
  duration: number;
  order: number;
  is_free_preview: boolean;
  points: number;
  progress: null | {
    is_completed: boolean;
    watched_duration: number;
    last_watched_at: string | null;
    notes: any[];
    bookmarks: any[];
  };
  resources?: {
    id: number;
    title: string;
    type: string;
    url: string;
    size: string;
  }[];
}

interface Chapter {
  id: number;
  course: number;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  total_duration: number;
}

interface Comment {
  id: number;
  user: {
    id: number;
    username: string | null;
    email: string;
    first_name: string;
    last_name: string;
    thumbnail: string;
  };
  content: string;
  replies: Comment[];
  created_at: string;
}

interface CourseData {
  info: CourseInfo;
  chapters: Chapter[];
  comments: Comment[];
  user_progress?: {
    enrollment: {
      next_lesson: {
        id: number;
        title: string;
        chapter: string;
      } | null;
    };
    course_progress: {
      completion_percentage: number;
      completed_lessons: number;
      total_lessons: number;
      watched_duration: number;
      total_duration: number;
      in_progress_lessons: number;
    };
    chapter_progress: Array<{
      id: number;
      title: string;
      order: number;
      progress_percentage: number;
    }>;
  };
}

const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { myCourses, bookmarks, addBookmark, removeBookmark, enrollCourse, wallet, updateWallet } = useData();
  const { user } = useAuth();
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(5);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [shortfall, setShortfall] = useState(0);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        
        // Get tokens from localStorage
        const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
        const tokens = stored ? JSON.parse(stored) : null;
        
        // Make the API call with or without token
        const response = await api.get(
          `/crs/courses/${slug}/?include_comments=true&include_chapters=true`,
          tokens?.access ? {
            headers: {
              'Authorization': `Bearer ${tokens.access}`
            }
          } : undefined
        );
        
        setCourseData(response.data);
        setError(null);
      } catch (err: any) {
        setError("خطا در دریافت اطلاعات دوره");
        console.error("Error fetching course details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCourseDetails();
    }
  }, [slug]);

  // Check for pending course purchase after wallet recharge
  useEffect(() => {
    const pendingCourseId = localStorage.getItem("pendingCourseId");
    
    if (pendingCourseId && courseData?.info && user && wallet) {
      const storedId = parseInt(pendingCourseId);
      if (!isNaN(storedId) && storedId === courseData.info.id) {
        if (wallet.balance >= (courseData.info.price || 0)) {
          const newTransaction = {
            id: Date.now().toString(),
            amount: courseData.info.price,
            type: "purchase" as const,
            description: `خرید دوره ${courseData.info.title}`,
            date: new Date().toLocaleDateString("fa-IR"),
          };

          updateWallet(wallet.balance - courseData.info.price, [...wallet.transactions, newTransaction]);
          enrollCourse(courseData.info.id.toString(), user.id);

          toast({
            title: "خرید موفق",
            description: `دوره ${courseData.info.title} با موفقیت خریداری شد`,
          });
          
          localStorage.removeItem("pendingCourseId");
          navigate("/my-courses");
        }
      }
    }
  }, [courseData, user, wallet, enrollCourse, updateWallet, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="trader-container py-12 text-center">
          <h2 className="text-xl font-bold mb-4">در حال بارگذاری...</h2>
        </div>
      </Layout>
    );
  }

  if (error || !courseData) {
    return (
      <Layout>
        <div className="trader-container py-12 text-center">
          <h2 className="text-xl font-bold mb-4">{error || "دوره مورد نظر یافت نشد"}</h2>
        </div>
      </Layout>
    );
  }

  const { info: course, chapters, comments: courseComments } = courseData;
  const isEnrolled = courseData.user_progress?.enrollment || myCourses.some(c => String(c.id) === String(course.id));
  
  const bookmark = user && bookmarks.find(
    b => String(b.itemId) === String(course.id) && b.itemType === "course" && b.userId === user.id
  );

  const handleToggleBookmark = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (bookmark) {
      removeBookmark(bookmark.id);
    } else {
      addBookmark(course.id.toString(), "course", user.id);
    }
  };

  const handlePurchase = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (isEnrolled) {
      // If enrolled, navigate to the learning page or next lesson
      if (courseData.user_progress?.enrollment.next_lesson) {
        navigate(`/learn/${slug}/lesson/${courseData.user_progress.enrollment.next_lesson.id}`);
      } else {
        navigate(`/learn/${slug}`);
      }
      return;
    }

    if (course.price === 0) {
      // Free course
      enrollCourse(course.id.toString(), user.id);
      navigate("/my-courses");
      return;
    }

    if (!wallet || wallet.balance < course.price) {
      // Calculate how much more money is needed
      const calculatedShortfall = course.price - (wallet?.balance || 0);
      setShortfall(calculatedShortfall);
      
      // Store course ID in localStorage to complete purchase after recharge
      localStorage.setItem("pendingCourseId", course.id.toString());
      
      // Open purchase dialog with recharge option
      setIsPurchaseDialogOpen(true);
      return;
    }

    // Sufficient balance, open regular purchase dialog
    setIsPurchaseDialogOpen(true);
  };

  const handleConfirmPurchase = () => {
    if (!user || !course || !wallet) return;

    // If balance is insufficient, redirect to wallet page
    if (wallet.balance < course.price) {
      setIsPurchaseDialogOpen(false);
      navigate("/wallet");
      return;
    }

    // Process purchase
    const newTransaction = {
      id: Date.now().toString(),
      amount: course.price,
      type: "purchase" as const,
      description: `خرید دوره ${course.title}`,
      date: new Date().toLocaleDateString("fa-IR"),
    };

    updateWallet(wallet.balance - course.price, [...wallet.transactions, newTransaction]);
    enrollCourse(course.id.toString(), user.id);

    toast({
      title: "خرید موفق",
      description: `دوره ${course.title} با موفقیت خریداری شد`,
    });

    setIsPurchaseDialogOpen(false);
    navigate("/my-courses");
  };

  const handleRechargeWallet = () => {
    localStorage.setItem("pendingCourseId", String(course.id));
    setIsPurchaseDialogOpen(false);
    navigate("/wallet");
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (commentText.trim()) {
      // Implementation of adding comment
    }
  };

  const getPurchaseButtonText = () => {
    if (isEnrolled) {
      return "ادامه یادگیری";
    }

    if (course.price === 0) {
      return "ثبت‌نام رایگان در دوره";
    }

    return "خرید دوره";
  };

  return (
    <Layout>
      {/* Hero Banner */}
      <div className="w-full h-96 bg-gradient-to-r from-amber-800 to-amber-600 overflow-hidden relative">
        <img
          src={course.thumbnail || "/placeholder-course.jpg"}
          alt={course.title}
          className="w-full h-full object-cover opacity-25 absolute inset-0"
        />
        <div className="trader-container h-full flex flex-col justify-center items-start relative z-10 py-8 px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl">
            {course.tags && course.tags.length > 0 && (
              <h5 className="text-white text-xl mb-2">
                {course.tags[0]}
              </h5>
            )}
            <h1 className="text-white text-4xl md:text-5xl font-bold mb-4">
              {course.title}
            </h1>
            <p className="text-white/90 text-lg mb-6 line-clamp-2">
              {course.description}
            </p>
            <div className="flex items-center gap-6 text-white/90">
              <div className="flex items-center gap-1">
                <User className="h-5 w-5" />
                <span>{course.instructor}</span>
              </div>
              {course.reviews && (
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-300" />
                  <span>{course.reviews.average_rating} (از {course.reviews.total_reviews} نظر)</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-5 w-5" />
                <span>{course.total_duration} دقیقه</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {courseData.user_progress && (
        <div className="trader-container py-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">پیشرفت دوره</h3>
              {courseData.user_progress.enrollment.next_lesson && (
                <Button
                  onClick={() => navigate(`/learn/${slug}/lesson/${courseData.user_progress?.enrollment.next_lesson.id}`)}
                  className="bg-trader-500 hover:bg-trader-600"
                >
                  ادامه یادگیری
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">پیشرفت کلی</p>
                <p className="text-2xl font-bold text-orange-600">
                  {courseData.user_progress.course_progress.completion_percentage.toFixed(1)}%
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">درس‌های تکمیل شده</p>
                <p className="text-2xl font-bold text-orange-600">
                  {courseData.user_progress.course_progress.completed_lessons} از {courseData.user_progress.course_progress.total_lessons}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">زمان مشاهده شده</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.round(courseData.user_progress.course_progress.watched_duration / 60)} از {Math.round(courseData.user_progress.course_progress.total_duration / 60)} ساعت
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">درس‌های در حال انجام</p>
                <p className="text-2xl font-bold text-orange-600">
                  {courseData.user_progress.course_progress.in_progress_lessons}
                </p>
              </div>
            </div>

            {courseData.user_progress.enrollment.next_lesson && (
              <div className="border rounded-lg p-4 mb-6">
                <h4 className="font-medium mb-2">درس بعدی:</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{courseData.user_progress.enrollment.next_lesson.chapter}</p>
                    <p className="font-medium">{courseData.user_progress.enrollment.next_lesson.title}</p>
                  </div>
                  <Button
                    onClick={() => navigate(`/learn/${slug}/lesson/${courseData.user_progress?.enrollment.next_lesson.id}`)}
                    variant="outline"
                  >
                    شروع
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="trader-container py-8 px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="content">محتوای دوره</TabsTrigger>
                <TabsTrigger value="about">درباره دوره</TabsTrigger>
                <TabsTrigger value="comments">نظرات کاربران</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="border rounded-xl p-5">
                <h2 className="text-xl font-bold mb-4">سرفصل‌ها</h2>
                <Accordion type="single" collapsible className="w-full">
                  {chapters.map((chapter) => (
                    <AccordionItem key={chapter.id} value={`section-${chapter.id}`}>
                      <AccordionTrigger className="text-right">
                        <div className="flex w-full justify-between items-center">
                          <div className="flex items-center gap-4">
                            <span>{chapter.title}</span>
                            {courseData.user_progress && (
                              <div className="text-sm text-gray-500">
                                {courseData.user_progress.chapter_progress.find(cp => cp.id === chapter.id)?.progress_percentage.toFixed(1)}%
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">{chapter.lessons.length} جلسه</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-3">
                          {chapter.lessons.map((lesson) => (
                            <li 
                              key={lesson.id}
                              className={`flex justify-between items-center p-2 rounded-lg ${
                                lesson.progress?.is_completed ? 'bg-green-50' : 
                                !lesson.is_free_preview && !isEnrolled ? 'bg-gray-50' : 'bg-white'
                              }`}
                            >
                              <div className="flex items-center">
                                {lesson.progress?.is_completed ? (
                                  <div className="h-5 w-5 rounded-full bg-green-500 text-white flex items-center justify-center mr-2">✓</div>
                                ) : !lesson.is_free_preview && !isEnrolled ? (
                                  <div className="h-5 w-5 rounded-full bg-gray-300 flex items-center justify-center mr-2">🔒</div>
                                ) : (
                                  <div className="h-5 w-5 rounded-full border border-gray-300 mr-2"></div>
                                )}
                                <span className={!lesson.is_free_preview && !isEnrolled ? "text-gray-400" : ""}>
                                  {lesson.title}
                                </span>
                              </div>
                              <span className="text-sm text-gray-500">{lesson.duration} دقیقه</span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>

              <TabsContent value="about" className="border rounded-xl p-5">
                <h2 className="text-xl font-bold mb-4">درباره دوره</h2>
                <div className="prose max-w-none">
                  <p className="mb-6 leading-7 text-gray-700">{course.description}</p>
                </div>  

                

                
              </TabsContent>

              <TabsContent value="comments" className="border rounded-xl p-5">
                <h2 className="text-xl font-bold mb-4">نظرات کاربران</h2>
                
                {courseComments.length > 0 ? (
                  <div className="space-y-6">
                    {courseComments.map((comment) => (
                      <div key={comment.id} className="border-b pb-6">
                        <div className="flex items-center mb-2">
                          <div className="w-10 h-10 rounded-full overflow-hidden ml-3">
                            <img
                              src={comment.user.thumbnail}
                              alt={`${comment.user.first_name} ${comment.user.last_name}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium">
                              {comment.user.first_name} {comment.user.last_name}
                            </p>
                            <p className="text-gray-500 text-sm">
                              {comment.created_at}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                        
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-4 mr-8 space-y-4">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="border-r pr-4">
                                <div className="flex items-center mb-2">
                                  <div className="w-8 h-8 rounded-full overflow-hidden ml-3">
                                    <img
                                      src={reply.user.thumbnail}
                                      alt={`${reply.user.first_name} ${reply.user.last_name}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      {reply.user.first_name} {reply.user.last_name}
                                    </p>
                                    <p className="text-gray-500 text-sm">
                                      {reply.created_at}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-gray-700">{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    هنوز نظری برای این دوره ثبت نشده است.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <img 
                  src={course.thumbnail || "/placeholder-course.jpg"}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                
                {!isEnrolled && (
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <span className="font-bold text-lg">
                          {typeof course.price === 'number' 
                            ? course.price === 0 
                              ? "رایگان" 
                              : `${course.price.toLocaleString()} تومان`
                            : "قیمت نامشخص"}
                        </span>
                      </div>
                      <button
                        onClick={handleToggleBookmark}
                        className="text-trader-500"
                      >
                        {bookmark ? (
                          <BookmarkCheck className="h-5 w-5" />
                        ) : (
                          <Bookmark className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-center mb-4">
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <p className="text-xl font-bold text-orange-500">{course.total_chapters}</p>
                        <p className="text-gray-600 text-xs">سرفصل</p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <p className="text-xl font-bold text-orange-500">{course.total_lessons}</p>
                        <p className="text-gray-600 text-xs">درس</p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <p className="text-xl font-bold text-orange-500">{Math.round(course.total_duration / 60)}</p>
                        <p className="text-gray-600 text-xs">ساعت</p>
                      </div>
                    </div>
                    
                    <Button
                      className={`w-full py-3 mb-4 flex items-center justify-center ${
                        isEnrolled ? 'bg-green-600 hover:bg-green-700' : 'bg-trader-500 hover:bg-trader-600'
                      }`}
                      onClick={handlePurchase}
                    >
                      {!isEnrolled && <ShoppingCart className="ml-2 h-5 w-5" />}
                      {getPurchaseButtonText()}
                    </Button>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-500">
                        پشتیبانی و دسترسی مادام العمر
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-5 mt-4">
                <h3 className="text-lg font-bold mb-3">اطلاعات دوره</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">مدرس:</span>
                    <span>{course.instructor}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">سطح دوره:</span>
                    <span>
                      {course.level === "beginner" ? "مقدماتی" :
                       course.level === "intermediate" ? "متوسط" :
                       course.level === "advanced" ? "پیشرفته" : "نامشخص"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">تاریخ بروزرسانی:</span>
                    <span>{new Date(course.updated_at).toLocaleDateString("fa-IR")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">تعداد دانشجو:</span>
                    <span>{course.total_students?.toLocaleString() || 0} نفر</span>
                  </div>
                  {course.certificate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">گواهی:</span>
                      <span>دارد</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تأیید خرید دوره</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-4">
              <h3 className="text-lg font-bold mb-2">{course.title}</h3>
              <p className="text-gray-600">{course.instructor}</p>
            </div>
            
            <div className="flex justify-between items-center border-t border-b py-3 my-4">
              <span className="font-medium">قیمت دوره:</span>
              <span className="font-bold text-trader-500">
                {typeof course.price === 'number' 
                  ? `${course.price.toLocaleString()} تومان`
                  : "قیمت نامشخص"}
              </span>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">مبلغ از کیف پول شما کسر خواهد شد.</p>
              <p className="text-sm font-medium mt-2">
                موجودی کیف پول: <span className="font-bold">{wallet?.balance.toLocaleString()} تومان</span>
              </p>
              
              {wallet && course.price > 0 && wallet.balance < course.price && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-md">
                  <p className="text-red-600 font-medium">موجودی کیف پول شما کافی نیست.</p>
                  <p className="text-sm text-red-500 mt-1">
                    برای خرید این دوره نیاز به افزایش موجودی به مبلغ <span className="font-bold">{shortfall.toLocaleString()} تومان</span> دارید.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between gap-2">
            <Button type="button" variant="outline" onClick={() => setIsPurchaseDialogOpen(false)}>
              انصراف
            </Button>
            {wallet && course.price > 0 && wallet.balance < course.price ? (
              <Button 
                type="button"
                onClick={handleRechargeWallet}
                className="bg-green-600 hover:bg-green-700"
              >
                افزایش موجودی
              </Button>
            ) : (
              <Button 
                type="button"
                onClick={handleConfirmPurchase}
              >
                تأیید و پرداخت
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default CourseDetailPage;
