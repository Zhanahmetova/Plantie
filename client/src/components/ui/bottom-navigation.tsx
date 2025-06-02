import React from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import {
  HomeIcon,
  PlusIcon,
  BookIcon,
  SettingsIcon,
  TasksIcon,
} from "@/lib/icons";
import { Bell } from "lucide-react";

interface BottomNavigationProps {
  className?: string;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ className }) => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 flex justify-center z-50",
        className,
      )}
    >
      <div className="app-container bg-white rounded-t-2xl shadow-lg flex justify-around py-3 px-4 w-full">
        <Link href="/">
          <div className="p-2 flex flex-col items-center cursor-pointer">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                isActive("/") ? "bg-mint-light" : "bg-muted",
              )}
            >
              <HomeIcon
                className={
                  isActive("/")
                    ? "text-accent-foreground"
                    : "text-muted-foreground"
                }
              />
            </div>
            {/* <span className={cn(
              "text-xs mt-1",
              isActive("/") ? "text-foreground" : "text-muted-foreground"
            )}>
              Home
            </span> */}
          </div>
        </Link>

        <Link href="/add-plant">
          <div className="p-2 flex flex-col items-center cursor-pointer">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-md mt-[-10px] mb-[-10px]">
              <PlusIcon className="text-white text-xl" />
            </div>
            {/* <span className="text-xs text-muted-foreground mt-[10px] mb-[10px]">
              Add Plant
            </span> */}
          </div>
        </Link>

        <Link href="/notifications">
          <div className="p-2 flex flex-col items-center cursor-pointer">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                isActive("/notifications") ? "bg-mint-light" : "bg-muted",
              )}
            >
              <Bell
                className={
                  isActive("/notifications")
                    ? "text-accent-foreground"
                    : "text-muted-foreground"
                }
              />
            </div>
          </div>
        </Link>

        <Link href="/tasks">
          <div className="p-2 flex flex-col items-center cursor-pointer">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                isActive("/tasks") ? "bg-mint-light" : "bg-muted",
              )}
            >
              <TasksIcon
                className={
                  isActive("/tasks")
                    ? "text-accent-foreground"
                    : "text-muted-foreground"
                }
              />
            </div>
          </div>
        </Link>

        <Link href="/settings">
          <div className="p-2 flex flex-col items-center cursor-pointer">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                isActive("/settings") ? "bg-mint-light" : "bg-muted",
              )}
            >
              <SettingsIcon
                className={
                  isActive("/settings")
                    ? "text-accent-foreground"
                    : "text-muted-foreground"
                }
              />
            </div>
            {/* <span className={cn(
              "text-xs mt-1",
              isActive("/settings") ? "text-foreground" : "text-muted-foreground"
            )}>
              Settings
            </span> */}
          </div>
        </Link>
      </div>
    </div>
  );
};

export default BottomNavigation;
