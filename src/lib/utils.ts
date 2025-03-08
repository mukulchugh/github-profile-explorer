import { clsx, type ClassValue } from "clsx";
import { formatDistanceToNow } from "date-fns";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names into a single string using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string into a human-readable format
 */
export function formatDate(dateString: string) {
  const date = new Date(dateString);

  // If less than a day ago, show relative time
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    if (diffInHours < 1) {
      return "just now";
    }
    return `${Math.floor(diffInHours)} hours ago`;
  }

  // If less than a week ago, show day
  if (diffInHours < 168) {
    // 7 days
    return `${Math.floor(diffInHours / 24)} days ago`;
  }

  // Otherwise show formatted date
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Formats a timestamp into a human-readable format
 */
export const safeFormatTimeDistance = (timestamp: number | undefined) => {
  if (!timestamp || isNaN(timestamp) || timestamp <= 0) {
    return "";
  }

  try {
    return formatDistanceToNow(timestamp, { addSuffix: true });
  } catch (error) {
    console.warn("Invalid timestamp encountered:", timestamp, error);
    return "";
  }
};
