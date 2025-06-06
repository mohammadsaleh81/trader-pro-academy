
import React, { useState, useEffect } from "react";
import Header from "./Header";
import MobileNavigation from "./MobileNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader } from "lucide-react";
import ErrorBoundary from "@/components/error/ErrorBoundary";

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
  const [mounted, setMounted] = useState(false);
  const [browserInfo, setBrowserInfo] = useState({
    isFirefox: false,
    isSafari: false,
    isIE: false,
    isEdge: false
  });

  useEffect(() => {
    setMounted(true);
    
    // Detect browser types
    const userAgent = window.navigator.userAgent.toLowerCase();
    setBrowserInfo({
      isFirefox: userAgent.indexOf('firefox') > -1,
      isSafari: userAgent.indexOf('safari') > -1 && userAgent.indexOf('chrome') === -1,
      isIE: userAgent.indexOf('trident') > -1,
      isEdge: userAgent.indexOf('edge') > -1 || userAgent.indexOf('edg/') > -1
    });
    
    if (initialLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [initialLoading]);

  // Enhanced touch optimizations
  useEffect(() => {
    if (isMobile) {
      document.documentElement.classList.add('touch-device');
      
      const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
      interactiveElements.forEach(el => {
        el.classList.add('touch-target');
        
        el.addEventListener('touchstart', () => {
          el.classList.add('touch-active');
        }, { passive: true });
        
        el.addEventListener('touchend', () => {
          setTimeout(() => el.classList.remove('touch-active'), 150);
        }, { passive: true });
      });
    }
    
    return () => {
      document.documentElement.classList.remove('touch-device');
      
      const interactiveElements = document.querySelectorAll('.touch-target');
      interactiveElements.forEach(el => {
        el.classList.remove('touch-target', 'touch-active');
      });
    };
  }, [isMobile]);

  // Add browser-specific classes
  useEffect(() => {
    if (browserInfo.isFirefox) {
      document.documentElement.classList.add('firefox');
    }
    if (browserInfo.isSafari) {
      document.documentElement.classList.add('safari');
    }
    if (browserInfo.isIE || browserInfo.isEdge) {
      document.documentElement.classList.add('ms-browser');
    }

    return () => {
      document.documentElement.classList.remove('firefox', 'safari', 'ms-browser');
    };
  }, [browserInfo]);

  return (
    <ErrorBoundary>
      <div className={`flex flex-col min-h-screen bg-background transition-colors duration-300 ${browserInfo.isSafari ? 'safari-flex-fix' : ''}`} dir="rtl">
        <Header />
        <main className={`flex-1 pb-20 px-4 sm:px-6 transition-all duration-300 ${!fullWidth && "max-w-7xl mx-auto w-full"}`}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[50vh] animate-fade-in">
              <Loader className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-lg font-medium text-muted-foreground">در حال بارگیری...</p>
            </div>
          ) : (
            <div className={mounted ? "page-transition" : ""}>
              {children}
            </div>
          )}
        </main>
        {isMobile && <MobileNavigation />}
      </div>
    </ErrorBoundary>
  );
};

export default Layout;
