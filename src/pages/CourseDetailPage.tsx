import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { useWallet } from "@/contexts/WalletContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CourseDetails } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCourse } from "@/contexts/CourseContext";
import CourseHero from "@/components/course/CourseHero";
import CourseInfoCard from "@/components/course/CourseInfoCard";
import CourseContent from "@/components/course/CourseContent";
import CourseMobileActions from "@/components/course/CourseMobileActions";
import CommentSection from "@/components/comments/CommentSection";
import { CheckCircle, Clock, Users, Star, Wallet, ShoppingCart } from "lucide-react";
import api from "@/lib/axios";
import { clearPendingCourse } from '@/lib/cache';
import { debugPurchase } from '@/lib/purchase-debug';
import { DEFAULT_IMAGES } from '@/lib/config';
import { useIsMobile } from "@/hooks/use-mobile";

const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { wallet } = useData();
  const { refetchWallet } = useWallet();
  const { enrollCourse, fetchCourseDetails, refreshCourseDetails } = useCourse();
  const [courseData, setCourseData] = useState<CourseDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(false);
  const isMobile = useIsMobile();

  // Helper function for formatting currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fa-IR').format(amount);
  };

  const formatCurrencyWithUnit = (amount: number): string => {
    return `${formatCurrency(amount)} تومان`;
  };

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

  const handlePurchaseConfirm = async () => {
    setShowPurchaseConfirm(false);
    
    debugPurchase.log('Starting confirmed purchase process', { courseId: courseData?.info.id, slug });
    
    if (!user) {
      debugPurchase.warn('User not authenticated, redirecting to login');
      navigate("/login");
      return;
    }

    if (!courseData || !slug) {
      debugPurchase.error('Missing course data or slug');
      return;
    }

    setIsProcessing(true);

    try {
      const coursePrice = parseFloat(courseData.info.price);
      debugPurchase.trackWalletBalance(wallet, coursePrice);
      
      if (wallet && wallet.balance < coursePrice) {
        const shortfall = coursePrice - wallet.balance;
        
        debugPurchase.warn('Insufficient wallet balance', { 
          balance: wallet.balance, 
          required: coursePrice, 
          shortfall 
        });
        
        toast({
          title: "موجودی ناکافی",
          description: `برای خرید این دوره نیاز به ${shortfall.toLocaleString()} تومان شارژ اضافی دارید`,
          variant: "destructive",
        });
        
        localStorage.setItem("pendingCourseId", courseData.info.id.toString());
        debugPurchase.log('Saved pending course ID', courseData.info.id.toString());
        navigate("/wallet");
        return;
      }

      const enrollmentData = { course_id: parseInt(courseData.info.id) };
      debugPurchase.trackApiCall(`/crs/courses/${slug}/enroll/`, 'POST', enrollmentData);
      
      const enrollResponse = await api.post(`/crs/courses/${slug}/enroll/`, enrollmentData);
      
      debugPurchase.trackApiResponse(`/crs/courses/${slug}/enroll/`, enrollResponse.status, enrollResponse.data);

      if (enrollResponse.status === 201) {
        clearPendingCourse();
        debugPurchase.success('Purchase completed successfully');
        
        enrollCourse(courseData.info.id.toString());

        toast({
          title: "خرید موفق",
          description: `دوره ${courseData.info.title} با موفقیت خریداری شد`,
        });

        const updatedDetails = await refreshCourseDetails(slug);
        if (updatedDetails) {
          setCourseData(updatedDetails);
        }

        refetchWallet();

        setIsProcessing(false);
      }
    } catch (error: any) {
      debugPurchase.error('Purchase failed', error);
      console.error('Error processing purchase:', error);
      setIsProcessing(false);
      
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        let errorMsg = "خطا در پردازش خرید";
        
        if (errorData?.course_id?.[0]) {
          errorMsg = errorData.course_id[0];
        } else if (errorData?.non_field_errors?.[0]) {
          errorMsg = errorData.non_field_errors[0];
        } else if (errorData?.detail) {
          errorMsg = errorData.detail;
        } else if (errorData?.message) {
          errorMsg = errorData.message;
        }
        
        toast({
          title: "خطا در ثبت‌نام",
          description: errorMsg,
          variant: "destructive",
        });
      } else if (error.response?.status === 402) {
        toast({
          title: "موجودی ناکافی",
          description: "موجودی کیف پول شما برای خرید این دوره کافی نیست",
          variant: "destructive",
        });
        localStorage.setItem("pendingCourseId", courseData.info.id.toString());
        navigate("/wallet");
      } else if (error.response?.status === 409) {
        toast({
          title: "خطا",
          description: "شما قبلاً در این دوره ثبت‌نام کرده‌اید",
          variant: "destructive",
        });
      } else {
        toast({
          title: "خطا",
          description: "خطا در پردازش خرید. لطفاً دوباره تلاش کنید.",
          variant: "destructive",
        });
      }
    }
  };

  const handlePurchase = async () => {
    debugPurchase.log('Purchase button clicked', { courseId: courseData?.info.id, slug });
    
    if (!user) {
      debugPurchase.warn('User not authenticated, redirecting to login');
      navigate("/login");
      return;
    }

    if (!courseData || !slug) {
      debugPurchase.error('Missing course data or slug');
      return;
    }

    const coursePrice = parseFloat(courseData.info.price);
    
    if (wallet && wallet.balance < coursePrice) {
      const shortfall = coursePrice - wallet.balance;
      
      toast({
        title: "موجودی ناکافی",
        description: `برای خرید این دوره نیاز به ${shortfall.toLocaleString()} تومان شارژ اضافی دارید`,
        variant: "destructive",
      });
      
      localStorage.setItem("pendingCourseId", courseData.info.id.toString());
      navigate("/wallet");
      return;
    }

    setShowPurchaseConfirm(true);
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!courseData || !slug) return;

    const coursePrice = parseFloat(courseData.info.price);

    if (coursePrice === 0) {
      setIsProcessing(true);
      try {
        const enrollResponse = await api.post(`/crs/courses/${slug}/enroll/`, {
          course_id: parseInt(courseData.info.id)
        });

        if (enrollResponse.status === 201) {
          clearPendingCourse();
          
          enrollCourse(courseData.info.id.toString());
          
          toast({
            title: "ثبت‌نام موفق",
            description: `شما با موفقیت در دوره ${courseData.info.title} ثبت‌نام شدید`,
          });

          const updatedDetails = await refreshCourseDetails(slug);
          if (updatedDetails) {
            setCourseData(updatedDetails);
          }
        }
      } catch (error: any) {
        console.error('Error processing free enrollment:', error);
        
        if (error.response?.status === 400) {
          const errorData = error.response.data;
          let errorMsg = "خطا در ثبت‌نام";
          
          if (errorData?.course_id?.[0]) {
            errorMsg = errorData.course_id[0];
          } else if (errorData?.non_field_errors?.[0]) {
            errorMsg = errorData.non_field_errors[0];
          } else if (errorData?.detail) {
            errorMsg = errorData.detail;
          } else if (errorData?.message) {
            errorMsg = errorData.message;
          }
          
          toast({
            title: "خطا در ثبت‌نام",
            description: errorMsg,
            variant: "destructive",
          });
        } else if (error.response?.status === 409) {
          toast({
            title: "خطا",
            description: "شما قبلاً در این دوره ثبت‌نام کرده‌اید",
            variant: "destructive",
          });
        } else {
          toast({
            title: "خطا",
            description: "خطا در پردازش ثبت‌نام. لطفاً دوباره تلاش کنید.",
            variant: "destructive",
          });
        }
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    handlePurchase();
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="animate-pulse">
            <div className={`${isMobile ? 'h-48' : 'h-80'} bg-gray-200 mb-8`}></div>
            <div className="trader-container">
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'} gap-8`}>
                <div className={isMobile ? '' : 'lg:col-span-2'}>
                  <div className="h-96 bg-gray-200 rounded-lg"></div>
                </div>
                {!isMobile && (
                  <div className="lg:col-span-1">
                    <div className="h-96 bg-gray-200 rounded-lg"></div>
                  </div>
                )}
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

  const isEnrolled = courseData.info.is_enrolled || (courseData.user_progress !== undefined && courseData.user_progress !== null);
  const coursePrice = parseFloat(courseData.info.price);
  const isFree = coursePrice === 0;

  return (
    <Layout>
      <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
        <CourseHero courseData={courseData} />

        <div className={`trader-container ${isMobile ? 'py-4 px-3' : 'py-8'}`}>
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'} gap-8`}>
            {/* Main Content */}
            <div className={isMobile ? '' : 'lg:col-span-2'}>
              <Tabs defaultValue="content" className="w-full">
                <TabsList className={`grid w-full grid-cols-4 ${isMobile ? 'text-xs' : ''}`} dir="rtl">
                  <TabsTrigger value="content" className={isMobile ? 'text-xs px-2' : ''}>محتوا</TabsTrigger>
                  <TabsTrigger value="info" className={isMobile ? 'text-xs px-2' : ''}>اطلاعات</TabsTrigger>
                  <TabsTrigger value="comments" className={isMobile ? 'text-xs px-2' : ''}>نظرات</TabsTrigger>
                  <TabsTrigger value="reviews" className={isMobile ? 'text-xs px-2' : ''}>بازخورد</TabsTrigger>
                </TabsList>
                
                <TabsContent value="content" className={`${isMobile ? 'mt-3' : 'mt-6'}`}>
                  <CourseContent courseData={courseData} />
                </TabsContent>
                
                <TabsContent value="info" className={`${isMobile ? 'mt-3' : 'mt-6'}`}>
                  <div className={`bg-white rounded-lg shadow-sm ${isMobile ? 'p-3' : 'p-6'}`}>
                    <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold mb-6 text-right`}>درباره دوره</h2>
                    
                    {/* Course Highlights */}
                    <div className={`grid ${isMobile ? 'grid-cols-2 gap-2 mb-4' : 'grid-cols-2 md:grid-cols-4 gap-4 mb-8'}`}>
                      <div className={`bg-orange-50 rounded-lg ${isMobile ? 'p-2' : 'p-4'} text-center`}>
                        <Clock className={`${isMobile ? 'h-5 w-5' : 'h-8 w-8'} text-orange-600 mx-auto mb-2`} />
                        <div className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold text-orange-600`}>
                          {Math.floor(courseData.info.total_duration / 60)}
                        </div>
                        <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>دقیقه ویدیو</div>
                      </div>
                      
                      <div className={`bg-blue-50 rounded-lg ${isMobile ? 'p-2' : 'p-4'} text-center`}>
                        <Users className={`${isMobile ? 'h-5 w-5' : 'h-8 w-8'} text-blue-600 mx-auto mb-2`} />
                        <div className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold text-blue-600`}>
                          {courseData.info.total_students}
                        </div>
                        <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>دانشجو</div>
                      </div>
                      
                      <div className={`bg-green-50 rounded-lg ${isMobile ? 'p-2' : 'p-4'} text-center`}>
                        <CheckCircle className={`${isMobile ? 'h-5 w-5' : 'h-8 w-8'} text-green-600 mx-auto mb-2`} />
                        <div className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold text-green-600`}>
                          {courseData.info.total_lessons}
                        </div>
                        <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>درس</div>
                      </div>
                      
                      <div className={`bg-purple-50 rounded-lg ${isMobile ? 'p-2' : 'p-4'} text-center`}>
                        <Star className={`${isMobile ? 'h-5 w-5' : 'h-8 w-8'} text-purple-600 mx-auto mb-2`} />
                        <div className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold text-purple-600`}>
                          {courseData.info.average_rating ? courseData.info.average_rating.toFixed(1) : '0.0'}
                        </div>
                        <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>امتیاز</div>
                      </div>
                    </div>

                    <div className={`prose ${isMobile ? 'prose-sm' : 'prose-lg'} max-w-none text-right`} dir="rtl">
                      <p className={`text-gray-700 leading-relaxed ${isMobile ? 'mb-4 text-sm' : 'mb-6'}`}>
                        {courseData.info.description}
                      </p>
                      
                      <div className={`grid grid-cols-1 ${isMobile ? 'gap-3 mt-4' : 'md:grid-cols-2 gap-6 mt-8'}`}>
                        <div className="space-y-4">
                          <div className={`flex justify-between items-center ${isMobile ? 'py-2' : 'py-3'} border-b`}>
                            <span className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>مدرس:</span>
                            <span className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{courseData.info.instructor}</span>
                          </div>
                          
                          <div className={`flex justify-between items-center ${isMobile ? 'py-2' : 'py-3'} border-b`}>
                            <span className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>سطح دوره:</span>
                            <span className={`font-medium ${isMobile ? 'text-sm' : ''}`}>
                              {courseData.info.level === 'beginner' ? 'مقدماتی' : 
                               courseData.info.level === 'intermediate' ? 'متوسط' : 
                               courseData.info.level === 'advanced' ? 'پیشرفته' : courseData.info.level}
                            </span>
                          </div>
                          
                          <div className={`flex justify-between items-center ${isMobile ? 'py-2' : 'py-3'} border-b`}>
                            <span className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>زبان دوره:</span>
                            <span className={`font-medium ${isMobile ? 'text-sm' : ''}`}>
                              {courseData.info.language === 'fa' ? 'فارسی' : 'انگلیسی'}
                            </span>
                          </div>
                        </div>
                        
                        {!isMobile && (
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
                              <span className="font-medium">{Math.floor(courseData.info.total_duration / 60)} دقیقه</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {courseData.info.tags && courseData.info.tags.length > 0 && (
                        <div className={isMobile ? 'mt-4' : 'mt-8'}>
                          <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold mb-4`}>برچسب‌ها</h3>
                          <div className="flex flex-wrap gap-2">
                            {courseData.info.tags.map((tag, index) => (
                              <span key={index} className={`bg-orange-100 text-orange-800 ${isMobile ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1'} rounded-full`}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="comments" className={`${isMobile ? 'mt-3' : 'mt-6'}`}>
                  <div className={`bg-white rounded-lg shadow-sm ${isMobile ? 'p-3' : 'p-6'}`}>
                    <CommentSection
                      contentType="course"
                      contentId={courseData.info.id.toString()}
                      comments={courseData.comments}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="reviews" className={`${isMobile ? 'mt-3' : 'mt-6'}`}>
                  <div className={`bg-white rounded-lg shadow-sm ${isMobile ? 'p-3' : 'p-6'}`}>
                    <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold mb-6 text-right`}>بازخوردهای دانشجویان</h2>
                    
                    {courseData.comments && courseData.comments.length > 0 ? (
                      <div className="space-y-6">
                        {courseData.comments.map((comment) => (
                          <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                            <div className={`flex justify-between items-start ${isMobile ? 'mb-2' : 'mb-3'}`}>
                              <div className="text-right flex items-center">
                                <img 
                                  src={comment.user.thumbnail || DEFAULT_IMAGES.USER_AVATAR} 
                                  alt={`${comment.user.first_name} ${comment.user.last_name}`}
                                  className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} rounded-full ml-3`}
                                />
                                <span className={`font-medium ${isMobile ? 'text-sm' : ''}`}>
                                  {comment.user.first_name} {comment.user.last_name}
                                </span>
                              </div>
                              <div className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                {comment.created_at}
                              </div>
                            </div>
                            <p className={`text-gray-700 text-right leading-relaxed ${isMobile ? 'text-sm' : ''}`}>
                              {comment.content}
                            </p>
                            
                            {comment.replies && comment.replies.length > 0 && (
                              <div className={`${isMobile ? 'mt-2 mr-4' : 'mt-4 mr-6'} space-y-3`}>
                                {comment.replies.map((reply) => (
                                  <div key={reply.id} className={`bg-gray-50 rounded-lg ${isMobile ? 'p-2' : 'p-3'}`}>
                                    <div className={`flex justify-between items-start ${isMobile ? 'mb-1' : 'mb-2'}`}>
                                      <div className="flex items-center">
                                        <img 
                                          src={reply.user.thumbnail || DEFAULT_IMAGES.USER_AVATAR} 
                                          alt={`${reply.user.first_name} ${reply.user.last_name}`}
                                          className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full ml-2`}
                                        />
                                        <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                          {reply.user.first_name} {reply.user.last_name}
                                        </span>
                                      </div>
                                      <span className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                                        {reply.created_at}
                                      </span>
                                    </div>
                                    <p className={`text-gray-700 text-right ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                      {reply.content}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={`text-center py-8 text-gray-500 ${isMobile ? 'text-sm' : ''}`}>
                        هنوز بازخوردی برای این دوره ثبت نشده است
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Course Info Card - Desktop Only */}
            {!isMobile && (
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
            )}
          </div>
        </div>

        {/* Mobile Actions - Mobile Only */}
        <CourseMobileActions
          courseData={courseData}
          isEnrolled={isEnrolled}
          isProcessing={isProcessing}
          isFree={isFree}
          coursePrice={coursePrice}
          onPurchase={handlePurchase}
          onEnroll={handleEnroll}
        />
      </div>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={showPurchaseConfirm} onOpenChange={setShowPurchaseConfirm}>
        <DialogContent className={`${isMobile ? 'sm:max-w-[90vw] mx-4' : 'sm:max-w-[500px]'}`}>
          <DialogHeader>
            <DialogTitle className="text-center">تأیید خرید دوره</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {/* Course Info */}
            <div className={`bg-gray-50 rounded-lg ${isMobile ? 'p-3 mb-4' : 'p-4 mb-6'}`}>
              <div className="flex items-center">
                <img
                  src={courseData?.info.thumbnail}
                  alt={courseData?.info.title}
                  className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} object-cover rounded-lg ml-4`}
                />
                <div>
                  <h3 className={`font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>{courseData?.info.title}</h3>
                  <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    مدرس: {courseData?.info.instructor}
                  </p>
                </div>
              </div>
            </div>

            {/* Purchase Details */}
            <div className="space-y-4">
              <div className={`flex items-center justify-between ${isMobile ? 'p-2' : 'p-3'} bg-blue-50 border border-blue-200 rounded-lg`}>
                <div className="flex items-center">
                  <ShoppingCart className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-blue-600 ml-2`} />
                  <span className={`text-blue-800 ${isMobile ? 'text-sm' : ''}`}>مبلغ دوره:</span>
                </div>
                <span className={`font-bold text-blue-600 ${isMobile ? 'text-sm' : ''}`}>
                  {formatCurrencyWithUnit(coursePrice)}
                </span>
              </div>

              <div className={`flex items-center justify-between ${isMobile ? 'p-2' : 'p-3'} bg-green-50 border border-green-200 rounded-lg`}>
                <div className="flex items-center">
                  <Wallet className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-green-600 ml-2`} />
                  <span className={`text-green-800 ${isMobile ? 'text-sm' : ''}`}>موجودی فعلی شما:</span>
                </div>
                <span className={`font-bold text-green-600 ${isMobile ? 'text-sm' : ''}`}>
                  {formatCurrencyWithUnit(wallet?.balance || 0)}
                </span>
              </div>

              <div className={`flex items-center justify-between ${isMobile ? 'p-2' : 'p-3'} bg-orange-50 border border-orange-200 rounded-lg`}>
                <div className="flex items-center">
                  <CheckCircle className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-orange-600 ml-2`} />
                  <span className={`text-orange-800 ${isMobile ? 'text-sm' : ''}`}>موجودی پس از خرید:</span>
                </div>
                <span className={`font-bold text-orange-600 ${isMobile ? 'text-sm' : ''}`}>
                  {formatCurrencyWithUnit((wallet?.balance || 0) - coursePrice)}
                </span>
              </div>
            </div>

            {/* Confirmation Message */}
            <div className={`${isMobile ? 'mt-4 p-3' : 'mt-6 p-4'} bg-yellow-50 border border-yellow-200 rounded-lg`}>
              <p className={`text-yellow-800 text-center ${isMobile ? 'text-sm' : ''}`}>
                مبلغ <span className="font-bold">{formatCurrencyWithUnit(coursePrice)}</span> از کیف پول شما 
                برای خرید دوره <span className="font-bold">"{courseData?.info.title}"</span> کم می‌شود.
              </p>
            </div>
          </div>
          
          <DialogFooter className={`flex justify-between sm:justify-between ${isMobile ? 'gap-1' : 'gap-2'}`}>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowPurchaseConfirm(false)}
              className={isMobile ? 'text-sm' : ''}
            >
              انصراف
            </Button>
            <Button 
              type="submit" 
              onClick={handlePurchaseConfirm}
              disabled={isProcessing}
              className={`bg-green-600 hover:bg-green-700 ${isMobile ? 'text-sm' : ''}`}
            >
              {isProcessing ? "در حال پردازش..." : "تأیید و خرید"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default CourseDetailPage;
