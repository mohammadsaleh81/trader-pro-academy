
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api, CourseDetailResponse } from "@/lib/api";
import { Loader, Play, BookOpen, Clock, Users, Star } from "lucide-react";

const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courseData, setCourseData] = useState<CourseDetailResponse | null>(null);
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
        const details = await api.getCourseDetail(slug);
        setCourseData(details);
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
  }, [slug, navigate]);

  const handlePurchase = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!courseData) return;

    setIsProcessing(true);

    try {
      // Create order
      const orderData = {
        items: [{
          item_id: courseData.id,
          item_type: 'course',
          quantity: 1,
          unit_price: courseData.price
        }]
      };

      const orderResponse = await api.createOrder(orderData);
      
      // Request payment
      const paymentResponse = await api.requestPayment({
        order_id: orderResponse.order_id,
        amount: orderResponse.total_amount_to_pay
      });

      // Store order ID for verification
      localStorage.setItem('pending_order_id', orderResponse.order_id.toString());

      // Redirect to payment gateway
      window.location.href = paymentResponse.payment_url;

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

  const handleToggleLessonComplete = async (lessonId: number) => {
    try {
      await api.markLessonProgress(lessonId);
      
      // Refresh course data to get updated progress
      const updatedDetails = await api.getCourseDetail(slug!);
      setCourseData(updatedDetails);

      toast({
        title: "موفق",
        description: "وضعیت درس بروزرسانی شد",
      });
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      toast({
        title: "خطا",
        description: "خطا در بروزرسانی وضعیت درس",
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

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Course Hero Section */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-16">
          <div className="trader-container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{courseData.title}</h1>
                <p className="text-lg mb-6 text-orange-100">{courseData.description}</p>
                <div className="flex items-center gap-6 text-sm">
                  <span>مدرس: {courseData.instructor_name}</span>
                  <span>دسته‌بندی: {courseData.category_name}</span>
                </div>
              </div>
              <div className="text-center lg:text-right">
                <img
                  src={courseData.cover_image_url}
                  alt={courseData.title}
                  className="w-full max-w-md mx-auto lg:mx-0 rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="trader-container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Course Description */}
              <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
                <h2 className="text-2xl font-bold mb-4">درباره دوره</h2>
                <p className="text-gray-700 leading-relaxed">{courseData.description}</p>
              </div>

              {/* Course Content */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-2xl font-bold mb-6">محتوای دوره</h2>
                
                <Accordion type="multiple" className="w-full">
                  {courseData.chapters.map((chapter) => (
                    <AccordionItem key={chapter.id} value={`chapter-${chapter.id}`}>
                      <AccordionTrigger className="text-right">
                        <span className="font-medium">{chapter.title}</span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 mr-4">
                          {chapter.lessons.map((lesson) => (
                            <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                {courseData.is_enrolled && (
                                  <Checkbox
                                    checked={lesson.is_completed}
                                    onCheckedChange={() => handleToggleLessonComplete(lesson.id)}
                                  />
                                )}
                                <div>
                                  <h4 className="font-medium">{lesson.title}</h4>
                                  <span className="text-sm text-gray-500">{lesson.lesson_type}</span>
                                </div>
                              </div>
                              {courseData.is_enrolled && (
                                <Button variant="ghost" size="sm">
                                  <Play className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 shadow-sm sticky top-8">
                {/* Price or Progress */}
                {courseData.is_enrolled ? (
                  <div className="mb-6">
                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold text-green-600 mb-2">دوره خریداری شده</div>
                      <div className="text-sm text-gray-600">پیشرفت شما در این دوره</div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">پیشرفت کلی</span>
                        <span className="text-sm font-medium">{courseData.progress || 0}%</span>
                      </div>
                      <Progress value={courseData.progress || 0} className="h-3" />
                    </div>
                  </div>
                ) : (
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {courseData.price === 0 ? "رایگان" : `${courseData.price.toLocaleString()} تومان`}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="mb-6">
                  {courseData.is_enrolled ? (
                    <Button className="w-full py-3 bg-green-600 hover:bg-green-700">
                      <Play className="h-4 w-4 ml-2" />
                      ادامه یادگیری
                    </Button>
                  ) : (
                    <Button
                      className="w-full py-3 bg-orange-600 hover:bg-orange-700"
                      onClick={handlePurchase}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader className="h-4 w-4 animate-spin mx-auto" />
                      ) : (
                        <>
                          {courseData.price === 0 ? "ثبت‌نام رایگان" : "خرید دوره"}
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Course Info */}
                <div className="space-y-4 border-t pt-6">
                  <h3 className="font-bold text-lg">اطلاعات دوره</h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">مدرس:</span>
                      <span className="font-medium">{courseData.instructor_name}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">دسته‌بندی:</span>
                      <span className="font-medium">{courseData.category_name}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">تعداد فصل:</span>
                      <span className="font-medium">{courseData.chapters.length}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">تعداد درس:</span>
                      <span className="font-medium">
                        {courseData.chapters.reduce((total, chapter) => total + chapter.lessons.length, 0)}
                      </span>
                    </div>
                  </div>
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
