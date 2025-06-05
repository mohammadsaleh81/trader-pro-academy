
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { api, UserCourse } from "@/lib/api";

const MyCoursesPage: React.FC = () => {
  const { user } = useAuth();
  const [myCourses, setMyCourses] = useState<UserCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyCourses = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const courses = await api.getMyCourses();
        setMyCourses(courses);
      } catch (error) {
        console.error('Error fetching my courses:', error);
        toast({
          title: "خطا",
          description: "خطا در دریافت دوره‌های شما",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyCourses();
  }, [user]);

  if (!user) {
    return (
      <Layout>
        <div className="trader-container py-12 text-center fade-in">
          <h2 className="text-xl font-bold mb-4">برای مشاهده دوره‌های خود ابتدا وارد شوید</h2>
          <Link to="/login" className="trader-btn-primary btn-click">
            ورود به حساب کاربری
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="trader-container py-6">
        <h1 className="text-2xl font-bold mb-6 fade-in">دوره‌های من</h1>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-gray-300"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded mb-4"></div>
                  <div className="h-2 bg-gray-300 rounded mb-1"></div>
                  <div className="h-2 bg-gray-300 rounded mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : myCourses.length > 0 ? (
          <div className="fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {myCourses.map((course) => (
                <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <Link to={`/courses/${course.slug}`}>
                    <img
                      src={course.cover_image_url}
                      alt={course.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                      }}
                    />
                  </Link>
                  <div className="p-4">
                    <Link to={`/courses/${course.slug}`}>
                      <h3 className="font-bold text-lg mb-2 hover:text-trader-500 transition-colors">
                        {course.title}
                      </h3>
                    </Link>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>پیشرفت دوره</span>
                        <span>{course.progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                    
                    <Button 
                      asChild
                      className="w-full bg-trader-500 hover:bg-trader-600"
                    >
                      <Link to={`/courses/${course.slug}`}>
                        ادامه دوره
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="scale-in">
            <EmptyState
              icon={<BookOpen className="h-16 w-16" />}
              title="هنوز در دوره‌ای ثبت‌نام نکرده‌اید"
              description="از بین دوره‌های متنوع ما، دوره‌های مورد علاقه خود را انتخاب کنید"
              action={
                <Button asChild className="mt-4 bg-trader-500 hover:bg-trader-600 btn-click">
                  <Link to="/courses">مشاهده دوره‌ها</Link>
                </Button>
              }
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyCoursesPage;
