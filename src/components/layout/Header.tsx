
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, User, Wallet, X, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSearch } from "@/hooks/use-search";
import InstallButton from "@/components/ui/install-button";
import { PushNotificationButton } from "@/components/ui/push-notification-button";
import SearchResults from "@/components/ui/search-results";

const Header: React.FC = () => {
  const { user } = useAuth();
  const [isSearchActive, setIsSearchActive] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const isMobile = useIsMobile();
  const searchRef = useRef<HTMLDivElement>(null);
  const { query, setQuery, results, isLoading, error, clearSearch } = useSearch();

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Show results when there are search results or loading
  useEffect(() => {
    setShowResults(query.length > 0 && (results !== null || isLoading));
  }, [query, results, isLoading]);

  const handleSearchFocus = () => {
    if (query.length > 0) {
      setShowResults(true);
    }
  };

  const handleCloseSearch = () => {
    setIsSearchActive(false);
    clearSearch();
    setShowResults(false);
  };

  const handleCloseResults = () => {
    setShowResults(false);
  };

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
              <div ref={searchRef} className="relative w-full max-w-xs flex items-center">
                <input
                  type="text"
                  placeholder="جستجو..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={handleSearchFocus}
                  className="w-full border border-gray-200 rounded-full py-1.5 px-4 pr-10 pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-trader-500"
                />
                {isLoading ? (
                  <Loader2 className="absolute right-3 top-2 h-4 w-4 text-gray-400 animate-spin" />
                ) : (
                  <Search className="absolute right-3 top-2 h-4 w-4 text-gray-400" />
                )}
                {query && (
                  <button
                    onClick={handleCloseSearch}
                    className="absolute left-2 top-1.5 p-0.5 text-gray-400 hover:text-gray-600"
                    aria-label="پاک کردن جستجو"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
                
                {/* Search Results */}
                {showResults && (
                  <>
                    {error ? (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 p-4 z-50">
                        <p className="text-red-500 text-center text-sm">{error}</p>
                      </div>
                    ) : isLoading ? (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 p-4 z-50">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-trader-600" />
                          <span className="text-sm text-gray-600">در حال جستجو...</span>
                        </div>
                      </div>
                    ) : results ? (
                      <SearchResults results={results} onClose={handleCloseResults} />
                    ) : null}
                  </>
                )}
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
              <PushNotificationButton 
                variant="ghost" 
                size="sm" 
                showText={false}
              />
            )}
            
            <InstallButton 
              variant="ghost" 
              size="sm" 
              showText={false}
            />
            
            {user ? (
              <div className="flex items-center gap-1 sm:gap-3">
                {/* Wallet temporarily disabled */}
                {/* {!isMobile && (
                  <Link 
                    to="/wallet" 
                    className="text-gray-600 p-1.5 rounded-full hover:bg-gray-100"
                    aria-label="کیف پول"
                  >
                    <Wallet className="h-5 w-5" />
                  </Link>
                )} */}
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
