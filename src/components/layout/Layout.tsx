
import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import MobileNavigation from "./MobileNavigation";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, fullWidth = false }) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" dir="rtl">
      <Header />
      <main className={`flex-1 pb-20 ${!fullWidth && "max-w-7xl mx-auto w-full"}`}>
        {children}
      </main>
      <Footer />
      {isMobile && <MobileNavigation />}
    </div>
  );
};

export default Layout;
