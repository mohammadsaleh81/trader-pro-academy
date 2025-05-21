
import React, { useState, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import MobileNavigation from "./MobileNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
  initialLoading?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  fullWidth = false, 
  initialLoading = false 
}) => {
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(initialLoading);

  useEffect(() => {
    if (initialLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [initialLoading]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" dir="rtl">
      <Header />
      <main className={`flex-1 pb-20 px-4 sm:px-6 ${!fullWidth && "max-w-7xl mx-auto w-full"}`}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[50vh]">
            <Loader className="h-12 w-12 text-trader-500 animate-spin mb-4" />
            <p className="text-lg font-medium text-gray-600">در حال بارگیری...</p>
          </div>
        ) : (
          children
        )}
      </main>
      <Footer />
      {isMobile && <MobileNavigation />}
    </div>
  );
};

export default Layout;
