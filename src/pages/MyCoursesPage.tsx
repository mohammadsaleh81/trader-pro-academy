
import React from "react";
import Layout from "@/components/layout/Layout";
import CourseList from "@/components/course/CourseList";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const MyCoursesPage: React.FC = () => {
  const { myCourses } = useData();
  const { user } = useAuth();

  if (!user) {
    return (
      <Layout>
        <div className="trader-container py-12 text-center">
          <h2 className="text-xl font-bold mb-4">برای مشاهده دوره‌های خود ابتدا وارد شوید</h2>
          <Link to="/login" className="trader-btn-primary">
            ورود به حساب کاربری
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="trader-container py-6">
        <h1 className="text-2xl font-bold mb-6">دوره‌های من</h1>
        
        {myCourses.length > 0 ? (
          <CourseList courses={myCourses} showProgress />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-bold mb-4">هنوز در دوره‌ای ثبت‌نام نکرده‌اید</h2>
            <Link to="/" className="trader-btn-primary">
              مشاهده دوره‌ها
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyCoursesPage;
