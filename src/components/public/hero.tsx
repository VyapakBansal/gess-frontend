"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SITE } from "@/lib/constants";

const HeroTerrain = dynamic(
  () => import("@/components/public/hero-terrain").then((mod) => mod.HeroTerrain),
  { ssr: false, loading: () => <StaticTerrainFallback /> },
);

function StaticTerrainFallback() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-gess-black">
      <div className="absolute inset-0 grid-overlay opacity-60" />
      <div className="absolute inset-0 contour-overlay opacity-80" />
      <div className="absolute -left-24 top-1/3 h-[55%] w-[55%] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--gess-accent)_42%,transparent),transparent_62%)] blur-3xl" />
      <div className="absolute -right-10 top-1/4 h-[75%] w-[70%] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--gess-accent)_36%,transparent),transparent_58%)] blur-2xl" />
      <div className="scan-line absolute inset-x-0 top-0 h-28 opacity-45" />
    </div>
  );
}

function shouldUseReducedVisuals() {
  if (typeof window === "undefined") return true;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const smallViewport = window.innerWidth < 900;
  const lowMemory =
    "deviceMemory" in navigator &&
    typeof (navigator as Navigator & { deviceMemory?: number }).deviceMemory === "number" &&
    ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4;
  const lowCores =
    typeof navigator.hardwareConcurrency === "number" &&
    navigator.hardwareConcurrency <= 4;

  return reducedMotion || (coarsePointer && smallViewport) || lowMemory || lowCores;
}

export function Hero() {
  const [mode, setMode] = useState<"pending" | "3d" | "static">("pending");

  useEffect(() => {
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(() => {
          setMode(shouldUseReducedVisuals() ? "static" : "3d");
        })
      : window.setTimeout(() => {
          setMode(shouldUseReducedVisuals() ? "static" : "3d");
        }, 200);

    return () => {
      if (typeof idle === "number") {
        window.clearTimeout(idle);
      } else if (window.cancelIdleCallback) {
        window.cancelIdleCallback(idle);
      }
    };
  }, []);

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-gess-black text-gess-white">
      {mode === "3d" ? <HeroTerrain /> : <StaticTerrainFallback />}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,color-mix(in_oklab,var(--gess-accent)_30%,transparent),transparent_55%)]" />
      <div className="absolute inset-0 bg-gradient-to-r from-gess-black via-gess-black/90 to-gess-black/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-gess-black via-transparent to-gess-black/55" />

      <div
        className="pointer-events-none absolute inset-3 border border-gess-border sm:inset-5"
        aria-hidden
      >
        <span className="absolute left-0 top-0 h-10 w-10 border-l-2 border-t-2 border-gess-accent" />
        <span className="absolute right-0 top-0 h-10 w-10 border-r-2 border-t-2 border-gess-accent" />
        <span className="absolute bottom-0 left-0 h-10 w-10 border-b-2 border-l-2 border-gess-accent" />
        <span className="absolute bottom-0 right-0 h-10 w-10 border-b-2 border-r-2 border-gess-accent" />
        <span className="absolute left-4 top-3 text-meta text-gess-accent/90">
          GESS · CALGARY
        </span>
        <span className="absolute right-4 top-3 hidden text-meta text-gess-muted sm:inline">
          FRAME 001
        </span>
      </div>

      <div className="section-pad page-shell relative flex min-h-[100svh] flex-col justify-end pb-16 pt-28 sm:justify-center sm:pb-24">
        <div className="max-w-4xl">
          <div className="hero-enter mb-6 flex flex-wrap items-center gap-3">
            <p className="text-meta text-gess-accent">
              {SITE.coordinates.lat} · {SITE.coordinates.lng}
            </p>
            <span className="hidden h-px w-10 bg-gess-border sm:block" />
            <p className="text-meta text-gess-muted">Signal locked</p>
          </div>

          <p className="hero-enter hero-delay-1 mb-4 text-meta tracking-[0.4em] text-gess-accent">
            GESS
          </p>

          <h1 className="hero-enter hero-delay-2 text-4xl font-semibold tracking-[-0.05em] text-balance sm:text-6xl lg:text-7xl">
            Map the world.
            <span className="mt-1 block text-gess-accent">Build the next signal.</span>
          </h1>

          <p className="hero-enter hero-delay-3 mt-6 max-w-xl text-base leading-relaxed text-gess-muted sm:text-lg">
            {SITE.fullName} — a technical community for surveying, sensing,
            geospatial systems, and the engineers who locate everything.
          </p>

          <div className="hero-enter hero-delay-4 mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="#geomatics"
              className="btn-interactive inline-flex h-12 cursor-pointer items-center justify-center rounded-sm bg-gess-accent px-6 text-sm font-medium text-gess-on-accent"
            >
              What is Geomatics?
            </Link>
            <Link
              href="/events"
              className="btn-interactive inline-flex h-12 cursor-pointer items-center justify-center rounded-sm border border-gess-border bg-gess-white/5 px-6 text-sm font-medium hover:border-gess-accent"
            >
              View Events
            </Link>
            <Link
              href="/team"
              className="btn-interactive inline-flex h-12 cursor-pointer items-center justify-center rounded-sm border border-transparent px-6 text-sm font-medium text-gess-muted underline-offset-4 hover:text-gess-accent hover:underline"
            >
              Meet the team
            </Link>
          </div>
        </div>

        <div className="hero-enter hero-delay-5 mt-16 flex items-center gap-3 text-meta text-gess-muted">
          <span className="h-px w-12 origin-left animate-pulse bg-gess-accent" />
          Scroll into the field
        </div>
      </div>
    </section>
  );
}
