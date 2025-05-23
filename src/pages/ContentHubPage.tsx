
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import ContentListWithLinks from "@/components/content/ContentListWithLinks";
import { useData } from "@/contexts/DataContext";
import ContentCardSkeleton from "@/components/content/ContentCardSkeleton";
import { FileText, Search } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type ContentTab = "articles" | "podcasts" | "videos" | "webinars" | "files";

const ContentHubPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const typeFromUrl = queryParams.get('type');
  
  // Convert URL param to valid tab value or default to "articles"
  const getInitialTab = (): ContentTab => {
    if (!typeFromUrl) return "articles";
    
    // Handle both singular and plural forms
    const normalizedType = typeFromUrl.endsWith('s') 
      ? typeFromUrl 
      : `${typeFromUrl}s`;
      
    return ["articles", "podcasts", "videos", "webinars", "files"].includes(normalizedType) 
      ? normalizedType as ContentTab 
      : "articles";
  };

  const [activeTab, setActiveTab] = useState<ContentTab>(getInitialTab());
  const { articles, podcasts, videos, webinars, files } = useData();
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState(0); // Used to force re-render the content for animation

  // Sync tab when URL changes
  useEffect(() => {
    const newTab = getInitialTab();
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  }, [location.search]);

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
      setKey(prevKey => prevKey + 1); // Force re-render for animation
    }, 800);

    return () => clearTimeout(timer);
  }, [activeTab]);

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

  const tabLabelsMap = {
    articles: "مقالات",
    podcasts: "پادکست‌ها",
    videos: "ویدیوها",
    webinars: "وبینارها",
    files: "فایل‌ها"
  };

  // Handle tab change and update URL
  const handleTabChange = (value: string) => {
    const tab = value as ContentTab;
    setActiveTab(tab);
    
    // Update URL with the new tab value
    navigate(`/content?type=${tab}`, { replace: true });
  };

  return (
    <Layout>
      <div className="trader-container py-6">
        <h1 className="text-2xl font-bold mb-6 text-right">کتابخانه محتوا</h1>
        
        {/* Tabs */}
        <Tabs defaultValue="articles" value={activeTab} onValueChange={handleTabChange} dir="rtl" className="rtl-card-content">
          <TabsList className="w-full overflow-x-auto bg-white border-b border-gray-200 p-0 h-auto mb-6">
            {(Object.keys(tabLabelsMap) as ContentTab[]).map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="py-2 px-4 text-sm font-medium data-[state=active]:text-trader-500 data-[state=active]:border-b-2 data-[state=active]:border-trader-500 data-[state=active]:shadow-none rounded-none tab-transition"
              >
                {tabLabelsMap[tab]}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Content */}
          <div className="mt-6 rtl-card-content">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <ContentCardSkeleton key={`skeleton-${index}`} />
                ))}
              </div>
            ) : (
              <div key={key} className="fade-in">
                {activeContent.length > 0 ? (
                  <ContentListWithLinks items={activeContent} type={activeTab.slice(0, -1) as any} />
                ) : (
                  <EmptyState
                    icon={<FileText className="h-16 w-16" />}
                    title={`هنوز محتوایی در بخش ${tabLabelsMap[activeTab]} وجود ندارد`}
                    description="به‌زودی محتوای جدیدی در این بخش منتشر خواهد شد"
                    action={
                      <Button 
                        onClick={() => handleTabChange("articles")} 
                        className="mt-4 bg-trader-500 hover:bg-trader-600 btn-click"
                        variant="default"
                      >
                        مشاهده سایر محتوا
                      </Button>
                    }
                  />
                )}
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ContentHubPage;
