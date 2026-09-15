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

/**
 * Human label for a booking request: the first quote item, falling back to the
 * title public bookings generate ("New Unassigned Lead: ac repair").
 */
export function bookingRequestServiceLabel(request: {
  title?: string;
  items?: { item_name: string }[] | null;
}): string {
  const fromItem = request.items?.[0]?.item_name;
  if (fromItem) return fromItem;

  return request.title?.replace(/^new\s+(unassigned\s+)?lead:\s*/i, "") || request.title || "-";
}
