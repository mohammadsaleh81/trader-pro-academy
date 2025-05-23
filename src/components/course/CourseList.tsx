
import React from "react";
import CourseCard from "./CourseCard";
import CourseCardSkeleton from "./CourseCardSkeleton";
import { Course } from "@/contexts/DataContext";
import { cn } from "@/lib/utils";

type CourseListProps = {
  courses: Course[];
  title?: string;
  showProgress?: boolean;
  className?: string;
  isLoading?: boolean;
  skeletonCount?: number;
};

const CourseList: React.FC<CourseListProps> = ({ 
  courses, 
  title, 
  showProgress = false,
  className,
  isLoading = false,
  skeletonCount = 8
}) => {
  return (
    <div className={cn("my-4", className)}>
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          {courses.length > 4 && !isLoading && (
            <a href="#" className="text-trader-500 text-sm">
              مشاهده همه
            </a>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
        {isLoading 
          ? Array.from({ length: skeletonCount }).map((_, index) => (
              <CourseCardSkeleton key={`skeleton-${index}`} />
            ))
          : courses.map((course, index) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                instructor={course.instructor}
                thumbnail={course.thumbnail}
                price={course.price}
                rating={course.rating}
                isFree={index % 3 === 0} // Just for demo purposes to show some free courses
                progress={showProgress && course.completedLessons !== undefined 
                  ? Math.round((course.completedLessons / course.totalLessons) * 100) 
                  : undefined}
              />
            ))
        }
      </div>
    </div>
  );
};

export default CourseList;
