import React from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { 
  HomeIcon, 
  PlantsIcon, 
  CameraIcon, 
  TasksIcon, 
  ProfileIcon 
} from "@/lib/icons";

interface BottomNavigationProps {
  className?: string;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  className
}) => {
  const [location] = useLocation();
  
  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };
  
  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 flex justify-center z-50",
      className
    )}>
      <div className="app-container bg-white rounded-t-2xl shadow-lg flex justify-around py-3 px-4">
        <Link href="/">
          <div className="p-2 flex flex-col items-center cursor-pointer">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              isActive("/") ? "bg-mint-light" : "bg-muted"
            )}>
              <HomeIcon className={isActive("/") ? "text-accent-foreground" : "text-muted-foreground"} />
            </div>
            <span className={cn(
              "text-xs mt-1",
              isActive("/") ? "text-foreground" : "text-muted-foreground"
            )}>
              Home
            </span>
          </div>
        </Link>
        
        <Link href="/plants">
          <div className="p-2 flex flex-col items-center cursor-pointer">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              isActive("/plants") ? "bg-mint-light" : "bg-muted"
            )}>
              <PlantsIcon className={isActive("/plants") ? "text-accent-foreground" : "text-muted-foreground"} />
            </div>
            <span className={cn(
              "text-xs mt-1",
              isActive("/plants") ? "text-foreground" : "text-muted-foreground"
            )}>
              My Plants
            </span>
          </div>
        </Link>
        
        <Link href="/identify">
          <div className="p-2 flex flex-col items-center cursor-pointer">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center -mt-7 shadow-md">
              <CameraIcon className="text-white text-xl" />
            </div>
            <span className={cn(
              "text-xs mt-1",
              isActive("/identify") ? "text-foreground" : "text-muted-foreground"
            )}>
              Identify
            </span>
          </div>
        </Link>
        
        <Link href="/tasks">
          <div className="p-2 flex flex-col items-center cursor-pointer">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              isActive("/tasks") ? "bg-mint-light" : "bg-muted"
            )}>
              <TasksIcon className={isActive("/tasks") ? "text-accent-foreground" : "text-muted-foreground"} />
            </div>
            <span className={cn(
              "text-xs mt-1",
              isActive("/tasks") ? "text-foreground" : "text-muted-foreground"
            )}>
              Tasks
            </span>
          </div>
        </Link>
        
        <Link href="/profile">
          <div className="p-2 flex flex-col items-center cursor-pointer">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              isActive("/profile") ? "bg-mint-light" : "bg-muted"
            )}>
              <ProfileIcon className={isActive("/profile") ? "text-accent-foreground" : "text-muted-foreground"} />
            </div>
            <span className={cn(
              "text-xs mt-1",
              isActive("/profile") ? "text-foreground" : "text-muted-foreground"
            )}>
              Profile
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default BottomNavigation;
