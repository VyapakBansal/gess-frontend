import Link from "next/link";
import type { Metadata } from "next";
import { EventsTable } from "@/components/portal/events-table";
import { requireTeamProfile } from "@/lib/auth";
import type { EventRecord } from "@/lib/types";

export const metadata: Metadata = {
  title: "Events",
  robots: { index: false, follow: false },
};

export default async function PortalEventsPage() {
  const { supabase } = await requireTeamProfile();
  const { data } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-meta text-gess-accent mb-2">Events</p>
          <h1 className="text-3xl font-semibold tracking-tight">Manage events</h1>
          <p className="mt-2 text-sm text-gess-muted">
            All executives can create, edit, and delete any event. Status is manual.
          </p>
        </div>
        <Link
          href="/portal/events/new"
          className="inline-flex h-11 items-center justify-center rounded-sm bg-gess-accent px-5 text-sm font-medium text-gess-on-accent"
        >
          Create event
        </Link>
      </div>
      <EventsTable events={(data ?? []) as EventRecord[]} />
    </div>
  );
}
