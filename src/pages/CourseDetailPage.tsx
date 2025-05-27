import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingCart, Loader } from "lucide-react";
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

        // Simulate processing delay
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
      // Free course
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

    // Process purchase
    const newTransaction = {
      id: Date.now().toString(),
      amount: course.price,
      type: "purchase" as const,
      description: `خرید دوره ${courseData.info.title}`,
      date: new Date().toLocaleDateString("fa-IR"),
    };

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
        <div className="trader-container py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
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
      <div className="trader-container py-8">
        <Button
          variant="ghost"
          className="mb-6 flex items-center gap-2"
          onClick={() => navigate("/courses")}
        >
          <ArrowRight size={18} />
          <span>بازگشت به لیست دوره‌ها</span>
        </Button>

        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-2xl font-bold text-right">{courseData.info.title}</h1>
            </div>

            <div className="mb-6">
              <img
                src={courseData.info.thumbnail}
                alt={courseData.info.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>

            <div className="flex flex-col gap-4 mb-6">
              <div className="text-gray-600 text-sm">
                <span className="font-bold">مدرس:</span> {courseData.info.instructor}
              </div>
              <div className="text-gray-600 text-sm">
                <span className="font-bold">تعداد دروس:</span> {courseData.info.total_lessons}
              </div>
              <div className="text-gray-600 text-sm">
                <span className="font-bold">مدت دوره:</span> {courseData.info.total_duration} دقیقه
              </div>
              <div className="text-gray-600 text-sm">
                <span className="font-bold">سطح دوره:</span> {courseData.info.level}
              </div>
            </div>

            <div className="mb-8 text-right" dir="rtl">
              <h2 className="text-xl font-semibold mb-3">توضیحات دوره</h2>
              <p className="text-gray-700">{courseData.info.description}</p>
            </div>

            <div className="flex justify-center">
              {isEnrolled ? (
                <Button
                  variant="outline"
                  className="w-full md:w-auto"
                  onClick={() => navigate(`/learn/${courseData.info.id}`)}
                >
                  ادامه یادگیری
                </Button>
              ) : (
                <Button
                  className="w-full md:w-auto"
                  onClick={isFree ? handleEnroll : handlePurchase}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader className="h-4 w-4 animate-spin mx-auto" />
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 ml-2" />
                      {isFree ? "ثبت‌نام رایگان" : `خرید دوره - ${coursePrice.toLocaleString()} تومان`}
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CourseDetailPage;
