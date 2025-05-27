
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
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
        <CourseHero courseData={courseData} />

        {/* Main Content */}
        <div className="trader-container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Info Card - Left Side */}
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

            {/* Course Content - Right Side */}
            <CourseContent courseData={courseData} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CourseDetailPage;
