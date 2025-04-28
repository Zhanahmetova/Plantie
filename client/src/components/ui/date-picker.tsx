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
  
  return (
    <div className={cn("date-picker py-3", className)}>
      <div className="flex space-x-2 mb-3 overflow-x-auto pb-1">
        {daysOfWeek.map((date, index) => (
          <button
            key={index}
            className={cn(
              "date-item min-w-[50px] h-[70px] rounded-xl flex flex-col items-center justify-center p-2 transition-colors",
              isSelected(date) ? "bg-primary text-white" : "bg-white text-foreground"
            )}
            onClick={() => onDateSelect(date)}
          >
            <p className={cn(
              "text-xs mb-1",
              isSelected(date) ? "text-white" : "text-muted-foreground"
            )}>
              {formatDayName(date)}
            </p>
            <p className={cn(
              "text-sm font-medium",
              isSelected(date) ? "text-white" : "text-foreground"
            )}>
              {formatDayNumber(date)}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DatePicker;
