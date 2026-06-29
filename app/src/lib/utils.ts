import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

// ─── Tailwind Class Merger ────────────────────────────────────────────────────

/**
 * Merges Tailwind CSS class names, resolving conflicts intelligently.
 * Used by all shadcn/ui components and custom components.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Date Formatters ──────────────────────────────────────────────────────────

/** Formats a date as "Jan 15, 2025" */
export function formatDate(date: Date | string): string {
  return format(new Date(date), "MMM d, yyyy");
}

/** Formats a date as "2 hours ago", "3 days ago", etc. */
export function timeAgo(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/** Formats a date as "January 15, 2025 at 10:30 AM" */
export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "MMMM d, yyyy 'at' h:mm a");
}

// ─── String Helpers ───────────────────────────────────────────────────────────

/** Capitalizes the first letter of a string */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/** Converts a snake_case or SCREAMING_SNAKE_CASE enum value to "Title Case" */
export function formatEnum(value: string): string {
  return value
    .split("_")
    .map((word) => capitalize(word))
    .join(" ");
}

/** Truncates a string to maxLength, appending "..." if truncated */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + "...";
}

// ─── Number Helpers ───────────────────────────────────────────────────────────

/** Clamps a value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Returns a score color class based on the score value (0-100) */
export function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

/** Returns a score badge variant based on the score value (0-100) */
export function getScoreBadgeVariant(
  score: number,
): "default" | "secondary" | "destructive" | "outline" {
  if (score >= 80) return "default";
  if (score >= 60) return "secondary";
  return "destructive";
}

// ─── URL Helpers ──────────────────────────────────────────────────────────────

/** Returns the base URL of the application */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

// ─── File Helpers ─────────────────────────────────────────────────────────────

/** Formats a file size in bytes to a human-readable string */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Array Helpers ────────────────────────────────────────────────────────────

/** Returns unique values from an array */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/** Shuffles an array (Fisher-Yates) — used for random cover images */
export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
