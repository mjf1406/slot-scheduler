import { type ClassValue, clsx } from "clsx"
import { randomUUID } from "crypto"
import { twMerge } from "tailwind-merge"

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
): "text-foreground/90" | "text-background/80" {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for light colors and white for dark colors
  return luminance > 0.5 ? "text-background/80" : "text-foreground/90";
}