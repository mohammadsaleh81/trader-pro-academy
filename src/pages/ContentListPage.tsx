import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import ContentCard from "@/components/content/ContentCard";
import ContentCardSkeleton from "@/components/content/ContentCardSkeleton";
import PaginationControls from "@/components/ui/pagination-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { articlesApi, videosApi, podcastsApi, Article, Video, Podcast } from "@/lib/api";
import { PaginatedResponse } from "@/types/pagination";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type ContentType = "articles" | "videos" | "podcasts";
type ContentItem = Article | Video | Podcast;

const ContentListPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ContentType>("articles");
  const [content, setContent] = useState<ContentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrevious: false
  });

  // Load content based on active tab and page
  const loadContent = async (page: number = 1) => {
    setIsLoading(true);
    try {
      let response: PaginatedResponse<ContentItem>;
      
      switch (activeTab) {
        case "articles":
          response = await articlesApi.getAll(page, 12) as PaginatedResponse<Article>;
          break;
        case "videos":
          response = await videosApi.getAll(page, 12) as PaginatedResponse<Video>;
          break;
        case "podcasts":
          response = await podcastsApi.getAll(page, 12) as PaginatedResponse<Podcast>;
          break;
        default:
          response = await articlesApi.getAll(page, 12) as PaginatedResponse<Article>;
      }

      // Filter by search term if provided
      let filteredResults = response.results;
      if (searchTerm) {
        filteredResults = response.results.filter((item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setContent(filteredResults);
      setPagination({
        currentPage: response.current_page,
        totalPages: response.total_pages,
        totalCount: filteredResults.length,
        hasNext: !!response.next,
        hasPrevious: !!response.previous
      });
    } catch (error) {
      console.error('Error loading content:', error);
      setContent([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load content when tab changes or search term changes
  useEffect(() => {
    loadContent(1);
  }, [activeTab, searchTerm]);

  // Handle page changes
  const handlePageChange = (page: number) => {
    loadContent(page);
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as ContentType);
    setSearchTerm(""); // Clear search when changing tabs
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Get content type for display
  const getContentTypeLabel = () => {
    switch (activeTab) {
      case "articles": return "مقالات";
      case "videos": return "ویدیوها";
      case "podcasts": return "پادکست‌ها";
      default: return "محتوا";
    }
  };

  // Format author name
  const formatAuthor = (author: any): string => {
    if (!author) return "نویسنده";
    if (typeof author === 'string') return author;
    if (typeof author === 'object') {
      return `${author.first_name || ''} ${author.last_name || ''}`.trim() || 
             author.username || author.email || "نویسنده";
    }
    return "نویسنده";
  };

  return (
    <Layout>
      <div className="trader-container py-6">
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <h1 className="text-2xl font-bold mb-6">کتابخانه محتوا</h1>
          
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute top-3 right-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="جستجو در محتوا..."
              className="pr-10"
              value={searchTerm}
              onChange={handleSearch}
              disabled={isLoading}
            />
          </div>

          {/* Content Type Tabs */}
          <Tabs defaultValue="articles" value={activeTab} onValueChange={handleTabChange} dir="rtl">
            <TabsList className="w-full bg-gray-100 p-1 mb-6">
              <TabsTrigger value="articles" className="flex-1">مقالات</TabsTrigger>
              <TabsTrigger value="videos" className="flex-1">ویدیوها</TabsTrigger>
              <TabsTrigger value="podcasts" className="flex-1">پادکست‌ها</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {/* Content Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <ContentCardSkeleton key={`skeleton-${index}`} />
                  ))}
                </div>
              ) : content.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                    {content.map((item) => (
                      <ContentCard
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        description={item.description || ""}
                        thumbnail={item.thumbnail}
                        type={activeTab.slice(0, -1) as any} // Remove 's' from plural
                        date={item.date}
                        author={formatAuthor((item as any).author)}
                        duration={
                          activeTab === "videos" ? (item as Video).duration :
                          activeTab === "podcasts" ? (item as Podcast).duration :
                          undefined
                        }
                        className="h-full"
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  <PaginationControls
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    isLoading={isLoading}
                    itemsName={getContentTypeLabel()}
                    className="mt-8"
                  />
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-gray-500">
                    {searchTerm 
                      ? `هیچ ${getContentTypeLabel()}ی با عبارت "${searchTerm}" یافت نشد.`
                      : `هنوز ${getContentTypeLabel()}ی منتشر نشده است.`
                    }
                  </p>
                  {searchTerm && (
                    <Button 
                      variant="link" 
                      onClick={() => setSearchTerm("")}
                      className="mt-2"
                    >
                      پاک کردن جستجو
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default ContentListPage; 