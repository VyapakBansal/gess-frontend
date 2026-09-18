import type { Metadata } from "next";
import { EventForm } from "@/components/portal/event-form";
import { requireTeamProfile } from "@/lib/auth";

export const metadata: Metadata = {
  title: "New Event",
  robots: { index: false, follow: false },
};

export default async function NewEventPage() {
  const { user } = await requireTeamProfile();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-meta text-gess-accent mb-2">Events</p>
        <h1 className="text-3xl font-semibold tracking-tight">Create event</h1>
      </div>
      <EventForm userId={user.id} />
    </div>
  );
}
