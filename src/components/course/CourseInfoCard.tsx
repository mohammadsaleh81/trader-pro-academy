
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader } from "lucide-react";
import { CourseDetails } from "@/contexts/DataContext";

interface CourseInfoCardProps {
  courseData: CourseDetails;
  isEnrolled: boolean;
  isProcessing: boolean;
  isFree: boolean;
  coursePrice: number;
  onPurchase: () => void;
  onEnroll: () => void;
}

const CourseInfoCard: React.FC<CourseInfoCardProps> = ({
  courseData,
  isEnrolled,
  isProcessing,
  isFree,
  coursePrice,
  onPurchase,
  onEnroll
}) => {
  const navigate = useNavigate();

  return (
    <Card className="sticky top-8">
      <CardContent className="p-6">
        {/* Course Thumbnail */}
        <div className="mb-6">
          <img
            src={courseData.info.thumbnail}
            alt={courseData.info.title}
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>

        {/* Price */}
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-orange-600" dir="rtl">
            {isFree ? "رایگان" : `${coursePrice.toLocaleString()} تومان`}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-center">
          <div>
            <div className="text-2xl font-bold text-orange-600">{courseData.info.total_lessons}</div>
            <div className="text-sm text-gray-600">درس</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{Math.floor(courseData.info.total_duration / 60)}</div>
            <div className="text-sm text-gray-600">ساعت</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{courseData.info.total_chapters}</div>
            <div className="text-sm text-gray-600">سرفصل</div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mb-6">
          {isEnrolled ? (
            <Button
              variant="outline"
              className="w-full py-3"
              onClick={() => navigate(`/learn/${courseData.info.id}`)}
            >
              ادامه یادگیری
            </Button>
          ) : (
            <Button
              className="w-full py-3 bg-orange-600 hover:bg-orange-700"
              onClick={isFree ? onEnroll : onPurchase}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 ml-2" />
                  {isFree ? "ثبت‌نام رایگان" : "خرید دوره"}
                </>
              )}
            </Button>
          )}
        </div>

        {/* Additional Info */}
        <div className="text-center text-sm text-gray-600 border-t pt-4">
          پشتیبانی و دسترسی مادام‌العمر
        </div>

        {/* Course Details */}
        <div className="mt-8 space-y-4 border-t pt-6">
          <h3 className="font-bold text-lg text-right">اطلاعات دوره</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">مدرس:</span>
              <span className="font-medium">{courseData.info.instructor}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">سطح دوره:</span>
              <span className="font-medium">
                {courseData.info.level === 'beginner' ? 'مقدماتی' : 
                 courseData.info.level === 'intermediate' ? 'متوسط' : 'پیشرفته'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">تاریخ بروزرسانی:</span>
              <span className="font-medium">{new Date(courseData.info.updated_at).toLocaleDateString('fa-IR')}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">تعداد دانشجو:</span>
              <span className="font-medium">{courseData.info.total_students?.toLocaleString() || '0'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseInfoCard;
