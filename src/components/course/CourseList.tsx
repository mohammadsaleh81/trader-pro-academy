
import React from "react";
import CourseCard from "./CourseCard";
import CourseCardSkeleton from "./CourseCardSkeleton";
import { Course } from "@/contexts/DataContext";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { idToString } from "@/utils/idConverter";

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
    <div className={cn("my-4 rtl-card-content", className)}>
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          {courses.length > 4 && !isLoading && (
            <Link to="/courses" className="text-trader-500 text-sm">
              مشاهده همه
            </Link>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
        {isLoading 
          ? Array.from({ length: skeletonCount }).map((_, index) => (
              <CourseCardSkeleton key={`skeleton-${index}`} />
            ))
          : courses.map((course) => {
              const instructor = course.instructor 
                ? (`${course.instructor.first_name || ''} ${course.instructor.last_name || ''}`).trim() || 'استاد ناشناس'
                : 'استاد ناشناس';
                
              const price = typeof course.price === 'string' ? course.price : String(course.price);
              const courseId = idToString(course.id);
              const progress = showProgress && course.completedLessons !== undefined && course.totalLessons !== undefined
                ? Math.round((course.completedLessons / course.totalLessons) * 100) 
                : undefined;
                
              return (
                <CourseCard
                  key={courseId}
                  id={courseId}
                  title={course.title}
                  instructor={instructor}
                  thumbnail={course.thumbnail}
                  price={price}
                  rating={course.rating || 4.5}
                  isFree={course.is_free}
                  progress={progress}
                />
              );
            })
        }
      </div>
    </div>
  );
};

export default CourseList;
