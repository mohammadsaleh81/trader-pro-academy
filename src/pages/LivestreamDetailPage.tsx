import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play, Clock, Users, Calendar, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Livestream, livestreamsApi } from "@/lib/api";
import { formatAuthor, formatDate, formatStartTime, getTimeUntilStart } from "@/lib/utils";
import ContentActions from "@/components/content/ContentActions";
import ContentFooter from "@/components/content/ContentFooter";
import CommentSection from "@/components/comments/CommentSection";
import LivestreamStatusBadge from "@/components/content/LivestreamStatusBadge";
import LivestreamPlayer from "@/components/content/LivestreamPlayer";
import ErrorBoundary from "@/components/error/ErrorBoundary";

const LivestreamDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [livestream, setLivestream] = useState<Livestream | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLivestream = async () => {
      if (!id) {
        navigate('/content');
        return;
      }

      try {
        setIsLoading(true);
        const data = await livestreamsApi.getById(id);

        if (!data) {
          navigate('/content');
          return;
        }

        setLivestream(data);
      } catch (error) {
        console.error('Error fetching livestream:', error);
        toast({
          title: "خطا در دریافت لایو استریم",
          description: "لطفا دوباره تلاش کنید",
          variant: "destructive",
        });
        navigate('/content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLivestream();
  }, [id, navigate, toast]);

  if (isLoading) {
    return (
      <Layout>
        <div className="trader-container py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!livestream) {
    return (
      <Layout>
        <div className="trader-container py-8">
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-4">لایو استریم مورد نظر یافت نشد</p>
            <Button 
              onClick={() => navigate("/content")}
              className="mx-auto"
            >
              بازگشت به کتابخانه محتوا
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <ErrorBoundary>
      <Layout>
        <div className="trader-container py-8">
          <Button
            variant="ghost"
            className="mb-6 flex items-center gap-2"
            onClick={() => navigate("/content")}
          >
            <ArrowRight size={18} />
            <span>بازگشت به کتابخانه محتوا</span>
          </Button>

          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              {/* Header with Status */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <LivestreamStatusBadge status={livestream.stream_status} />
                  {livestream.featured && (
                    <Badge className="bg-yellow-500 text-white">⭐ ویژه</Badge>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-right flex-1 ml-4">{livestream.title}</h1>
              </div>

              {/* Content Actions */}
              <div className="flex justify-end mb-6">
                <ContentActions 
                  articleId={livestream.id.toString()}
                  title={livestream.title}
                />
              </div>

              {/* Stream Player or Thumbnail */}
              <div className="mb-8">
                <LivestreamPlayer livestream={livestream} />
              </div>

              {/* Stream Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">برگزار کننده</p>
                    <p className="font-medium">{formatAuthor(livestream.author)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">تاریخ شروع</p>
                    <p className="font-medium">{formatStartTime(livestream.start_at)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Users className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">بینندگان فعلی</p>
                    <p className="font-medium">{livestream.current_viewers.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Users className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">بازدید کل</p>
                    <p className="font-medium">{livestream.view_count.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {livestream.description && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-right">توضیحات</h3>
                  <p className="text-gray-700 text-right leading-relaxed">
                    {livestream.description}
                  </p>
                </div>
              )}

              {/* Category */}
              {livestream.category && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-right">دسته‌بندی</h3>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-trader-100 text-trader-800">
                      {livestream.category.name}
                    </Badge>
                    {livestream.category.description && (
                      <p className="text-sm text-gray-600 text-right">
                        {livestream.category.description}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              {livestream.tags && livestream.tags.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-right">برچسب‌ها</h3>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {livestream.tags.map((tag) => (
                      <Badge key={tag.id} variant="outline">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <ContentFooter
                author={livestream.author}
                publishDate={livestream.created_at}
                viewCount={livestream.view_count}
                tags={livestream.tags}
              />

              {/* Comments Section */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <CommentSection
                  contentType="livestream"
                  contentId={id!}
                />
              </div>

              {/* Related content section */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-right">لایو استریم‌های مرتبط</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center text-gray-500 py-8">
                    لایو استریم‌های مرتبط به‌زودی اضافه خواهد شد
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ErrorBoundary>
  );
};

export default LivestreamDetailPage; 