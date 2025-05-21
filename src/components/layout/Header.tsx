
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, User, Wallet, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const Header: React.FC = () => {
  const { user } = useAuth();
  const [isSearchActive, setIsSearchActive] = useState(false);

  return (
    <header className="bg-white py-3 px-4 shadow-sm sticky top-0 z-40">
      <div className="trader-container">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-trader-500">Mr. Trader</span>
            <span className="text-sm text-gray-600 mr-1">Academy</span>
          </Link>

          {/* Search and Actions */}
          <div className="flex items-center gap-3">
            {isSearchActive ? (
              <div className="relative w-full max-w-xs">
                <input
                  type="text"
                  placeholder="جستجو..."
                  className="w-full border border-gray-200 rounded-full py-1.5 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-trader-500"
                />
                <Search className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
              </div>
            ) : (
              <button onClick={() => setIsSearchActive(true)} className="text-gray-600">
                <Search className="h-5 w-5" />
              </button>
            )}
            
            <button className="text-gray-600">
              <Bell className="h-5 w-5" />
            </button>
            
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/wallet" className="text-gray-600">
                  <Wallet className="h-5 w-5" />
                </Link>
                <Link to="/profile" className="flex items-center">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden">
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                </Link>
              </div>
            ) : (
              <Link to="/login" className="flex items-center text-gray-600">
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
