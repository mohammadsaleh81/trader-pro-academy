
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Bookmark, Calendar, FileText, Headphones, Home, User, Video } from "lucide-react";
import { cn } from "@/lib/utils";

const MobileNavigation: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] h-16 z-50">
      <div className="grid grid-cols-5 h-full">
        <Link 
          to="/" 
          className={cn(
            "flex flex-col items-center justify-center text-xs",
            isActive("/") ? "text-trader-500" : "text-gray-500"
          )}
        >
          <Home className="h-5 w-5 mb-1" />
          <span>خانه</span>
        </Link>
        
        <Link 
          to="/content" 
          className={cn(
            "flex flex-col items-center justify-center text-xs",
            isActive("/content") ? "text-trader-500" : "text-gray-500"
          )}
        >
          <FileText className="h-5 w-5 mb-1" />
          <span>محتوا</span>
        </Link>
        
        <Link 
          to="/my-courses" 
          className={cn(
            "flex flex-col items-center justify-center text-xs",
            isActive("/my-courses") ? "text-trader-500" : "text-gray-500"
          )}
        >
          <Calendar className="h-5 w-5 mb-1" />
          <span>دوره‌های من</span>
        </Link>
        
        <Link 
          to="/bookmarks" 
          className={cn(
            "flex flex-col items-center justify-center text-xs",
            isActive("/bookmarks") ? "text-trader-500" : "text-gray-500"
          )}
        >
          <Bookmark className="h-5 w-5 mb-1" />
          <span>نشان‌ها</span>
        </Link>
        
        <Link 
          to="/profile" 
          className={cn(
            "flex flex-col items-center justify-center text-xs",
            isActive("/profile") ? "text-trader-500" : "text-gray-500"
          )}
        >
          <User className="h-5 w-5 mb-1" />
          <span>پروفایل</span>
        </Link>
      </div>
    </nav>
  );
};

export default MobileNavigation;
