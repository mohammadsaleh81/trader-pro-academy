
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingCart, Loader, Bookmark, Clock, Calendar, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CourseDetails } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";

const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { wallet, updateWallet, enrollCourse, fetchCourseDetails, myCourses } = useData();
  const [courseData, setCourseData] = useState<CourseDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadCourseDetails = async () => {
      if (!slug) {
        navigate('/courses');
        return;
      }

      setIsLoading(true);
      try {
        const details = await fetchCourseDetails(slug);
        if (details) {
          setCourseData(details);
        } else {
          toast({
            title: "خطا",
            description: "مشکلی در دریافت اطلاعات دوره وجود دارد.",
            variant: "destructive",
          });
          navigate('/courses');
        }
      } catch (error) {
        console.error("Failed to fetch course details", error);
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

    loadCourseDetails();
  }, [slug, navigate, toast, fetchCourseDetails]);

  const handlePurchase = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!courseData || !wallet) return;

    setIsProcessing(true);

    try {
      const coursePrice = parseFloat(courseData.info.price);
      
      if (wallet.balance < coursePrice) {
        const shortfall = coursePrice - wallet.balance;
        
        toast({
          title: "موجودی ناکافی",
          description: `برای خرید این دوره نیاز به ${shortfall.toLocaleString()} تومان شارژ اضافی دارید`,
          variant: "destructive",
        });
        
        localStorage.setItem("pendingCourseId", courseData.info.id);
        navigate("/wallet");
        return;
      }

      // Create transaction record
      const newTransaction = {
        id: Date.now().toString(),
        amount: coursePrice,
        type: "purchase" as const,
        description: `خرید دوره ${courseData.info.title}`,
        date: new Date().toLocaleDateString("fa-IR"),
      };

      const updateResult = await updateWallet(wallet.balance - coursePrice);
      if (updateResult.success) {
        enrollCourse(courseData.info.id.toString());

        toast({
          title: "خرید موفق",
          description: `دوره ${courseData.info.title} با موفقیت خریداری شد`,
        });

        setTimeout(() => {
          setIsProcessing(false);
          navigate("/my-courses");
        }, 1000);
      } else {
        throw new Error(updateResult.error);
      }
    } catch (error) {
      console.error('Error processing purchase:', error);
      setIsProcessing(false);
      
      toast({
        title: "خطا",
        description: "خطا در پردازش خرید. لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      });
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!courseData) return;

    const course = {
      id: courseData.info.id.toString(),
      price: parseFloat(courseData.info.price)
    };

    if (course.price === 0) {
      enrollCourse(course.id.toString());
      navigate("/my-courses");
      return;
    }

    if (!wallet || wallet.balance < course.price) {
      const shortfall = course.price - (wallet?.balance || 0);
      
      toast({
        title: "موجودی ناکافی",
        description: `برای خرید این دوره نیاز به ${shortfall.toLocaleString()} تومان شارژ اضافی دارید`,
        variant: "destructive",
      });
      
      localStorage.setItem("pendingCourseId", course.id);
      navigate("/wallet");
      return;
    }

    const updateResult = await updateWallet(wallet.balance - course.price);
    if (updateResult.success) {
      enrollCourse(course.id.toString());

      toast({
        title: "خرید موفق",
        description: `دوره ${courseData.info.title} با موفقیت خریداری شد`,
      });

      navigate("/my-courses");
    } else {
      toast({
        title: "خطا",
        description: "خطا در پردازش خرید. لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="animate-pulse">
            <div className="h-80 bg-gray-200 mb-8"></div>
            <div className="trader-container">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <div className="h-96 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="lg:col-span-2">
                  <div className="h-96 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!courseData) {
    return (
      <Layout>
        <div className="trader-container py-8">
          <div className="text-center">اطلاعات دوره یافت نشد</div>
          <Button onClick={() => navigate("/courses")} className="mt-4 mx-auto block">
            بازگشت به لیست دوره‌ها
          </Button>
        </div>
      </Layout>
    );
  }

  const isEnrolled = myCourses.some(c => c.id === courseData.info.id);
  const coursePrice = parseFloat(courseData.info.price);
  const isFree = coursePrice === 0;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section with Course Image */}
        <div className="relative h-80 bg-gradient-to-r from-orange-500 to-orange-600 overflow-hidden">
          <div className="absolute inset-0 bg-black/30"></div>
          <img
            src={courseData.info.thumbnail}
            alt={courseData.info.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-4" dir="rtl">{courseData.info.title}</h1>
              <p className="text-xl opacity-90" dir="rtl">{courseData.info.description}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="absolute top-6 right-6 text-white hover:bg-white/20"
            onClick={() => navigate("/courses")}
          >
            <ArrowRight size={18} className="ml-2" />
            <span>بازگشت به لیست دوره‌ها</span>
          </Button>
        </div>

        {/* Main Content */}
        <div className="trader-container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Info Card - Left Side */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardContent className="p-6">
                  {/* Course Thumbnail */}
                  <div className="mb-6">
                    <img
                      src={courseData.info.thumbnail}
                      alt={courseData.info.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>

                  {/* Price */}
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-orange-600" dir="rtl">
                      {isFree ? "رایگان" : `${coursePrice.toLocaleString()} تومان`}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{courseData.info.total_lessons}</div>
                      <div className="text-sm text-gray-600">درس</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{Math.floor(courseData.info.total_duration / 60)}</div>
                      <div className="text-sm text-gray-600">ساعت</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{courseData.info.total_chapters}</div>
                      <div className="text-sm text-gray-600">سرفصل</div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mb-6">
                    {isEnrolled ? (
                      <Button
                        variant="outline"
                        className="w-full py-3"
                        onClick={() => navigate(`/learn/${courseData.info.id}`)}
                      >
                        ادامه یادگیری
                      </Button>
                    ) : (
                      <Button
                        className="w-full py-3 bg-orange-600 hover:bg-orange-700"
                        onClick={isFree ? handleEnroll : handlePurchase}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <Loader className="h-4 w-4 animate-spin mx-auto" />
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4 ml-2" />
                            {isFree ? "ثبت‌نام رایگان" : "خرید دوره"}
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="text-center text-sm text-gray-600 border-t pt-4">
                    پشتیبانی و دسترسی مادام‌العمر
                  </div>

                  {/* Course Details */}
                  <div className="mt-8 space-y-4 border-t pt-6">
                    <h3 className="font-bold text-lg text-right">اطلاعات دوره</h3>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">مدرس:</span>
                        <span className="font-medium">{courseData.info.instructor}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">سطح دوره:</span>
                        <span className="font-medium">
                          {courseData.info.level === 'beginner' ? 'مقدماتی' : 
                           courseData.info.level === 'intermediate' ? 'متوسط' : 'پیشرفته'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">تاریخ بروزرسانی:</span>
                        <span className="font-medium">{new Date(courseData.info.updated_at).toLocaleDateString('fa-IR')}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">تعداد دانشجو:</span>
                        <span className="font-medium">{courseData.info.total_students?.toLocaleString() || '0'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Course Content - Right Side */}
            <div className="lg:col-span-2">
              {/* Course Chapters */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6 text-right">محتوای دوره</h2>
                
                <div className="space-y-4">
                  {courseData.chapters.map((chapter, index) => (
                    <Card key={chapter.id} className="border border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="text-right">
                            <h3 className="text-lg font-semibold mb-2">
                              Chapter {index + 1}: {chapter.title}
                            </h3>
                            <p className="text-gray-600 text-sm">{chapter.description}</p>
                          </div>
                          <div className="text-left text-sm text-gray-500">
                            {chapter.lessons.length} جلسه
                          </div>
                        </div>
                        
                        {/* Lessons List */}
                        <div className="space-y-2">
                          {chapter.lessons.slice(0, 3).map((lesson) => (
                            <div key={lesson.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                              <div className="text-right">
                                <span className="text-sm font-medium">{lesson.title}</span>
                                {lesson.is_free_preview && (
                                  <span className="text-xs text-green-600 mr-2">(پیش‌نمایش رایگان)</span>
                                )}
                              </div>
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock size={12} className="ml-1" />
                                {lesson.duration} دقیقه
                              </div>
                            </div>
                          ))}
                          
                          {chapter.lessons.length > 3 && (
                            <div className="text-center text-sm text-gray-500 py-2">
                              و {chapter.lessons.length - 3} درس دیگر...
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Comments Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6 text-right">نظرات دانشجویان</h2>
                
                <div className="space-y-4">
                  {courseData.comments.slice(0, 5).map((comment) => (
                    <Card key={comment.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="text-right">
                            <span className="font-medium">
                              {comment.user.first_name} {comment.user.last_name}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {comment.created_at}
                          </div>
                        </div>
                        <p className="text-gray-700 text-right">{comment.content}</p>
                        
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-3 mr-6 space-y-2">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="bg-gray-50 p-3 rounded">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-sm font-medium">
                                    {reply.user.first_name} {reply.user.last_name}
                                  </span>
                                  <span className="text-xs text-gray-500">{reply.created_at}</span>
                                </div>
                                <p className="text-sm text-gray-700 text-right">{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CourseDetailPage;
