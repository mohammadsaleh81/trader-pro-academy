import React from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCapacityStatus, canPurchaseCourse } from "@/lib/utils";
import { Users, AlertCircle, CheckCircle, Clock } from "lucide-react";

const CapacityTestPage: React.FC = () => {
  // Sample courses with different capacity scenarios
  const sampleCourses = [
    {
      id: "1",
      title: "دوره بدون محدودیت ظرفیت",
      has_capacity_limit: false,
      capacity: null,
      available_spots: null,
      is_full: false,
      student_count: 150
    },
    {
      id: "2",
      title: "دوره با ظرفیت خالی",
      has_capacity_limit: true,
      capacity: 100,
      available_spots: 75,
      is_full: false,
      student_count: 25
    },
    {
      id: "3",
      title: "دوره با ظرفیت تقریباً پر",
      has_capacity_limit: true,
      capacity: 50,
      available_spots: 5,
      is_full: false,
      student_count: 45
    },
    {
      id: "4",
      title: "دوره با ظرفیت تکمیل شده",
      has_capacity_limit: true,
      capacity: 30,
      available_spots: 0,
      is_full: true,
      student_count: 30
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-4">تست سیستم ظرفیت محدود دوره‌ها</h1>
          <p className="text-gray-600 text-center">
            این صفحه برای نمایش قابلیت‌های جدید سیستم ظرفیت محدود طراحی شده است
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sampleCourses.map((course) => {
            const capacityStatus = getCapacityStatus(course);
            const canPurchase = canPurchaseCourse(course);
            const fillPercentage = course.capacity 
              ? ((course.capacity - (course.available_spots || 0)) / course.capacity) * 100 
              : 0;

            return (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className={`${
                        capacityStatus.color === 'red' 
                          ? 'bg-red-100 text-red-800 border-red-200' 
                          : capacityStatus.color === 'orange'
                          ? 'bg-orange-100 text-orange-800 border-orange-200'
                          : capacityStatus.color === 'green'
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-blue-100 text-blue-800 border-blue-200'
                      }`}
                    >
                      <Users className="h-3 w-3 ml-1" />
                      {capacityStatus.text}
                    </Badge>
                    {canPurchase ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {course.has_capacity_limit ? (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">ظرفیت کل:</span>
                          <span className="font-medium">{course.capacity}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">جای خالی:</span>
                          <span className="font-medium">{course.available_spots}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">دانشجویان:</span>
                          <span className="font-medium">{course.student_count}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>درصد پر شدن</span>
                            <span>{Math.round(fillPercentage)}%</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                fillPercentage > 80 
                                  ? 'bg-red-500' 
                                  : fillPercentage > 60
                                  ? 'bg-orange-500'
                                  : 'bg-blue-500'
                              }`}
                              style={{ width: `${fillPercentage}%` }}
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">بدون محدودیت ظرفیت</p>
                      </div>
                    )}
                    
                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">وضعیت خرید:</span>
                        <span className={`font-medium ${
                          canPurchase ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {canPurchase ? 'قابل خرید' : 'غیرقابل خرید'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>راهنمای رنگ‌بندی ظرفیت</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-green-800">سبز</p>
                    <p className="text-sm text-green-600">ظرفیت خالی یا بدون محدودیت</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-orange-800">نارنجی</p>
                    <p className="text-sm text-orange-600">ظرفیت تقریباً پر (بیش از 80%)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-red-800">قرمز</p>
                    <p className="text-sm text-red-600">ظرفیت تکمیل شده</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>نکات پیاده‌سازی</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">1. چک کردن ظرفیت قبل از خرید:</h4>
                  <p className="text-sm text-gray-600">
                    قبل از هر عملیات خرید، سیستم ظرفیت دوره را بررسی می‌کند و در صورت تکمیل بودن، 
                    پیام مناسب نمایش داده می‌شود.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">2. نمایش وضعیت ظرفیت:</h4>
                  <p className="text-sm text-gray-600">
                    در کارت‌های دوره، وضعیت ظرفیت با رنگ‌بندی مناسب نمایش داده می‌شود و 
                    درصد پر شدن دوره نیز نشان داده می‌شود.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">3. غیرفعال کردن دکمه خرید:</h4>
                  <p className="text-sm text-gray-600">
                    در صورت تکمیل بودن ظرفیت، دکمه خرید غیرفعال می‌شود و پیام "ظرفیت تکمیل شده" 
                    نمایش داده می‌شود.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">4. مدیریت خطاها:</h4>
                  <p className="text-sm text-gray-600">
                    خطاهای مربوط به ظرفیت از سرور دریافت شده و با پیام‌های مناسب فارسی 
                    به کاربر نمایش داده می‌شود.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CapacityTestPage; 