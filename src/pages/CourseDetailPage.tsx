
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CourseDetails } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import CourseHero from "@/components/course/CourseHero";
import CourseInfoCard from "@/components/course/CourseInfoCard";
import CourseContent from "@/components/course/CourseContent";

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

    const coursePrice = parseFloat(courseData.info.price);

    if (coursePrice === 0) {
      enrollCourse(courseData.info.id.toString());
      navigate("/my-courses");
      return;
    }

    if (!wallet || wallet.balance < coursePrice) {
      const shortfall = coursePrice - (wallet?.balance || 0);
      
      toast({
        title: "موجودی ناکافی",
        description: `برای خرید این دوره نیاز به ${shortfall.toLocaleString()} تومان شارژ اضافی دارید`,
        variant: "destructive",
      });
      
      localStorage.setItem("pendingCourseId", courseData.info.id);
      navigate("/wallet");
      return;
    }

    const updateResult = await updateWallet(wallet.balance - coursePrice);
    if (updateResult.success) {
      enrollCourse(courseData.info.id.toString());

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
                <div className="lg:col-span-2">
                  <div className="h-96 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="lg:col-span-1">
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
        <CourseHero courseData={courseData} />

        <div className="trader-container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Left Side */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-3" dir="rtl">
                  <TabsTrigger value="content">محتوای دوره</TabsTrigger>
                  <TabsTrigger value="info">اطلاعات دوره</TabsTrigger>
                  <TabsTrigger value="comments">نظرات</TabsTrigger>
                </TabsList>
                
                <TabsContent value="content" className="mt-6">
                  <CourseContent courseData={courseData} />
                </TabsContent>
                
                <TabsContent value="info" className="mt-6">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="text-2xl font-bold mb-6 text-right">درباره دوره</h2>
                    <div className="prose prose-lg max-w-none text-right" dir="rtl">
                      <p className="text-gray-700 leading-relaxed mb-6">
                        {courseData.info.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center py-3 border-b">
                            <span className="text-gray-600">مدرس:</span>
                            <span className="font-medium">{courseData.info.instructor}</span>
                          </div>
                          
                          <div className="flex justify-between items-center py-3 border-b">
                            <span className="text-gray-600">سطح دوره:</span>
                            <span className="font-medium">
                              {courseData.info.level === 'beginner' ? 'مقدماتی' : 
                               courseData.info.level === 'intermediate' ? 'متوسط' : 'پیشرفته'}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center py-3 border-b">
                            <span className="text-gray-600">زبان دوره:</span>
                            <span className="font-medium">{courseData.info.language === 'fa' ? 'فارسی' : 'انگلیسی'}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between items-center py-3 border-b">
                            <span className="text-gray-600">تعداد فصل:</span>
                            <span className="font-medium">{courseData.info.total_chapters}</span>
                          </div>
                          
                          <div className="flex justify-between items-center py-3 border-b">
                            <span className="text-gray-600">تعداد درس:</span>
                            <span className="font-medium">{courseData.info.total_lessons}</span>
                          </div>
                          
                          <div className="flex justify-between items-center py-3 border-b">
                            <span className="text-gray-600">مدت زمان:</span>
                            <span className="font-medium">{Math.floor(courseData.info.total_duration / 60)} ساعت</span>
                          </div>
                        </div>
                      </div>
                      
                      {courseData.info.tags && courseData.info.tags.length > 0 && (
                        <div className="mt-8">
                          <h3 className="text-lg font-semibold mb-4">برچسب‌ها</h3>
                          <div className="flex flex-wrap gap-2">
                            {courseData.info.tags.map((tag, index) => (
                              <span key={index} className="bg-orange-100 text-orange-800 text-sm px-3 py-1 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="comments" className="mt-6">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="text-2xl font-bold mb-6 text-right">نظرات دانشجویان</h2>
                    
                    {courseData.comments && courseData.comments.length > 0 ? (
                      <div className="space-y-6">
                        {courseData.comments.map((comment) => (
                          <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
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
                            <p className="text-gray-700 text-right leading-relaxed">{comment.content}</p>
                            
                            {comment.replies && comment.replies.length > 0 && (
                              <div className="mt-4 mr-6 space-y-3">
                                {comment.replies.map((reply) => (
                                  <div key={reply.id} className="bg-gray-50 p-3 rounded-lg">
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
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        هنوز نظری برای این دوره ثبت نشده است
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Course Info Card - Right Side */}
            <div className="lg:col-span-1">
              <CourseInfoCard
                courseData={courseData}
                isEnrolled={isEnrolled}
                isProcessing={isProcessing}
                isFree={isFree}
                coursePrice={coursePrice}
                onPurchase={handlePurchase}
                onEnroll={handleEnroll}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CourseDetailPage;
