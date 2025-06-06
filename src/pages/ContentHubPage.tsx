
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
import { Article, Video } from "@/lib/api";

type ContentTab = "articles" | "podcasts" | "videos" | "webinars" | "files";

const ContentHubPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const typeFromUrl = queryParams.get('type');
  
  const getInitialTab = (): ContentTab => {
    if (!typeFromUrl) return "articles";
    
    const normalizedType = typeFromUrl.endsWith('s') 
      ? typeFromUrl 
      : `${typeFromUrl}s`;
      
    return ["articles", "podcasts", "videos", "webinars", "files"].includes(normalizedType) 
      ? normalizedType as ContentTab 
      : "articles";
  };

  const [activeTab, setActiveTab] = useState<ContentTab>(getInitialTab());
  const { articles, podcasts, videos, webinars, files, loadingStates } = useData();
  const [key, setKey] = useState(0);

  useEffect(() => {
    const newTab = getInitialTab();
    if (newTab !== activeTab) {
      setActiveTab(newTab);
      setKey(prevKey => prevKey + 1);
    }
  }, [location.search]);

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

  const handleTabChange = (value: string) => {
    const tab = value as ContentTab;
    setActiveTab(tab);
    navigate(`/content?type=${tab}`, { replace: true });
  };

  const isCurrentTabLoading = () => {
    if (!loadingStates) {
      return false;
    }
    
    switch (activeTab) {
      case "articles": return loadingStates.articles || false;
      case "videos": return loadingStates.videos || false;
      default: return false;
    }
  };

  return (
    <Layout>
      <div className="trader-container py-6">
        <h1 className="text-2xl font-bold mb-6 text-right">کتابخانه محتوا</h1>
        
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

          <div className="mt-6 rtl-card-content">
            {isCurrentTabLoading() ? (
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
