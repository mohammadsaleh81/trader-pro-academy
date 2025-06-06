import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContent } from "@/contexts/ContentContext";
import { useAuth } from "@/contexts/AuthContext";
import ContentActions from "./ContentActions";
import EnhancedContentActions from "./EnhancedContentActions";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const BookmarkTestComponent: React.FC = () => {
  const { articles, bookmarks, isLoading } = useContent();
  const { user } = useAuth();

  if (!user) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>تست سیستم بوکمارک</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">
            برای تست سیستم بوکمارک، ابتدا وارد حساب کاربری خود شوید.
          </p>
          <div className="mt-4 text-center">
            <Button asChild>
              <Link to="/login">ورود به حساب کاربری</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>تست سیستم بوکمارک</span>
            <Badge variant="outline">
              {bookmarks.length} بوکمارک
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            خوش آمدید {user.first_name || user.name}! 
            شما می‌توانید مقالات را بوکمارک کنید و در صفحه 
            <Link to="/bookmarks" className="text-blue-600 mx-1 underline">
              نشان‌های من
            </Link>
            مشاهده کنید.
          </p>
          
          {isLoading.articles && (
            <div className="text-center py-4">
              <p>در حال بارگذاری مقالات...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Articles List */}
      {!isLoading.articles && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">مقالات موجود برای بوکمارک</h2>
          
          {articles.length === 0 ? (
            <Card>
              <CardContent className="py-6">
                <p className="text-center text-gray-600">
                  هیچ مقاله‌ای در دسترس نیست.
                </p>
              </CardContent>
            </Card>
          ) : (
            articles.slice(0, 5).map((article) => (
              <Card key={article.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Article Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {article.summary || article.description || "خلاصه‌ای در دسترس نیست"}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>نویسنده: {article.author}</span>
                        <span>تاریخ: {new Date(article.date).toLocaleDateString('fa-IR')}</span>
                        <span>بازدید: {article.view_count}</span>
                      </div>
                    </div>

                    {/* Article Actions */}
                    <div className="flex flex-col gap-3 items-end">
                      {/* Regular ContentActions */}
                      <div className="flex flex-col gap-2">
                        <span className="text-xs text-gray-500">عملیات عادی:</span>
                        <ContentActions 
                          articleId={article.id} 
                          title={article.title}
                        />
                      </div>
                      
                      {/* Enhanced ContentActions */}
                      <div className="flex flex-col gap-2">
                        <span className="text-xs text-gray-500">عملیات پیشرفته:</span>
                        <EnhancedContentActions 
                          contentId={article.id}
                          contentType="article"
                          title={article.title}
                        />
                      </div>

                      {/* Link to Article */}
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/content/articles/${article.id}`}>
                          مشاهده مقاله
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Bookmarks Summary */}
      {bookmarks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>خلاصه بوکمارک‌های شما</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {bookmarks.map((bookmark) => (
                <div 
                  key={bookmark.id}
                  className="p-3 border rounded-lg bg-gray-50"
                >
                  <h4 className="font-medium text-sm line-clamp-1 mb-1">
                    {bookmark.article.title}
                  </h4>
                  <p className="text-xs text-gray-600">
                    بوکمارک شده در: {new Date(bookmark.created_at).toLocaleDateString('fa-IR')}
                  </p>
                  <Button asChild variant="link" size="sm" className="p-0 h-auto mt-1">
                    <Link to={`/content/articles/${bookmark.article.id}`}>
                      مشاهده →
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <Button asChild>
                <Link to="/bookmarks">مشاهده همه بوکمارک‌ها</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Info */}
      <Card>
        <CardHeader>
          <CardTitle>راهنمای تست</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">مراحل تست:</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>روی دکمه بوکمارک کلیک کنید</li>
                <li>پیام موفقیت را مشاهده کنید</li>
                <li>تغییر آیکون را ببینید</li>
                <li>به صفحه بوکمارک‌ها بروید</li>
                <li>مقاله بوکمارک شده را مشاهده کنید</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">ویژگی‌های پیاده‌سازی شده:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>✅ بوکمارک مقالات</li>
                <li>✅ حذف بوکمارک</li>
                <li>✅ مشاهده لیست بوکمارک‌ها</li>
                <li>✅ Real-time UI updates</li>
                <li>⏳ بوکمارک ویدیو (آینده)</li>
                <li>⏳ بوکمارک پادکست (آینده)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookmarkTestComponent; 