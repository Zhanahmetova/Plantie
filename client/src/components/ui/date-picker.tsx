import React, { useMemo } from "react";
import { cn, formatDayName, formatDayNumber } from "@/lib/utils";
import { getDaysInWeek } from "@/lib/utils";

interface DatePickerProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  onDateSelect,
  className
}) => {
  const daysOfWeek = useMemo(() => getDaysInWeek(selectedDate), [selectedDate]);
  
  const isSelected = (date: Date) => {
    return date.getDate() === selectedDate.getDate() && 
           date.getMonth() === selectedDate.getMonth() && 
           date.getFullYear() === selectedDate.getFullYear();
  };
  
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };
  
  return (
    <div className={cn("date-picker py-3", className)}>
      <div className="flex space-x-3 mb-4 overflow-x-auto pb-1">
        {daysOfWeek.map((date, index) => (
          <button
            key={index}
            className={cn(
              "date-item min-w-[60px] h-[75px] rounded-2xl flex flex-col items-center justify-center p-2 transition-all shadow-sm",
              isSelected(date) 
                ? "bg-primary text-white scale-110" 
                : "bg-white text-foreground hover:bg-primary/10"
            )}
            onClick={() => onDateSelect(date)}
          >
            <p className={cn(
              "text-xs mb-1.5",
              isSelected(date) ? "text-white" : "text-muted-foreground"
            )}>
              {formatDayName(date)}
            </p>
            <p className={cn(
              "text-lg font-medium",
              isSelected(date) ? "text-white" : "text-foreground"
            )}>
              {formatDayNumber(date)}
            </p>
            {isToday(date) && !isSelected(date) && (
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DatePicker;
