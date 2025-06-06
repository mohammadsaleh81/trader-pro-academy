import React from "react";
import { cn } from "@/lib/utils";

interface ProgressCircleProps {
  percentage: number;
  size?: "sm" | "md" | "lg";
  strokeWidth?: number;
  className?: string;
  showText?: boolean;
  color?: string;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({
  percentage,
  size = "md",
  strokeWidth = 8,
  className,
  showText = true,
  color = "text-orange-600"
}) => {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32
  };

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const sizeInRem = sizeMap[size];

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg 
        className={cn("transform -rotate-90", `w-${sizeInRem} h-${sizeInRem}`)}
        style={{ width: `${sizeInRem * 0.25}rem`, height: `${sizeInRem * 0.25}rem` }}
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={cn(color, "transition-all duration-500")}
          strokeLinecap="round"
        />
      </svg>
      {showText && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-bold", color, {
            "text-xs": size === "sm",
            "text-sm": size === "md", 
            "text-lg": size === "lg"
          })}>
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressCircle; 