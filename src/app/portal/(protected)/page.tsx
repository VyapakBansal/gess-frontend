import Link from "next/link";
import type { Metadata } from "next";
import { requireTeamProfile } from "@/lib/auth";
import { profileCompletion } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Portal",
  robots: { index: false, follow: false },
};

export default async function PortalDashboardPage() {
  const { supabase, profile } = await requireTeamProfile();

  const [{ count: upcomingCount }, { data: recentEvents }] = await Promise.all([
    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("status", "upcoming"),
    supabase
      .from("events")
      .select("id, title, event_date, status")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const completion = profileCompletion(profile);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-meta text-gess-accent mb-2">GESS Portal</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome, {profile.display_name}
        </h1>
        <p className="mt-2 text-sm text-gess-muted">
          Role: {profile.is_admin ? "Admin" : "Executive"} · {profile.role}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="border border-gess-border bg-gess-surface/50 p-5">
          <p className="text-meta text-gess-muted">Profile</p>
          <p className="mt-3 text-2xl font-semibold">{completion}</p>
        </div>
        <div className="border border-gess-border bg-gess-surface/50 p-5">
          <p className="text-meta text-gess-muted">Events</p>
          <p className="mt-3 text-2xl font-semibold">{upcomingCount ?? 0} upcoming</p>
        </div>
        <div className="border border-gess-border bg-gess-surface/50 p-5">
          <p className="text-meta text-gess-muted">Access</p>
          <p className="mt-3 text-2xl font-semibold">
            {profile.is_admin ? "Admin" : "Exec"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/portal/profile"
          className="inline-flex h-11 items-center rounded-sm bg-gess-accent px-5 text-sm font-medium text-gess-on-accent"
        >
          Edit Profile
        </Link>
        <Link
          href="/portal/events/new"
          className="inline-flex h-11 items-center rounded-sm border border-gess-border px-5 text-sm"
        >
          Create Event
        </Link>
        {profile.is_admin ? (
          <Link
            href="/portal/admin/accounts"
            className="inline-flex h-11 items-center rounded-sm border border-gess-border px-5 text-sm"
          >
            Manage Accounts
          </Link>
        ) : null}
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-medium">Recent events</h2>
          <Link href="/portal/events" className="text-sm text-gess-accent hover:underline">
            View all
          </Link>
        </div>
        <div className="border border-gess-border">
          {(recentEvents ?? []).length === 0 ? (
            <p className="p-5 text-sm text-gess-muted">No events yet.</p>
          ) : (
            <ul>
              {(recentEvents ?? []).map((event) => (
                <li
                  key={event.id}
                  className="flex items-center justify-between gap-4 border-t border-gess-border px-5 py-4 first:border-t-0"
                >
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-meta text-gess-muted mt-1">
                      {event.event_date} · {event.status}
                    </p>
                  </div>
                  <Link
                    href={`/portal/events/${event.id}/edit`}
                    className="text-sm text-gess-accent hover:underline"
                  >
                    Edit
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
