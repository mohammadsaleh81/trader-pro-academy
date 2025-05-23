
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ContentCardSkeletonProps {
  className?: string;
}

export const ContentCardSkeleton: React.FC<ContentCardSkeletonProps> = ({ className }) => {
  return (
    <div className={cn("trader-card flex flex-col h-full overflow-hidden", className)}>
      <Skeleton className="w-full h-48 min-h-[120px]" />
      <div className="w-full p-4 flex flex-col relative flex-grow">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-3" />
        
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
    </div>
  );
};

export default ContentCardSkeleton;
