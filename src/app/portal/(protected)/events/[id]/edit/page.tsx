import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventForm } from "@/components/portal/event-form";
import { requireTeamProfile } from "@/lib/auth";
import type { EventRecord } from "@/lib/types";

export const metadata: Metadata = {
  title: "Edit Event",
  robots: { index: false, follow: false },
};

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user } = await requireTeamProfile();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-meta text-gess-accent mb-2">Events</p>
        <h1 className="text-3xl font-semibold tracking-tight">Edit event</h1>
      </div>
      <EventForm event={data as EventRecord} userId={user.id} />
    </div>
  );
}
