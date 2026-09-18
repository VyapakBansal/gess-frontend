export const SITE = {
  name: "GESS",
  fullName: "Geomatics Engineering Student Society",
  tagline: "Mapping the future of geospatial engineering.",
  email: "gess@ucalgary.ca",
  location: "University of Calgary",
  meetingInfo: "ENG building — schedule announced each semester",
  coordinates: {
    lat: "51.0447° N",
    lng: "114.0719° W",
  },
  founded: 2026,
  socials: {
    instagram: "https://instagram.com/",
    linkedin: "https://linkedin.com/",
    discord: "https://discord.gg/",
  },
  schulichGeomatics: "https://schulich.ucalgary.ca/geomatics",
} as const;

export const EVENT_TAGS = [
  { value: "workshop", label: "Workshop" },
  { value: "social", label: "Social" },
  { value: "industry_night", label: "Industry Night" },
  { value: "competition", label: "Competition" },
  { value: "other", label: "Other" },
] as const;

export type EventTag = (typeof EVENT_TAGS)[number]["value"];
export type EventStatus = "upcoming" | "past";

export const REVALIDATE_SECONDS = 21600; // 6 hours ISR fallback

export const DESCRIPTION_MAX = 280;

export const STORAGE_BUCKETS = {
  teamPhotos: "team-photos",
  eventImages: "event-images",
} as const;

export const IMAGE_LIMITS = {
  maxWidthOrHeight: 1600,
  maxSizeMB: 0.85,
  acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  maxInputBytes: 12 * 1024 * 1024,
} as const;
