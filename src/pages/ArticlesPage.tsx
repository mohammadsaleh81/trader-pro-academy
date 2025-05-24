
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CalendarIcon, UserIcon, TagIcon, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Article } from "@/contexts/DataContext";
import { idToString } from "@/utils/idConverter";

const ArticlesPage: React.FC = () => {
  const { articles, fetchArticles } = useData();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    const loadArticles = async () => {
      setIsLoading(true);
      await fetchArticles();
      setIsLoading(false);
    };
    
    loadArticles();
  }, [fetchArticles]);

  // Extract unique categories and tags
  const categories = [...new Set(articles.map(article => article.category?.name))].filter(Boolean);
  const tags = [...new Set(articles.flatMap(article => article.tags?.map(tag => tag.name)))].filter(Boolean);

  // Filter articles based on selected category and tag
  const filteredArticles = articles.filter(article => {
    const categoryMatch = !selectedCategory || article.category?.name === selectedCategory;
    const tagMatch = !selectedTag || article.tags?.some(tag => tag.name === selectedTag);
    return categoryMatch && tagMatch;
  });

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedTag(null);
  };

  return (
    <Layout>
      <div className="trader-container py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar with filters */}
          <div className="w-full md:w-1/4">
            <Card className="sticky top-24 mb-6 border-none shadow-md">
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-4 text-right">دسته‌بندی‌ها</h3>
                <div className="space-y-2 text-right">
                  {categories.map((category) => (
                    <div key={category} className="flex justify-between items-center">
                      <Button
                        variant={selectedCategory === category ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start text-right"
                        onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                      >
                        {category}
                      </Button>
                    </div>
                  ))}
                </div>

                <h3 className="font-bold text-lg mt-6 mb-4 text-right">برچسب‌ها</h3>
                <div className="flex flex-wrap gap-2 justify-end">
                  {tags.map((tag) => (
                    <Badge 
                      key={tag}
                      variant={selectedTag === tag ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                {(selectedCategory || selectedTag) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-4 w-full"
                    onClick={clearFilters}
                  >
                    حذف فیلترها
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="w-full md:w-3/4">
            <h1 className="text-2xl font-bold mb-6 text-right">مقالات آموزشی</h1>
            
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <CardContent className="p-4">
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {filteredArticles.map((article: Article) => (
                  <Link to={`/articles/${idToString(article.id)}`} key={article.id}>
                    <Card className="overflow-hidden hover:shadow-md transition-all duration-300 border-none shadow-sm">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3">
                          <img src={article.thumbnail} alt={article.title} className="w-full h-48 md:h-full object-cover" />
                        </div>
                        <div className="md:w-2/3 p-4 flex flex-col">
                          <div>
                            <h2 className="text-xl font-bold mb-2 text-right">{article.title}</h2>
                            <p className="text-gray-600 mb-3 text-right line-clamp-2">{article.summary || article.content.substring(0, 150)}</p>
                          </div>
                          
                          <div className="mt-auto">
                            <div className="flex flex-wrap justify-end gap-2 mb-3">
                              {article.tags?.slice(0, 3).map((tag) => (
                                <Badge key={tag.id} variant="outline" className="text-trader-500 border-trader-300">
                                  {tag.name}
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="flex items-center justify-between text-gray-500 text-sm">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{article.view_count} بازدید</span>
                              </div>
                              
                              <div className="flex items-center gap-4 justify-end">
                                <div className="flex items-center">
                                  <CalendarIcon className="h-4 w-4 ml-1" />
                                  <span>
                                    {article.published_at ? formatDate(article.published_at.split('T')[0]) : formatDate(article.created_at.split('T')[0])}
                                  </span>
                                </div>
                                
                                <div className="flex items-center">
                                  <UserIcon className="h-4 w-4 ml-1" />
                                  <span>
                                    {article.author.first_name || article.author.last_name 
                                      ? `${article.author.first_name} ${article.author.last_name}`
                                      : 'نویسنده ناشناس'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">مقاله‌ای با این فیلترها پیدا نشد</p>
                <Button onClick={clearFilters} className="mt-4">نمایش تمام مقالات</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ArticlesPage;
