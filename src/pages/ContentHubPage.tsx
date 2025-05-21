
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import ContentListWithLinks from "@/components/content/ContentListWithLinks";
import { useData } from "@/contexts/DataContext";
import ContentCardSkeleton from "@/components/content/ContentCardSkeleton";
import { FileText, Search } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type ContentTab = "articles" | "podcasts" | "videos" | "webinars" | "files";

const ContentHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ContentTab>("articles");
  const { articles, podcasts, videos, webinars, files } = useData();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Reset loading state when tab changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [activeTab]);

  const tabs = [
    { id: "articles", label: "مقالات" },
    { id: "podcasts", label: "پادکست‌ها" },
    { id: "videos", label: "ویدیوها" },
    { id: "webinars", label: "وبینارها" },
    { id: "files", label: "فایل‌ها" },
  ];

  const getActiveContent = () => {
    switch (activeTab) {
      case "articles": return articles;
      case "podcasts": return podcasts;
      case "videos": return videos;
      case "webinars": return webinars;
      case "files": return files;
      default: return [];
    }
  };
  
  const activeContent = getActiveContent();

  return (
    <Layout>
      <div className="trader-container py-6">
        <h1 className="text-2xl font-bold mb-6">کتابخانه محتوا</h1>
        
        {/* Tabs */}
        <div className="overflow-x-auto mb-6">
          <div className="flex space-x-2 space-x-reverse border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`py-2 px-4 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-trader-500 border-b-2 border-trader-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab(tab.id as ContentTab)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <ContentCardSkeleton key={`skeleton-${index}`} />
              ))}
            </div>
          ) : activeContent.length > 0 ? (
            <ContentListWithLinks items={activeContent} type={activeTab.slice(0, -1) as any} />
          ) : (
            <EmptyState
              icon={<FileText className="h-16 w-16" />}
              title={`هنوز محتوایی در بخش ${tabs.find(tab => tab.id === activeTab)?.label} وجود ندارد`}
              description="به‌زودی محتوای جدیدی در این بخش منتشر خواهد شد"
              action={
                <Button 
                  onClick={() => setActiveTab("articles")} 
                  className="mt-4 bg-trader-500 hover:bg-trader-600"
                  variant="default"
                >
                  مشاهده سایر محتوا
                </Button>
              }
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ContentHubPage;
