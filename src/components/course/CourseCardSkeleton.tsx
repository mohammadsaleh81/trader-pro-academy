
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const CourseCardSkeleton: React.FC = () => {
  return (
    <div className="trader-card h-full flex flex-col">
      <Skeleton className="h-44 w-full rounded-t-xl" />
      <div className="p-3 flex-1 flex flex-col">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-3" />
        <div className="mt-auto">
          <div className="flex justify-between mb-2">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default CourseCardSkeleton;
