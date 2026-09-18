import "server-only";
import { createPublicClient } from "@/lib/supabase/server";
import type { EventRecord, TeamMember } from "@/lib/types";

export async function getTeamMembers(): Promise<TeamMember[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("team")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Failed to load team:", error.message);
    return [];
  }

  return (data ?? []) as TeamMember[];
}

export async function getEvents(): Promise<EventRecord[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: false });

  if (error) {
    console.error("Failed to load events:", error.message);
    return [];
  }

  return (data ?? []) as EventRecord[];
}

export async function getFeaturedEvent(): Promise<EventRecord | null> {
  const supabase = createPublicClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("is_featured", true)
    .eq("status", "upcoming")
    .order("event_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to load featured event:", error.message);
    return null;
  }

  return (data as EventRecord | null) ?? null;
}

export async function getUpcomingEvents(): Promise<EventRecord[]> {
  const events = await getEvents();
  return events
    .filter((event) => event.status === "upcoming")
    .sort((a, b) => a.event_date.localeCompare(b.event_date));
}

export async function getPastEvents(): Promise<EventRecord[]> {
  const events = await getEvents();
  return events
    .filter((event) => event.status === "past")
    .sort((a, b) => b.event_date.localeCompare(a.event_date));
}
