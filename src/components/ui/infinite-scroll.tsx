import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { PaginationState } from "@/types/pagination";

interface InfiniteScrollProps {
  pagination: PaginationState;
  onLoadMore: () => void;
  isLoading: boolean;
  className?: string;
  loadMoreText?: string;
  noMoreText?: string;
  autoLoad?: boolean;
  threshold?: number;
}

const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  pagination,
  onLoadMore,
  isLoading,
  className,
  loadMoreText = "بارگذاری بیشتر",
  noMoreText = "همه موارد نمایش داده شد",
  autoLoad = true,
  threshold = 200
}) => {
  const [hasTriggered, setHasTriggered] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoLoad || !pagination.hasNext || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasTriggered) {
          setHasTriggered(true);
          onLoadMore();
        }
      },
      {
        rootMargin: `${threshold}px`,
        threshold: 0.1
      }
    );

    const currentRef = triggerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [autoLoad, pagination.hasNext, isLoading, hasTriggered, onLoadMore, threshold]);

  // Reset trigger when page changes
  useEffect(() => {
    setHasTriggered(false);
  }, [pagination.currentPage]);

  if (!pagination.hasNext && pagination.currentPage > 1) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <p className="text-sm text-gray-500">{noMoreText}</p>
        <p className="text-xs text-gray-400 mt-1">
          نمایش {pagination.totalCount.toLocaleString('fa-IR')} مورد از مجموع
        </p>
      </div>
    );
  }

  return (
    <div className={`text-center py-6 ${className}`} ref={triggerRef}>
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-gray-600">در حال بارگذاری...</span>
        </div>
      ) : pagination.hasNext ? (
        autoLoad ? (
          <div className="text-xs text-gray-400">
            اسکرول کنید تا موارد بیشتری بارگذاری شود
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {loadMoreText}
          </Button>
        )
      ) : null}
    </div>
  );
};

export default InfiniteScroll; 