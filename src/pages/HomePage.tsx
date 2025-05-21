
import React from "react";
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

  return (
    <Layout>
      <div className="trader-container py-4">
        {/* Hero Carousel */}
        <section className="mb-6">
          <HeroCarousel />
        </section>

        {/* Content Categories */}
        <section className="mb-8">
          <ContentCategories />
        </section>

        {/* Featured Courses */}
        <section className="mb-8">
          <SectionTitle 
            title="دوره‌های آموزشی" 
            viewAllLink="/courses"
            icon={<BookOpen className="text-trader-500 h-5 w-5" />}
          />
          <CourseList courses={courses} />
        </section>

        {/* Latest Articles */}
        <section className="mb-12 bg-gray-50 py-8 px-4 sm:px-6 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="max-w-7xl mx-auto">
            <SectionTitle 
              title="مقالات آموزشی" 
              viewAllLink="/content?type=articles"
              icon={<FileText className="text-trader-500 h-5 w-5" />}
              className="mb-6"
            />
            <ContentList items={articles.slice(0, 4)} type="article" showCarousel={true} />
          </div>
        </section>

        {/* Latest Videos */}
        <section className="mb-12">
          <SectionTitle 
            title="ویدیوهای آموزشی" 
            viewAllLink="/content?type=videos"
            icon={<Video className="text-trader-500 h-5 w-5" />}
          />
          <ContentList items={videos.slice(0, 4)} type="video" />
        </section>

        {/* Latest Podcasts */}
        <section className="mb-12 bg-gray-50 py-8 px-4 sm:px-6 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="max-w-7xl mx-auto">
            <SectionTitle 
              title="پادکست‌های آموزشی" 
              viewAllLink="/content?type=podcasts"
              icon={<Headphones className="text-trader-500 h-5 w-5" />}
              className="mb-6"
            />
            <ContentList items={podcasts.slice(0, 2)} type="podcast" />
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default HomePage;
