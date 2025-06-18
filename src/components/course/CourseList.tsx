import React from "react";
import CourseCard from "./CourseCard";
import CourseCardSkeleton from "./CourseCardSkeleton";
import { Course } from "@/types/course";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
        {isLoading 
          ? Array.from({ length: skeletonCount }).map((_, index) => (
              <CourseCardSkeleton key={`skeleton-${index}`} />
            ))
          : courses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                instructor={course.instructor}
                thumbnail={course.thumbnail}
                price={course.price}
                isFree={course.price === 0}
                is_enrolled={course.is_enrolled}
                progress={showProgress && course.progress_percentage !== undefined 
                  ? Math.round(course.progress_percentage) 
                  : undefined}
                discounted_price={course.discounted_price}
                discount_percentage={course.discount_percentage}
                requires_identity_verification={course.requires_identity_verification}
              />
            ))
        }
      </div>
    </div>
  );
};

export default CourseList;
