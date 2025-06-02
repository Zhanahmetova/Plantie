import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  format,
  isToday,
  isTomorrow,
  isYesterday,
  addDays as dateFnsAddDays,
} from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null): string {
  if (!date) {
    return "Not set";
  }

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }

    if (isToday(dateObj)) {
      return "Today";
    } else if (isTomorrow(dateObj)) {
      return "Tomorrow";
    } else if (isYesterday(dateObj)) {
      return "Yesterday";
    }

    return format(dateObj, "MMM dd, yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
}

export function formatShortDate(date: Date | string | null): string {
  if (!date) {
    return "Not set";
  }

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }

    return format(dateObj, "MMM dd");
  } catch (error) {
    console.error("Error formatting short date:", error);
    return "Invalid date";
  }
}

export function formatDayName(date: Date | string | null): string {
  if (!date) {
    return "";
  }

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "";
    }

    return format(dateObj, "EEE");
  } catch (error) {
    console.error("Error formatting day name:", error);
    return "";
  }
}

export function formatDayNumber(date: Date | string | null): string {
  if (!date) {
    return "";
  }

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "";
    }

    return format(dateObj, "dd");
  } catch (error) {
    console.error("Error formatting day number:", error);
    return "";
  }
}

export function getDaysInWeek(startDate: Date = new Date()): Date[] {
  const result: Date[] = [];
  const start = new Date(startDate);

  // Set to beginning of the selected day
  start.setHours(0, 0, 0, 0);

  // Get the current day of the week (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = start.getDay();

  // Calculate the start of the week (Thursday)
  const daysToSubtract = (dayOfWeek + 7 - 5) % 7; // 4 = Thursday
  start.setDate(start.getDate() - daysToSubtract);

  // Add 7 days
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(day.getDate() + i);
    result.push(day);
  }

  return result;
}

export function getRandomColor(): string {
  const colors = [
    "bg-mint-light",
    "bg-coral-light",
    "bg-yellow-100",
    "bg-green-100",
    "bg-blue-100",
    "bg-purple-100",
  ];

  return colors[Math.floor(Math.random() * colors.length)];
}

export function addDays(date: Date | string | null, days: number): Date {
  if (!date) return dateFnsAddDays(new Date(), days);

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return dateFnsAddDays(new Date(), days);
    }

    return dateFnsAddDays(dateObj, days);
  } catch (error) {
    console.error("Error adding days to date:", error);
    return dateFnsAddDays(new Date(), days);
  }
}
