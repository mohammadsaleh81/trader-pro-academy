
import React from "react";
import CourseChaptersList from "./CourseChaptersList";
import CourseComments from "./CourseComments";
import { CourseDetails } from "@/contexts/DataContext";

interface CourseContentProps {
  courseData: CourseDetails;
}

const CourseContent: React.FC<CourseContentProps> = ({ courseData }) => {
  return (
    <div className="lg:col-span-2">
      <CourseChaptersList chapters={courseData.chapters} />
      <CourseComments comments={courseData.comments} />
    </div>
  );
};

export default CourseContent;
