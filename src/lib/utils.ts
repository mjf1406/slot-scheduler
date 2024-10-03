import { type ClassValue, clsx } from "clsx"
import { randomUUID } from "crypto"
import { twMerge } from "tailwind-merge"
import DOMPurify from 'dompurify';

export const sanitizeHtml = (html: string) => {
  return DOMPurify.sanitize(html);
};

export const formatDate = (date: Date): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const day = date.getDate();

  return `${dayName}, ${monthName} ${day}`;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateUuidWithPrefix(prefix: string){
  return `${prefix}${randomUUID()}`
}

export function getRandomElement<T>(array: T[]): T | null {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex] ?? null;
}
  
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  if (isNaN(hours!) || isNaN(minutes!)) throw new Error('Invalid time format');
  return hours! * 60 + minutes!;
};

export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours <= 0) return `${mins.toString().padStart(2, '0')}m`
  return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m`;
};

export const calculateDuration = (startTime: string, endTime: string): string => {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const durationInMinutes = end - start;
  return minutesToTime(durationInMinutes);
};

export const formatTime = (time: number): string => {
  const hours = time % 12 || 12;
  const period = time < 12 ? 'AM' : 'PM';
  return `${hours}:00 ${period}`;
};

export function getContrastColor(
  hexColor: string,
  theme?: 'light' | 'dark'
): "text-foreground/90" | "text-background/80" {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  if (theme === 'dark') {
    return luminance < 0.5 ? "text-foreground/90" : "text-background/80";
  } else {
    return luminance > 0.5 ? "text-foreground/90" : "text-background/80";
  }
}

export const convertTo24HourFormat = (time: string): string | undefined => {
  const parts = time.split(" ");
  if (parts.length !== 2) {
    throw new Error("Invalid time format. Expected 'HH:MM AM/PM'");
  }
  const [timeStr, period] = parts;
  if (!timeStr) return undefined
  const [hoursStr, minutesStr] = timeStr.split(":");
  if (!hoursStr || !minutesStr || !period) {
    throw new Error("Invalid time format. Expected 'HH:MM AM/PM'");
  }
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  if (isNaN(hours) || isNaN(minutes) || hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
    throw new Error("Invalid time values");
  }

  if (period.toUpperCase() === "PM" && hours !== 12) {
    hours += 12;
  } else if (period.toUpperCase() === "AM" && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};