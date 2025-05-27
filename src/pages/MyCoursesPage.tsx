import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import CourseList from "@/components/course/CourseList";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Loader, BookOpen } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

const MyCoursesPage: React.FC = () => {
  const { myCourses } = useData();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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
          <CourseList courses={[]} isLoading={true} showProgress skeletonCount={8} />
        ) : myCourses.length > 0 ? (
          <div className="fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {myCourses.map((course) => (
                <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <Link to={`/courses/${course.id}`}>
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                  </Link>
                  <div className="p-4">
                    <Link to={`/courses/${course.id}`}>
                      <h3 className="font-bold text-lg mb-2 hover:text-trader-500 transition-colors">
                        {course.title}
                      </h3>
                    </Link>
                    <p className="text-gray-600 text-sm mb-4">{course.instructor}</p>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>پیشرفت دوره</span>
                        <span>{course.progress_percentage?.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-trader-500 rounded-full transition-all duration-300"
                          style={{ width: `${course.progress_percentage || 0}%` }}
                        />
                      </div>
                    </div>
                    
                    <Button 
                      asChild
                      className="w-full bg-trader-500 hover:bg-trader-600"
                    >
                      <Link to={`/courses/${course.id}`}>
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
                  <Link to="/">مشاهده دوره‌ها</Link>
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
