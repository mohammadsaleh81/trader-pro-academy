
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Bookmark, Home, User, FileText, Video } from "lucide-react";
import { cn } from "@/lib/utils";

const MobileNavigation: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] h-16 z-50 border-t border-border transition-all duration-300">
      <div className="grid grid-cols-5 h-full">
        <Link 
          to="/" 
          className={cn(
            "flex flex-col items-center justify-center text-xs min-h-[44px] transition-all duration-300 hover:scale-110 group",
            isActive("/") ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <div className={cn(
            "transition-all duration-300 rounded-lg p-1",
            isActive("/") ? "bg-primary/10" : "group-hover:bg-accent"
          )}>
            <Home className="h-5 w-5 mb-1" />
          </div>
          <span className={cn(
            "transition-all duration-300",
            isActive("/") ? "font-medium" : ""
          )}>خانه</span>
        </Link>
        
        <Link 
          to="/content" 
          className={cn(
            "flex flex-col items-center justify-center text-xs min-h-[44px] transition-all duration-300 hover:scale-110 group",
            isActive("/content") ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <div className={cn(
            "transition-all duration-300 rounded-lg p-1",
            isActive("/content") ? "bg-primary/10" : "group-hover:bg-accent"
          )}>
            <FileText className="h-5 w-5 mb-1" />
          </div>
          <span className={cn(
            "transition-all duration-300",
            isActive("/content") ? "font-medium" : ""
          )}>محتوا</span>
        </Link>
        
        <Link 
          to="/my-courses" 
          className={cn(
            "flex flex-col items-center justify-center text-xs min-h-[44px] transition-all duration-300 hover:scale-110 group",
            isActive("/my-courses") ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <div className={cn(
            "transition-all duration-300 rounded-lg p-1",
            isActive("/my-courses") ? "bg-primary/10" : "group-hover:bg-accent"
          )}>
            <Video className="h-5 w-5 mb-1" />
          </div>
          <span className={cn(
            "transition-all duration-300",
            isActive("/my-courses") ? "font-medium" : ""
          )}>دوره‌های من</span>
        </Link>
        
        <Link 
          to="/bookmarks" 
          className={cn(
            "flex flex-col items-center justify-center text-xs min-h-[44px] transition-all duration-300 hover:scale-110 group",
            isActive("/bookmarks") ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <div className={cn(
            "transition-all duration-300 rounded-lg p-1",
            isActive("/bookmarks") ? "bg-primary/10" : "group-hover:bg-accent"
          )}>
            <Bookmark className="h-5 w-5 mb-1" />
          </div>
          <span className={cn(
            "transition-all duration-300",
            isActive("/bookmarks") ? "font-medium" : ""
          )}>نشان‌ها</span>
        </Link>
        
        <Link 
          to="/profile" 
          className={cn(
            "flex flex-col items-center justify-center text-xs min-h-[44px] transition-all duration-300 hover:scale-110 group",
            isActive("/profile") ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <div className={cn(
            "transition-all duration-300 rounded-lg p-1",
            isActive("/profile") ? "bg-primary/10" : "group-hover:bg-accent"
          )}>
            <User className="h-5 w-5 mb-1" />
          </div>
          <span className={cn(
            "transition-all duration-300",
            isActive("/profile") ? "font-medium" : ""
          )}>پروفایل</span>
        </Link>
      </div>
    </nav>
  );
};

export default MobileNavigation;
