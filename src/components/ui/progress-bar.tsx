import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  percentage: number;
  height?: "sm" | "md" | "lg";
  color?: string;
  backgroundColor?: string;
  className?: string;
  showText?: boolean;
  animated?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  height = "sm",
  color = "bg-orange-500",
  backgroundColor = "bg-gray-200",
  className,
  showText = false,
  animated = true
}) => {
  const heightMap = {
    sm: "h-1",
    md: "h-2", 
    lg: "h-3"
  };

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("w-full rounded-full overflow-hidden", backgroundColor, heightMap[height])}>
        <div 
          className={cn(
            "h-full rounded-full",
            color,
            animated && "transition-all duration-300 ease-out"
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {showText && (
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-600">{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar; 