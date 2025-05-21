
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
    <header className="bg-white py-3 px-4 sm:px-6 shadow-sm sticky top-0 z-40">
      <div className="trader-container">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/970ac420-2fc4-450d-9177-b465e09c7857.png" 
              alt="Mr. Trader Academy" 
              className="h-8 sm:h-10 w-auto"
            />
          </Link>

          {/* Search and Actions */}
          <div className="flex items-center gap-1 sm:gap-3">
            {isSearchActive ? (
              <div className="relative w-full max-w-xs flex items-center">
                <input
                  type="text"
                  placeholder="جستجو..."
                  className="w-full border border-gray-200 rounded-full py-1.5 px-4 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-trader-500"
                  autoFocus
                />
                <Search className="absolute right-3 top-2 h-4 w-4 text-gray-400" />
                <button 
                  onClick={() => setIsSearchActive(false)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsSearchActive(true)} 
                className="text-gray-600 p-1.5 rounded-full hover:bg-gray-100"
                aria-label="جستجو"
              >
                <Search className="h-5 w-5" />
              </button>
            )}
            
            {!isMobile && (
              <button 
                className="text-gray-600 p-1.5 rounded-full hover:bg-gray-100"
                aria-label="اعلان‌ها"
              >
                <Bell className="h-5 w-5" />
              </button>
            )}
            
            {user ? (
              <div className="flex items-center gap-1 sm:gap-3">
                {!isMobile && (
                  <Link 
                    to="/wallet" 
                    className="text-gray-600 p-1.5 rounded-full hover:bg-gray-100"
                    aria-label="کیف پول"
                  >
                    <Wallet className="h-5 w-5" />
                  </Link>
                )}
                <Link to="/profile" className="flex items-center">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden">
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                </Link>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center p-1.5 rounded-full hover:bg-gray-100 text-gray-600"
                aria-label="ورود"
              >
                <User className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
