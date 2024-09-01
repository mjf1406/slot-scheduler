import { type ClassValue, clsx } from "clsx"
import { randomUUID } from "crypto"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateUuidWithPrefix(prefix: string){
  return `${prefix}${randomUUID()}`
}