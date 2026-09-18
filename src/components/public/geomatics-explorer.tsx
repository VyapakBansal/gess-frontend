"use client";

import Image from "next/image";
import { useState } from "react";
import { Reveal } from "@/components/public/reveal";
import { GEOMATICS_TOPICS, SCHULICH_GEOMATICS_URL } from "@/lib/geomatics";
import { cn } from "@/lib/utils";

export function GeomaticsExplorer() {
  const [active, setActive] = useState(0);
  const current = GEOMATICS_TOPICS[active];

  return (
    <div id="geomatics" className="scroll-mt-24">
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <Reveal>
          <p className="text-meta text-gess-accent mb-3">What is Geomatics?</p>
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
            Location is infrastructure.
            <span className="mt-2 block text-gess-muted">
              Six ways geomatics engineers shape the spatial world.
            </span>
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <a
            href={SCHULICH_GEOMATICS_URL}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex cursor-pointer items-center gap-2 border border-gess-border px-4 py-3 text-sm transition hover:border-gess-accent hover:bg-gess-accent/10"
          >
            <span className="text-meta text-gess-accent">Source</span>
            <span>Schulich Geomatics Engineering</span>
            <span className="transition group-hover:translate-x-0.5">↗</span>
          </a>
        </Reveal>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Reveal className="relative">
          <div className="relative aspect-[16/11] overflow-hidden border border-gess-border bg-gess-surface">
            {GEOMATICS_TOPICS.map((topic, index) => (
              <div
                key={topic.id}
                className={cn(
                  "absolute inset-0 transition-opacity duration-500",
                  index === active ? "opacity-100" : "opacity-0",
                )}
                aria-hidden={index !== active}
              >
                <Image
                  src={topic.image}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover transition duration-700"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>
            ))}

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <p className="text-meta text-[#5BA8A8]">{current.tag}</p>
              <h3 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                {current.title}
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
                {current.summary}
              </p>
            </div>

            <div className="pointer-events-none absolute left-4 top-4 flex gap-2" aria-hidden>
              <span className="size-2 rounded-full bg-[#5BA8A8] shadow-[0_0_12px_#5BA8A8]" />
              <span className="text-meta text-white/70">LIVE FRAME</span>
            </div>
          </div>
        </Reveal>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {GEOMATICS_TOPICS.map((topic, index) => {
            const selected = index === active;
            return (
              <Reveal key={topic.id} delay={80 + index * 40}>
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  onMouseEnter={() => setActive(index)}
                  className={cn(
                    "group flex w-full cursor-pointer items-stretch gap-3 border p-3 text-left transition duration-300",
                    selected
                      ? "border-gess-accent bg-gess-accent/10"
                      : "border-gess-border bg-gess-surface/40 hover:border-gess-accent/50 hover:bg-gess-white/5",
                  )}
                >
                  <div className="relative block aspect-square w-16 shrink-0 overflow-hidden sm:w-20">
                    <Image
                      src={topic.image}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover transition duration-500 group-hover:scale-110"
                    />
                  </div>
                  <span className="flex min-w-0 flex-1 flex-col justify-center py-1">
                    <span className="text-meta text-gess-accent">{topic.tag}</span>
                    <span className="mt-1 truncate font-medium tracking-tight">
                      {topic.title}
                    </span>
                    <span className="mt-1 line-clamp-2 text-xs text-gess-muted">
                      {topic.summary}
                    </span>
                  </span>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>

      <Reveal delay={200}>
        <p className="mt-8 max-w-3xl text-sm leading-relaxed text-gess-muted">
          Geomatics engineering sits at the intersection of surveying, remote sensing,
          GIS, GNSS, and spatial computing. Learn more from the{" "}
          <a
            href={SCHULICH_GEOMATICS_URL}
            target="_blank"
            rel="noreferrer"
            className="text-gess-accent underline decoration-gess-accent/40 underline-offset-4 transition hover:decoration-gess-accent"
          >
            University of Calgary Department of Geomatics Engineering
          </a>
          .
        </p>
      </Reveal>
    </div>
  );
}
