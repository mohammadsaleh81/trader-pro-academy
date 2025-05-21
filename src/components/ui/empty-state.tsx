
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
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-xl shadow-sm", className)}>
      <div className="text-gray-300 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 mb-4 max-w-md">{description}</p>
      )}
      {action}
    </div>
  );
};
