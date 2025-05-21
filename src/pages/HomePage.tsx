
import React from "react";
import Layout from "@/components/layout/Layout";
import CourseList from "@/components/course/CourseList";
import ContentList from "@/components/content/ContentList";
import { useData } from "@/contexts/DataContext";

const HomePage: React.FC = () => {
  const { courses, articles, videos, podcasts } = useData();

  return (
    <Layout>
      <div className="trader-container py-6">
        {/* Hero Section */}
        <section className="rounded-2xl bg-gradient-to-l from-trader-500 to-trader-600 p-6 text-white mb-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-2/3">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">مستر تریدر آکادمی</h1>
              <p className="mb-4">مرجع آموزش تخصصی بازارهای مالی</p>
              <button className="bg-white text-trader-600 py-2 px-6 rounded-full font-medium hover:bg-gray-100 transition-colors">
                مشاهده دوره‌ها
              </button>
            </div>
            <div className="md:w-1/3 mt-4 md:mt-0">
              <img 
                src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop" 
                alt="Trading" 
                className="rounded-xl w-full h-40 object-cover"
              />
            </div>
          </div>
        </section>

        {/* Featured Courses */}
        <CourseList courses={courses} title="دوره‌های ویژه" />

        {/* Latest Content */}
        <ContentList items={articles.slice(0, 2)} type="article" title="آخرین مقالات" />
        <ContentList items={videos.slice(0, 2)} type="video" title="ویدیوهای جدید" />
        <ContentList items={podcasts.slice(0, 2)} type="podcast" title="پادکست‌های اخیر" />
      </div>
    </Layout>
  );
};

export default HomePage;
