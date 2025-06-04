
import React from "react";
import CourseChaptersList from "./CourseChaptersList";
import { CourseDetails } from "@/types/course";

interface CourseContentProps {
  courseData: CourseDetails;
}

const CourseContent: React.FC<CourseContentProps> = ({ courseData }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <CourseChaptersList chapters={courseData.chapters} />
    </div>
  );
};

export default CourseContent;
