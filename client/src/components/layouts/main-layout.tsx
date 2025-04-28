import React from "react";
import BottomNavigation from "@/components/ui/bottom-navigation";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
  hideNavigation?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  className,
  hideNavigation = false
}) => {
  return (
    <div className="bg-background min-h-screen">
      <div className="app-container mx-auto pb-20 relative min-h-screen">
        <div className={cn("px-4", className)}>
          {children}
        </div>
        
        {!hideNavigation && <BottomNavigation />}
      </div>
    </div>
  );
};

export default MainLayout;
