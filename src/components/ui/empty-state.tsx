
import React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300",
      className
    )}>
      <div className="text-gray-300 mb-4 animate-pulse-once transition-transform hover:scale-110 duration-300">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2 scale-in">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 mb-4 max-w-md fade-in">{description}</p>
      )}
      <div className="scale-in touch-manipulation" style={{ animationDelay: '200ms' }}>
        {action}
      </div>
    </div>
  );
};
