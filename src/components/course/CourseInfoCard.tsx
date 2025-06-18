import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader, Play, Clock, BookOpen, Award, Shield, Users } from "lucide-react";
import { CourseDetails } from "@/contexts/DataContext";
import ProgressCircle from "@/components/ui/progress-circle";
import { formatPrice, formatCurrency } from "@/utils/currency";
import { Badge } from "@/components/ui/badge";
import { getCapacityStatus, canPurchaseCourse } from "@/lib/utils";

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
  const userProgress = courseData.user_progress;
  const capacityStatus = getCapacityStatus(courseData.info);
  const canPurchase = canPurchaseCourse(courseData.info);

  return (
    <Card className="sticky top-8">
      <CardContent className="p-6">
        {/* Course Thumbnail */}
        <div className="mb-6">
          <img
            src={courseData.info.thumbnail}
            alt={courseData.info.title}
            className="w-full h-48 object-contain rounded-lg bg-gray-50"
          />
          {courseData.info.requires_identity_verification && !isEnrolled && (
            <div className="mt-3 flex justify-center">
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                <Shield className="h-4 w-4 ml-1" />
                نیاز به احراز هویت
              </Badge>
            </div>
          )}
          {/* Capacity Status Badge */}
          {courseData.info.has_capacity_limit && (
            <div className="mt-3 flex justify-center">
              <Badge 
                variant="secondary" 
                className={`${
                  capacityStatus.color === 'red' 
                    ? 'bg-red-100 text-red-800 border-red-200' 
                    : capacityStatus.color === 'orange'
                    ? 'bg-orange-100 text-orange-800 border-orange-200'
                    : 'bg-blue-100 text-blue-800 border-blue-200'
                }`}
              >
                <Users className="h-4 w-4 ml-1" />
                {capacityStatus.text}
              </Badge>
            </div>
          )}
        </div>

        {/* Price or Progress */}
        <div className="mb-6">
          {isEnrolled ? (
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <ProgressCircle
                  percentage={userProgress?.course_progress.completion_percentage || 0}
                  size={80}
                  strokeWidth={8}
                  color="text-green-600"
                  backgroundColor="text-gray-200"
                />
              </div>
              <p className="text-sm text-gray-600 mb-2">
                پیشرفت کلی دوره
              </p>
              <p className="text-2xl font-bold text-green-600">
                {userProgress?.course_progress.completion_percentage || 0}%
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-4">
                {isFree ? (
                  <div className="text-4xl font-bold text-green-600">رایگان</div>
                ) : (
                  <div>
                    <div className="text-4xl font-bold text-trader-600">
                      {formatPrice(coursePrice)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">تومان</div>
                  </div>
                )}
              </div>
              
              {/* Capacity Information */}
              {courseData.info.has_capacity_limit && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">ظرفیت دوره:</span>
                    <span className={`font-medium ${
                      capacityStatus.color === 'red' 
                        ? 'text-red-600' 
                        : capacityStatus.color === 'orange'
                        ? 'text-orange-600'
                        : 'text-blue-600'
                    }`}>
                      {capacityStatus.text}
                    </span>
                  </div>
                  {courseData.info.capacity && courseData.info.available_spots !== undefined && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>تعداد دانشجویان: {courseData.info.student_count || (courseData.info.capacity - courseData.info.available_spots)}</span>
                        <span>ظرفیت کل: {courseData.info.capacity}</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            capacityStatus.color === 'red' 
                              ? 'bg-red-500' 
                              : capacityStatus.color === 'orange'
                              ? 'bg-orange-500'
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${((courseData.info.capacity - courseData.info.available_spots) / courseData.info.capacity) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mb-6">
          {isEnrolled ? (
            <Button
              className="w-full py-3 bg-green-600 hover:bg-green-700"
              onClick={() => navigate(`/learn/${courseData.info.id}`)}
            >
              <Play className="h-4 w-4 ml-2" />
              ادامه یادگیری
            </Button>
          ) : (
            <Button
              className="w-full py-3 bg-trader-600 hover:bg-trader-700"
              onClick={isFree ? onEnroll : onPurchase}
              disabled={isProcessing || !canPurchase}
            >
              {isProcessing ? (
                <Loader className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 ml-2" />
                  {!canPurchase 
                    ? "ظرفیت تکمیل شده"
                    : isFree 
                      ? "ثبت‌نام در دوره رایگان" 
                      : "خرید دوره"
                  }
                </>
              )}
            </Button>
          )}
        </div>

        {/* Additional Info */}
        <div className="text-center text-sm text-gray-600 border-t pt-4">
          {isEnrolled ? (
            <div className="flex items-center justify-center text-green-600">
              <Award className="h-4 w-4 ml-1" />
              دسترسی مادام‌العمر فعال
            </div>
          ) : (
            "پشتیبانی و دسترسی مادام‌العمر"
          )}
        </div>

        {/* Course Details */}
        <div className="mt-6 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">تعداد فصل‌ها:</span>
            <span className="font-medium">{courseData.info.total_chapters}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">تعداد درس‌ها:</span>
            <span className="font-medium">{courseData.info.total_lessons}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">مدت زمان:</span>
            <span className="font-medium">{courseData.info.total_duration} دقیقه</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">سطح:</span>
            <span className="font-medium">{courseData.info.level}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">زبان:</span>
            <span className="font-medium">{courseData.info.language}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">تعداد دانشجویان:</span>
            <span className="font-medium">{courseData.info.total_students}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseInfoCard;
