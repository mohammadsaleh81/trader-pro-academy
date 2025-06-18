import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { PaginationState } from "@/types/pagination";
import { cn } from "@/lib/utils";

interface PaginationControlsProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  className?: string;
  showSummary?: boolean;
  itemsName?: string;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  pagination,
  onPageChange,
  isLoading = false,
  className,
  showSummary = true,
  itemsName = "مورد"
}) => {
  const { currentPage, totalPages, totalCount, hasNext, hasPrevious } = pagination;

  // If only one page or no data, don't show pagination
  if (totalPages <= 1 || totalCount === 0) {
    return null;
  }

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    const sidePages = Math.floor(maxVisiblePages / 2);

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      let startPage = Math.max(2, currentPage - sidePages);
      let endPage = Math.min(totalPages - 1, currentPage + sidePages);

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push('...');
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePageClick = (page: number) => {
    if (page !== currentPage && !isLoading) {
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    if (hasPrevious && !isLoading) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (hasNext && !isLoading) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Summary */}
      {showSummary && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
          <div className="text-sm text-gray-600">
            نمایش صفحه <span className="font-medium">{currentPage}</span> از{" "}
            <span className="font-medium">{totalPages}</span> صفحه
            {totalCount > 0 && (
              <>
                {" "}
                (<span className="font-medium">{totalCount.toLocaleString('fa-IR')}</span> {itemsName})
              </>
            )}
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={!hasPrevious || isLoading}
          className="flex items-center gap-1 min-w-[100px]"
        >
          <ChevronRight className="h-4 w-4" />
          قبلی
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <div
                  key={`ellipsis-${index}`}
                  className="flex items-center justify-center w-8 h-8"
                >
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </div>
              );
            }

            const pageNumber = page as number;
            const isActive = pageNumber === currentPage;

            return (
              <Button
                key={pageNumber}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageClick(pageNumber)}
                disabled={isLoading}
                className={cn(
                  "min-w-[32px] h-8 px-2",
                  isActive && "bg-trader-500 hover:bg-trader-600"
                )}
              >
                {pageNumber.toLocaleString('fa-IR')}
              </Button>
            );
          })}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={!hasNext || isLoading}
          className="flex items-center gap-1 min-w-[100px]"
        >
          بعدی
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile-friendly summary at bottom */}
      <div className="sm:hidden text-center text-xs text-gray-500 mt-3">
        صفحه {currentPage.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}
      </div>
    </div>
  );
};

export default PaginationControls; 