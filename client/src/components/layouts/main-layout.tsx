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
        <div className="px-4 pl-[0px] pr-[0px] pt-[0px] pb-[0px]">
          {children}
        </div>
        
        {!hideNavigation && <BottomNavigation />}
      </div>
    </div>
  );
};

export default MainLayout;
