
import React from "react";
import Header from "./Header";
import MobileNavigation from "./MobileNavigation";

interface LayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, fullWidth = false }) => {
  // We're always in mobile mode now, so no need for the hook
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className={`flex-1 pb-20 ${!fullWidth && "max-w-[500px] mx-auto w-full"}`}>
        {children}
      </main>
      <MobileNavigation />
    </div>
  );
};

export default Layout;
