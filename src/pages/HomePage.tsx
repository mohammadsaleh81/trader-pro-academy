
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import CourseList from "@/components/course/CourseList";
import ContentList from "@/components/content/ContentList";
import { useData } from "@/contexts/DataContext";
import HeroCarousel from "@/components/hero/HeroCarousel";
import ContentCategories from "@/components/content-categories/ContentCategories";
import SectionTitle from "@/components/section-title/SectionTitle";
import { BookOpen, FileText, Headphones, Video } from "lucide-react";
import CarouselCard from "@/components/ui/carousel-card";
import CourseCard from "@/components/course/CourseCard";
import CourseCardSkeleton from "@/components/course/CourseCardSkeleton";

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
      <div className="py-2">
        {/* Hero Carousel */}
        <section className="mb-4">
          <HeroCarousel />
        </section>

        {/* Content Categories */}
        <section className="mb-6 px-2 sm:px-0">
          <ContentCategories />
        </section>

        {/* Featured Courses */}
        <section className="mb-6 px-2 sm:px-0">
          <SectionTitle 
            title="دوره‌های آموزشی" 
            viewAllLink="/courses"
            icon={<BookOpen className="text-trader-500 h-5 w-5" />}
          />
          
          <CarouselCard controlsClassName="bg-white shadow-md">
            {isLoading 
              ? Array.from({ length: 5 }).map((_, index) => (
                  <CourseCardSkeleton key={`skeleton-${index}`} />
                ))
              : courses.slice(0, 8).map((course, index) => (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    instructor={course.instructor}
                    thumbnail={course.thumbnail}
                    price={course.price}
                    rating={course.rating}
                    isFree={index % 3 === 0}
                    is_enrolled={course.is_enrolled}
                  />
                ))
            }
          </CarouselCard>
        </section>

        {/* Latest Articles */}
        <section className="mb-6 bg-gray-50 py-4 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionTitle 
              title="مقالات آموزشی" 
              viewAllLink="/content?type=articles"
              icon={<FileText className="text-trader-500 h-5 w-5" />}
              className="mb-4"
            />
            <ContentList 
              items={articles.slice(0, 5)} 
              type="article" 
              showCarousel={true} 
              isLoading={isLoading} 
              skeletonCount={5}
            />
          </div>
        </section>

        {/* Latest Videos */}
        <section className="mb-6 px-2 sm:px-0">
          <SectionTitle 
            title="ویدیوهای آموزشی" 
            viewAllLink="/content?type=videos"
            icon={<Video className="text-trader-500 h-5 w-5" />}
          />
          <ContentList 
            items={videos.slice(0, 8)} 
            type="video" 
            isLoading={isLoading}
            skeletonCount={8}
          />
        </section>

        {/* Latest Podcasts */}
        <section className="mb-6 bg-gray-50 py-4 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionTitle 
              title="پادکست‌های آموزشی" 
              viewAllLink="/content?type=podcasts"
              icon={<Headphones className="text-trader-500 h-5 w-5" />}
              className="mb-4"
            />
            <ContentList 
              items={podcasts.slice(0, 8)} 
              type="podcast" 
              isLoading={isLoading}
              skeletonCount={8}
            />
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default HomePage;
