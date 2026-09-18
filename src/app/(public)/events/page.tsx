import type { Metadata } from "next";
import { EventCard } from "@/components/events/event-card";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  getFeaturedEvent,
  getPastEvents,
  getUpcomingEvents,
} from "@/lib/public-data";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming and past GESS events, workshops, and industry nights.",
};

export const revalidate = 21600;

export default async function EventsPage() {
  const [featured, upcoming, past] = await Promise.all([
    getFeaturedEvent(),
    getUpcomingEvents(),
    getPastEvents(),
  ]);

  const upcomingWithoutFeatured = featured
    ? upcoming.filter((event) => event.id !== featured.id)
    : upcoming;

  return (
    <div className="pt-24">
      <section className="section-pad page-shell py-16 sm:py-20">
        <SectionHeading
          eyebrow="Events"
          title="Field notes from the calendar."
          description="Status is set manually by executives — upcoming and past are intentional, not auto-derived from dates."
        />
      </section>

      <section className="section-pad page-shell pb-16">
        <p className="text-meta text-gess-accent mb-6">Featured</p>
        {featured ? (
          <EventCard event={featured} featured />
        ) : (
          <div className="border border-dashed border-gess-border p-8 text-sm text-gess-muted">
            No featured event selected.
          </div>
        )}
      </section>

      <section className="section-pad page-shell pb-16">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">Upcoming</h2>
          <span className="text-meta text-gess-muted">
            {String(upcoming.length).padStart(2, "0")} events
          </span>
        </div>
        {upcomingWithoutFeatured.length > 0 || (featured && featured.status === "upcoming") ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {upcomingWithoutFeatured.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-gess-border p-8 text-sm text-gess-muted">
            No upcoming events yet.
          </div>
        )}
      </section>

      <section className="section-pad page-shell pb-20">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">Past</h2>
          <span className="text-meta text-gess-muted">
            {String(past.length).padStart(2, "0")} events
          </span>
        </div>
        {past.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {past.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-gess-border p-8 text-sm text-gess-muted">
            Past events will appear here.
          </div>
        )}
      </section>
    </div>
  );
}
