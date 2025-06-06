
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, ShoppingCart, Loader } from "lucide-react";
import { CourseDetails } from "@/contexts/DataContext";

interface CourseMobileActionsProps {
  courseData: CourseDetails;
  isEnrolled: boolean;
  isProcessing: boolean;
  isFree: boolean;
  coursePrice: number;
  onPurchase: () => void;
  onEnroll: () => void;
}

const CourseMobileActions: React.FC<CourseMobileActionsProps> = ({
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
    <div className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-border p-4 z-30 sm:hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="text-right">
          <div className="text-lg font-bold text-orange-600">
            {isFree ? "رایگان" : `${coursePrice.toLocaleString()} تومان`}
          </div>
          <div className="text-xs text-gray-600">
            {courseData.info.total_lessons} درس • {Math.floor(courseData.info.total_duration / 60)} دقیقه
          </div>
        </div>
      </div>

      {isEnrolled ? (
        <Button
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium"
          onClick={() => navigate(`/learn/${courseData.info.id}`)}
        >
          <Play className="h-4 w-4 ml-2" />
          ادامه یادگیری
        </Button>
      ) : (
        <Button
          className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium"
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
  );
};

export default CourseMobileActions;
