
import React from "react";
import Header from "./Header";
import MobileNavigation from "./MobileNavigation";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, fullWidth = false }) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className={`flex-1 pb-20 ${!fullWidth && "max-w-7xl mx-auto w-full"}`}>
        {children}
      </main>
      {isMobile && <MobileNavigation />}
    </div>
  );
};

export default Layout;
