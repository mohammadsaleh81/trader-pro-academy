
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader, Play, Clock, BookOpen, Award } from "lucide-react";
import { CourseDetails } from "@/types/course";

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

        {/* Price or Progress */}
        {isEnrolled ? (
          <div className="mb-6">
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-green-600 mb-2">دوره خریداری شده</div>
              <div className="text-sm text-gray-600">پیشرفت شما در این دوره</div>
            </div>
            
            {/* Progress Circle */}
            <div className="flex justify-center mb-4">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - (userProgress?.course_progress.completion_percentage || 0) / 100)}`}
                    className="text-orange-600"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-orange-600">
                    {Math.round(userProgress?.course_progress.completion_percentage || 0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Details */}
            <div className="space-y-3 text-sm bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center">
                  <BookOpen className="h-4 w-4 ml-1" />
                  دروس تکمیل شده:
                </span>
                <span className="font-medium">
                  {userProgress?.course_progress.completed_lessons || 0} از {courseData.info.total_lessons}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center">
                  <Clock className="h-4 w-4 ml-1" />
                  زمان مشاهده:
                </span>
                <span className="font-medium">
                  {Math.floor((userProgress?.course_progress.watched_duration || 0) / 60)} از {Math.floor(courseData.info.total_duration / 60)} دقیقه
                </span>
              </div>

              {userProgress?.next_lesson && (
                <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-sm text-orange-800 font-medium mb-1">درس بعدی:</div>
                  <div className="text-sm text-orange-700">{userProgress.next_lesson.title}</div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-orange-600" dir="rtl">
              {isFree ? "رایگان" : `${coursePrice.toLocaleString()} تومان`}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-center">
          <div>
            <div className="text-2xl font-bold text-orange-600">{courseData.info.total_lessons}</div>
            <div className="text-sm text-gray-600">درس</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{Math.floor(courseData.info.total_duration / 60)}</div>
            <div className="text-sm text-gray-600">دقیقه</div>
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
              className="w-full py-3 bg-green-600 hover:bg-green-700"
              onClick={() => navigate(`/learn/${courseData.info.id}`)}
            >
              <Play className="h-4 w-4 ml-2" />
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
                 courseData.info.level === 'intermediate' ? 'متوسط' : 
                 courseData.info.level === 'advanced' ? 'پیشرفته' : courseData.info.level}
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

            {courseData.info.get_average_rating && courseData.info.get_average_rating > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">امتیاز:</span>
                <span className="font-medium">{courseData.info.get_average_rating.toFixed(1)} از 5</span>
              </div>
            )}
          </div>
        </div>

        {/* Chapter Progress for Enrolled Users */}
        {isEnrolled && userProgress?.chapter_progress && userProgress.chapter_progress.length > 0 && (
          <div className="mt-8 space-y-4 border-t pt-6">
            <h3 className="font-bold text-lg text-right">پیشرفت فصل‌ها</h3>
            <div className="space-y-3">
              {userProgress.chapter_progress.map((chapter) => (
                <div key={chapter.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">{chapter.title}</span>
                    <span className="text-sm text-gray-600">{Math.round(chapter.progress_percentage)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 rounded-full transition-all duration-300"
                      style={{ width: `${chapter.progress_percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseInfoCard;
