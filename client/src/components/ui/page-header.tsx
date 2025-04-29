import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  showBackButton = false,
  onBackClick
}) => {
  const [, navigate] = useLocation();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex items-center gap-3 py-4">
      {showBackButton && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleBackClick}
          className="rounded-full h-9 w-9"
        >
          <ArrowLeftIcon size={20} />
        </Button>
      )}
      <h1 className="text-xl font-semibold truncate">{title}</h1>
    </div>
  );
};

export default PageHeader;