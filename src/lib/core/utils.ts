import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges CSS class names with Tailwind CSS conflict resolution
 * 
 * Combines clsx for conditional class handling with tailwind-merge
 * to properly resolve conflicting Tailwind utility classes.
 * 
 * @param {...ClassValue[]} inputs - Class names to merge (strings, objects, arrays)
 * @returns {string} Merged class string with resolved Tailwind conflicts
 * 
 * @example
 * cn("px-2", "px-4") // returns "px-4"
 * cn("px-2", { "px-4": true }) // returns "px-4"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
