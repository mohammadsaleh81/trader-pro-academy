
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import ContentListWithLinks from "@/components/content/ContentListWithLinks";
import { useData } from "@/contexts/DataContext";

type ContentTab = "articles" | "podcasts" | "videos" | "webinars" | "files";

const ContentHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ContentTab>("articles");
  const { articles, podcasts, videos, webinars, files } = useData();

  const tabs = [
    { id: "articles", label: "مقالات" },
    { id: "podcasts", label: "پادکست‌ها" },
    { id: "videos", label: "ویدیوها" },
    { id: "webinars", label: "وبینارها" },
    { id: "files", label: "فایل‌ها" },
  ];

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
          {activeTab === "articles" && (
            <ContentListWithLinks items={articles} type="article" />
          )}
          
          {activeTab === "podcasts" && (
            <ContentListWithLinks items={podcasts} type="podcast" />
          )}
          
          {activeTab === "videos" && (
            <ContentListWithLinks items={videos} type="video" />
          )}
          
          {activeTab === "webinars" && (
            <ContentListWithLinks items={webinars} type="webinar" />
          )}
          
          {activeTab === "files" && (
            <ContentListWithLinks items={files} type="file" />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ContentHubPage;
