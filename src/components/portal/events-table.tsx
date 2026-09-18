"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form";
import { STORAGE_BUCKETS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { EventRecord } from "@/lib/types";
import { formatEventDate, storagePathFromPublicUrl, tagLabel } from "@/lib/utils";

export function EventsTable({ events }: { events: EventRecord[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggleField(
    event: EventRecord,
    patch: Partial<Pick<EventRecord, "status" | "is_featured">>,
  ) {
    setPendingId(event.id);
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("events")
      .update(patch)
      .eq("id", event.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      router.refresh();
    }
    setPendingId(null);
  }

  async function removeEvent(event: EventRecord) {
    if (!window.confirm(`Delete “${event.title}”? This cannot be undone.`)) {
      return;
    }

    setPendingId(event.id);
    setError(null);
    const supabase = createClient();

    const { error: deleteError } = await supabase
      .from("events")
      .delete()
      .eq("id", event.id);

    if (deleteError) {
      setError(deleteError.message);
      setPendingId(null);
      return;
    }

    const path = storagePathFromPublicUrl(event.image_url);
    if (path) {
      await supabase.storage.from(STORAGE_BUCKETS.eventImages).remove([path]);
    }

    router.refresh();
    setPendingId(null);
  }

  if (events.length === 0) {
    return (
      <div className="border border-dashed border-gess-border p-8 text-sm text-gess-muted">
        No events yet.{" "}
        <Link href="/portal/events/new" className="text-gess-accent hover:underline">
          Create the first one
        </Link>
        .
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error ? <FormMessage tone="error">{error}</FormMessage> : null}

      <div className="overflow-x-auto border border-gess-border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gess-surface text-meta text-gess-muted">
            <tr>
              <th className="px-4 py-3 font-normal">Event</th>
              <th className="px-4 py-3 font-normal">Date</th>
              <th className="px-4 py-3 font-normal">Tag</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 font-normal">Featured</th>
              <th className="px-4 py-3 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => {
              const busy = pendingId === event.id;
              return (
                <tr key={event.id} className="border-t border-gess-border">
                  <td className="px-4 py-3">
                    <div className="font-medium">{event.title}</div>
                    <div className="text-xs text-gess-muted">{event.location}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs tracking-wide text-gess-muted">
                    {formatEventDate(event.event_date, event.end_date)}
                  </td>
                  <td className="px-4 py-3">{tagLabel(event.tag)}</td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busy}
                      onClick={() =>
                        toggleField(event, {
                          status: event.status === "upcoming" ? "past" : "upcoming",
                        })
                      }
                    >
                      {event.status}
                    </Button>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant={event.is_featured ? "accent" : "secondary"}
                      disabled={busy}
                      onClick={() =>
                        toggleField(event, { is_featured: !event.is_featured })
                      }
                    >
                      {event.is_featured ? "Yes" : "No"}
                    </Button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/portal/events/${event.id}/edit`}
                        className="inline-flex h-9 items-center rounded-sm border border-gess-border px-3 text-sm hover:bg-gess-white/5"
                      >
                        Edit
                      </Link>
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={busy}
                        onClick={() => removeEvent(event)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
