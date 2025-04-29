import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  fullscreen?: boolean;
  className?: string;
  text?: string;
}

export function LoadingSpinner({
  size = "md",
  fullscreen = false,
  className,
  text
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const spinner = (
    <div className={cn(
      "flex flex-col items-center justify-center gap-2",
      className
    )}>
      <Loader2 className={cn(
        sizeMap[size],
        "animate-spin text-primary"
      )} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {spinner}
      </div>
    );
  }

  return spinner;
}