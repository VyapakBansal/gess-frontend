import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { EVENT_TAGS, type EventTag } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEventDate(
  start: string,
  end?: string | null,
): string {
  const startDate = new Date(`${start}T00:00:00`);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (!end || end === start) {
    return formatter.format(startDate).toUpperCase();
  }

  const endDate = new Date(`${end}T00:00:00`);
  return `${formatter.format(startDate).toUpperCase()} – ${formatter
    .format(endDate)
    .toUpperCase()}`;
}

export function tagLabel(tag: string): string {
  const match = EVENT_TAGS.find((item) => item.value === tag);
  return match?.label ?? tag;
}

export function isEventTag(value: string): value is EventTag {
  return EVENT_TAGS.some((item) => item.value === value);
}

export function storagePathFromPublicUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const marker = "/storage/v1/object/public/";
    const idx = parsed.pathname.indexOf(marker);
    if (idx === -1) return null;
    const rest = parsed.pathname.slice(idx + marker.length);
    const [, ...pathParts] = rest.split("/");
    return pathParts.join("/") || null;
  } catch {
    return null;
  }
}

export function profileCompletion(member: {
  display_name?: string | null;
  role?: string | null;
  description?: string | null;
  photo_url?: string | null;
}): "Complete" | "Incomplete" {
  if (
    member.display_name &&
    member.role &&
    member.description &&
    member.photo_url
  ) {
    return "Complete";
  }
  return "Incomplete";
}
