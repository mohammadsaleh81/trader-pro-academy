
import React from "react";
import CourseCard from "./CourseCard";
import { Course } from "@/contexts/DataContext";

type CourseListProps = {
  courses: Course[];
  title?: string;
  showProgress?: boolean;
};

const CourseList: React.FC<CourseListProps> = ({ 
  courses, 
  title, 
  showProgress = false 
}) => {
  return (
    <div className="my-6">
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          {courses.length > 4 && (
            <a href="#" className="text-trader-500 text-sm">
              مشاهده همه
            </a>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            id={course.id}
            title={course.title}
            instructor={course.instructor}
            thumbnail={course.thumbnail}
            price={course.price}
            rating={course.rating}
            progress={showProgress && course.completedLessons !== undefined 
              ? Math.round((course.completedLessons / course.totalLessons) * 100) 
              : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default CourseList;
