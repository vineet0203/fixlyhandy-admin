import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTitleCase(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .split(/[_-]/)
    .map((word) => {
      const lower = word.toLowerCase();
      if (lower === "hr") return "HR";
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

