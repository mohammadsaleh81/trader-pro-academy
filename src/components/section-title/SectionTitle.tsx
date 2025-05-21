
import React from "react";
import { cn } from "@/lib/utils";

type SectionTitleProps = {
  title: string;
  viewAllLink?: string;
  viewAllText?: string;
  className?: string;
  icon?: React.ReactNode;
};

const SectionTitle: React.FC<SectionTitleProps> = ({ 
  title, 
  viewAllLink, 
  viewAllText = "مشاهده همه",
  className,
  icon
}) => {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      <div className="flex items-center gap-2">
        {icon && icon}
        <h2 className="text-xl font-bold flex items-center gap-2">
          {title}
        </h2>
      </div>
      {viewAllLink && (
        <a href={viewAllLink} className="text-trader-500 text-sm flex items-center">
          {viewAllText}
        </a>
      )}
    </div>
  );
};

export default SectionTitle;
