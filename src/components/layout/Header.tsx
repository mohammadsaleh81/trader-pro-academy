
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, User, Wallet, Bell, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const Header: React.FC = () => {
  const { user } = useAuth();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const isMobile = useIsMobile();

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 px-4 sm:px-6 shadow-sm sticky top-0 z-40 border-b border-border transition-all duration-300">
      <div className="trader-container">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img 
              src="/lovable-uploads/970ac420-2fc4-450d-9177-b465e09c7857.png" 
              alt="Mr. Trader Academy" 
              className="h-6 sm:h-8 md:h-10 w-auto transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Search and Actions */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
            {isSearchActive ? (
              <div className="relative w-full max-w-[200px] sm:max-w-xs flex items-center animate-fade-in">
                <input
                  type="text"
                  placeholder="جستجو..."
                  className="w-full border border-border bg-background rounded-full py-1 sm:py-1.5 px-3 sm:px-4 pr-6 sm:pr-8 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                  autoFocus
                />
                <Search className="absolute right-2 sm:right-3 top-1.5 sm:top-2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                <button 
                  onClick={() => setIsSearchActive(false)}
                  className="ml-1 sm:ml-2 text-muted-foreground hover:text-foreground transition-colors duration-200 p-1"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsSearchActive(true)} 
                className="text-muted-foreground hover:text-foreground p-1 sm:p-1.5 rounded-full hover:bg-accent transition-all duration-200 hover:scale-110 min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center"
                aria-label="جستجو"
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
            
            {!isMobile && (
              <button 
                className="text-muted-foreground hover:text-foreground p-1 sm:p-1.5 rounded-full hover:bg-accent transition-all duration-200 hover:scale-110 min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center"
                aria-label="اعلان‌ها"
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
            
            {user ? (
              <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
                {!isMobile && (
                  <Link 
                    to="/wallet" 
                    className="text-muted-foreground hover:text-foreground p-1 sm:p-1.5 rounded-full hover:bg-accent transition-all duration-200 hover:scale-110 min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center"
                    aria-label="کیف پول"
                  >
                    <Wallet className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                )}
                <Link to="/profile" className="flex items-center group">
                  <div className="relative w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-primary transition-all duration-300">
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  </div>
                </Link>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center p-1 sm:p-1.5 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110 min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px] justify-center"
                aria-label="ورود"
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
