
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { CourseDetails } from "@/types/course";

interface CourseHeroProps {
  courseData: CourseDetails;
}

const CourseHero: React.FC<CourseHeroProps> = ({ courseData }) => {
  const navigate = useNavigate();

  return (
    <div className="relative h-48 bg-gradient-to-r from-trader-500 to-trader-600 overflow-hidden">
      <div className="absolute inset-0 bg-black/30"></div>
      <img
        src={courseData.info.thumbnail}
        alt={courseData.info.title}
        className="w-full h-full object-contain opacity-80 bg-gray-50"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white">
          {/* <h1 className="text-4xl font-bold mb-4" dir="rtl">{courseData.info.title}</h1> */}
          {/* <p className="text-xl opacity-90" dir="rtl">{courseData.info.description}</p> */}
        </div>
      </div>
      <Button
        variant="ghost"
        className="absolute top-6 right-6 text-white hover:bg-white/20"
        onClick={() => navigate("/courses")}
      >
        <ArrowRight size={18} className="ml-2" />
        <span>بازگشت به لیست دوره‌ها</span>
      </Button>
    </div>
  );
};

export default CourseHero;
