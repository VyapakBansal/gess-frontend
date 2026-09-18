import Link from "next/link";
import { EventCard } from "@/components/events/event-card";
import { GeomaticsExplorer } from "@/components/public/geomatics-explorer";
import { Hero } from "@/components/public/hero";
import { Reveal } from "@/components/public/reveal";
import { SITE } from "@/lib/constants";
import { getFeaturedEvent } from "@/lib/public-data";

export const revalidate = 21600;

export default async function HomePage() {
  const featured = await getFeaturedEvent();

  return (
    <>
      <Hero />

      <div className="marquee-track py-3.5" aria-hidden>
        <div className="marquee-content text-meta text-gess-white/80">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="mx-6 inline-flex items-center gap-6">
              <span>LiDAR</span>
              <span className="text-gess-accent">·</span>
              <span>GNSS</span>
              <span className="text-gess-accent">·</span>
              <span>Survey</span>
              <span className="text-gess-accent">·</span>
              <span>Photogrammetry</span>
              <span className="text-gess-accent">·</span>
              <span>Digital Twins</span>
              <span className="text-gess-accent">·</span>
              <span>Remote Sensing</span>
            </span>
          ))}
        </div>
      </div>

      {/* Full-bleed atmospheric band — follows theme */}
      <section className="atmosphere-band border-b border-gess-border">
        <div className="section-pad page-shell grid gap-10 py-16 sm:py-20 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
          <Reveal>
            <p className="text-meta text-gess-accent mb-3">Identity</p>
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
              Not a generic club site.
              <span className="mt-2 block text-gess-muted">
                A geomatics ops surface for Schulich engineers.
              </span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-gess-muted">
              GESS connects students across surveying, remote sensing, GIS, GNSS,
              and digital twins — with events, industry nights, and a self-serve
              content portal that keeps the public site current.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="relative overflow-hidden border-2 border-gess-accent/45 bg-gess-surface/80 p-6 backdrop-blur-sm">
              <div className="absolute inset-0 grid-overlay opacity-50" aria-hidden />
              <div className="absolute -right-8 -top-8 size-32 rounded-full bg-gess-accent/25 blur-2xl" aria-hidden />
              <div className="relative space-y-4">
                <p className="text-meta text-gess-accent">Field lock</p>
                {[
                  { k: "ORIGIN", v: SITE.location },
                  { k: "LAT", v: SITE.coordinates.lat },
                  { k: "LNG", v: SITE.coordinates.lng },
                  { k: "EPOCH", v: String(SITE.founded) },
                ].map((row) => (
                  <div
                    key={row.k}
                    className="flex items-center justify-between gap-4 border-b border-gess-border py-2 font-mono text-xs tracking-wide last:border-b-0"
                  >
                    <span className="text-gess-muted">{row.k}</span>
                    <span>{row.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <div className="section-pad page-shell py-20 sm:py-28">
          <GeomaticsExplorer />
        </div>
      </section>

      <section className="section-pad page-shell py-20 sm:py-28">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <Reveal>
            <p className="text-meta text-gess-accent mb-3">Events</p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Featured acquisition
            </h2>
            <p className="mt-3 max-w-xl text-gess-muted">
              Workshops, industry nights, competitions, and socials — curated by the executive team.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <Link
              href="/events"
              className="group inline-flex cursor-pointer items-center gap-2 text-sm text-gess-accent"
            >
              All events
              <span className="transition group-hover:translate-x-1">→</span>
            </Link>
          </Reveal>
        </div>

        <Reveal delay={80}>
          {featured ? (
            <div className="card-interactive">
              <EventCard event={featured} featured />
            </div>
          ) : (
            <div className="border border-dashed border-gess-border p-10 text-sm text-gess-muted">
              No featured upcoming event yet. Check back soon, or browse the full
              events archive.
            </div>
          )}
        </Reveal>
      </section>

      <section className="section-pad page-shell pb-20 sm:pb-28">
        <Reveal>
          <div className="relative overflow-hidden border border-gess-accent/35 bg-gess-surface/60 p-8 sm:p-12">
            <div className="absolute inset-0 grid-overlay opacity-40" aria-hidden />
            <div className="absolute -right-20 -top-20 size-72 rounded-full bg-gess-accent/30 blur-3xl" aria-hidden />
            <div className="absolute -bottom-24 -left-16 size-56 rounded-full bg-gess-accent/15 blur-3xl" aria-hidden />
            <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-meta text-gess-accent mb-3">Join the network</p>
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Ready to lock on?
                </h2>
                <p className="mt-3 max-w-xl text-gess-muted">
                  Membership, partnerships, and collaborations start with a message.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="btn-interactive inline-flex h-12 cursor-pointer items-center justify-center rounded-sm bg-gess-accent px-6 text-sm font-medium text-gess-on-accent"
                >
                  Contact GESS
                </Link>
                <Link
                  href="/team"
                  className="btn-interactive inline-flex h-12 cursor-pointer items-center justify-center rounded-sm border border-gess-border px-6 text-sm"
                >
                  Meet the team
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
