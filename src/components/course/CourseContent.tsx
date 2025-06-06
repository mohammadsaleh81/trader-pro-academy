
import React from "react";
import CourseChaptersList from "./CourseChaptersList";
import { CourseDetails } from "@/types/course";
import { useIsMobile } from "@/hooks/use-mobile";

interface CourseContentProps {
  courseData: CourseDetails;
}

const CourseContent: React.FC<CourseContentProps> = ({ courseData }) => {
  const isMobile = useIsMobile();

  return (
    <div className={`bg-white rounded-lg shadow-sm ${isMobile ? 'p-3 sm:p-4' : 'p-6'}`}>
      <CourseChaptersList chapters={courseData.chapters} />
    </div>
  );
};

export default CourseContent;
