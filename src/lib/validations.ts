import { z } from "zod";
import { DESCRIPTION_MAX, EVENT_TAGS } from "@/lib/constants";

const tagValues = EVENT_TAGS.map((t) => t.value) as [string, ...string[]];

export const profileSchema = z.object({
  display_name: z.string().trim().min(1, "Display name is required").max(80),
  role: z.string().trim().min(1, "Role is required").max(80),
  description: z
    .string()
    .trim()
    .max(DESCRIPTION_MAX, `Description must be ${DESCRIPTION_MAX} characters or fewer`)
    .optional()
    .or(z.literal("")),
  linkedin_url: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
});

export const eventSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(120),
    description: z.string().trim().max(4000).optional().or(z.literal("")),
    event_date: z.string().min(1, "Event date is required"),
    end_date: z.string().optional().or(z.literal("")),
    location: z.string().trim().max(200).optional().or(z.literal("")),
    tag: z.enum(tagValues),
    status: z.enum(["upcoming", "past"]),
    is_featured: z.boolean(),
  })
  .refine(
    (data) => !data.end_date || data.end_date >= data.event_date,
    { message: "End date must be on or after the start date", path: ["end_date"] },
  );

export const inviteSchema = z.object({
  display_name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().email("Valid email required"),
  role: z.string().trim().min(1, "Role is required").max(80),
  is_admin: z.boolean().default(false),
});

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Valid email required"),
  message: z.string().trim().min(10, "Message is too short").max(4000),
});
