import Image from "next/image";
import type { EventRecord } from "@/lib/types";
import { formatEventDate, tagLabel } from "@/lib/utils";

export function EventCard({
  event,
  featured = false,
}: {
  event: EventRecord;
  featured?: boolean;
}) {
  return (
    <article
      className={
        featured
          ? "grid overflow-hidden border border-gess-border bg-gess-surface md:grid-cols-[1.1fr_1fr]"
          : "flex flex-col border border-gess-border bg-gess-surface/40"
      }
    >
      <div className={featured ? "relative min-h-64" : "relative aspect-[16/10]"}>
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt=""
            fill
            sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 contour-overlay grid-overlay bg-gess-surface-elevated" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-meta text-gess-accent">{tagLabel(event.tag)}</span>
          <span className="text-meta text-gess-muted">
            {event.status === "upcoming" ? "Upcoming" : "Past"}
          </span>
          {event.is_featured ? (
            <span className="text-meta text-gess-white">Featured</span>
          ) : null}
        </div>

        <div>
          <h3 className={`font-semibold tracking-tight ${featured ? "text-2xl sm:text-3xl" : "text-xl"}`}>
            {event.title}
          </h3>
          <p className="mt-2 font-mono text-xs tracking-wide text-gess-muted">
            {formatEventDate(event.event_date, event.end_date)}
            {event.location ? ` · ${event.location}` : ""}
          </p>
        </div>

        {event.description ? (
          <p className={`text-sm leading-relaxed text-gess-muted ${featured ? "line-clamp-5" : "line-clamp-3"}`}>
            {event.description}
          </p>
        ) : null}
      </div>
    </article>
  );
}
