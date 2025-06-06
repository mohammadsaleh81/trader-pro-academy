
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { CourseDetails } from "@/types/course";
import { useIsMobile } from "@/hooks/use-mobile";

interface CourseHeroProps {
  courseData: CourseDetails;
}

const CourseHero: React.FC<CourseHeroProps> = ({ courseData }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className={`relative ${isMobile ? 'h-48 sm:h-56' : 'h-80'} bg-gradient-to-r from-orange-500 to-orange-600 overflow-hidden`}>
      <div className="absolute inset-0 bg-black/30"></div>
      <img
        src={courseData.info.thumbnail}
        alt={courseData.info.title}
        className="w-full h-full object-cover opacity-80"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`text-center text-white px-4 ${isMobile ? 'max-w-sm' : 'max-w-2xl'}`}>
          <h1 className={`${isMobile ? 'text-lg sm:text-xl' : 'text-4xl'} font-bold mb-2 sm:mb-4 line-clamp-2`} dir="rtl">
            {courseData.info.title}
          </h1>
          <p className={`${isMobile ? 'text-sm' : 'text-xl'} opacity-90 line-clamp-2`} dir="rtl">
            {courseData.info.description}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        className={`absolute ${isMobile ? 'top-3 right-3 text-xs p-2' : 'top-6 right-6'} text-white hover:bg-white/20`}
        onClick={() => navigate("/courses")}
      >
        <ArrowRight size={isMobile ? 14 : 18} className="ml-1 sm:ml-2" />
        <span className="hidden sm:inline">بازگشت به لیست دوره‌ها</span>
        <span className="sm:hidden">بازگشت</span>
      </Button>
    </div>
  );
};

export default CourseHero;
