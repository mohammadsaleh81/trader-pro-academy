
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import CourseList from "@/components/course/CourseList";
import ContentList from "@/components/content/ContentList";
import { useData } from "@/contexts/DataContext";
import HeroCarousel from "@/components/hero/HeroCarousel";
import ContentCategories from "@/components/content-categories/ContentCategories";
import SectionTitle from "@/components/section-title/SectionTitle";
import { BookOpen, FileText, Headphones, Video } from "lucide-react";

const HomePage: React.FC = () => {
  const { courses, articles, videos, podcasts } = useData();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout>
      <div className="py-4">
        {/* Hero Carousel */}
        <section className="mb-6">
          <HeroCarousel />
        </section>

        {/* Content Categories */}
        <section className="mb-8 px-2 sm:px-0">
          <ContentCategories />
        </section>

        {/* Featured Courses */}
        <section className="mb-8 px-2 sm:px-0">
          <SectionTitle 
            title="دوره‌های آموزشی" 
            viewAllLink="/courses"
            icon={<BookOpen className="text-trader-500 h-5 w-5" />}
          />
          <CourseList courses={courses} isLoading={isLoading} skeletonCount={4} />
        </section>

        {/* Latest Articles */}
        <section className="mb-12 bg-gray-50 py-8 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionTitle 
              title="مقالات آموزشی" 
              viewAllLink="/content?type=articles"
              icon={<FileText className="text-trader-500 h-5 w-5" />}
              className="mb-6"
            />
            <ContentList 
              items={articles.slice(0, 4)} 
              type="article" 
              showCarousel={true} 
              isLoading={isLoading} 
            />
          </div>
        </section>

        {/* Latest Videos */}
        <section className="mb-12 px-2 sm:px-0">
          <SectionTitle 
            title="ویدیوهای آموزشی" 
            viewAllLink="/content?type=videos"
            icon={<Video className="text-trader-500 h-5 w-5" />}
          />
          <ContentList 
            items={videos.slice(0, 4)} 
            type="video" 
            isLoading={isLoading} 
          />
        </section>

        {/* Latest Podcasts */}
        <section className="mb-12 bg-gray-50 py-8 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionTitle 
              title="پادکست‌های آموزشی" 
              viewAllLink="/content?type=podcasts"
              icon={<Headphones className="text-trader-500 h-5 w-5" />}
              className="mb-6"
            />
            <ContentList 
              items={podcasts.slice(0, 2)} 
              type="podcast" 
              isLoading={isLoading} 
            />
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default HomePage;
