import type { Metadata } from "next";
import { GeomaticsExplorer } from "@/components/public/geomatics-explorer";
import { Reveal } from "@/components/public/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { SITE } from "@/lib/constants";
import { SCHULICH_GEOMATICS_URL } from "@/lib/geomatics";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "Mission, geomatics overview, and how GESS operates.",
};

export const revalidate = 21600;

export default function AboutPage() {
  return (
    <div className="pt-24">
      <section className="section-pad page-shell py-16 sm:py-20">
        <Reveal>
          <SectionHeading
            eyebrow="Mission"
            title="Build a stronger geomatics community."
            description="GESS exists to connect students with industry, research, and each other — elevating geomatics engineering through events, mentorship, and a clear technical identity."
          />
        </Reveal>
      </section>

      <section className="atmosphere-band border-y border-gess-border">
        <div className="section-pad page-shell py-16 sm:py-20">
          <GeomaticsExplorer />
        </div>
      </section>

      <section className="section-pad page-shell py-16 sm:py-20">
        <Reveal>
          <div className="border border-gess-border p-8 sm:p-10">
            <p className="text-meta text-gess-accent mb-3">Partners</p>
            <h2 className="text-2xl font-semibold tracking-tight">
              Affiliated organizations
            </h2>
            <p className="mt-3 max-w-2xl text-gess-muted">
              GESS collaborates with academic departments, industry partners, and
              student engineering societies across campus — including the{" "}
              <a
                href={SCHULICH_GEOMATICS_URL}
                target="_blank"
                rel="noreferrer"
                className="text-gess-accent underline decoration-gess-accent/40 underline-offset-4 hover:decoration-gess-accent"
              >
                Schulich Department of Geomatics Engineering
              </a>
              .
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                "Schulich School of Engineering",
                SITE.location,
                "Industry Network",
              ].map((name) => (
                <div
                  key={name}
                  className="border border-gess-border bg-gess-surface/50 px-4 py-5 text-sm transition hover:border-gess-accent/50"
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="section-pad page-shell pb-20">
        <Reveal>
          <div className="flex flex-col gap-4 border border-gess-border bg-gess-surface/40 p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-meta text-gess-accent mb-2">People</p>
              <h2 className="text-xl font-semibold tracking-tight">
                Meet the executive team
              </h2>
              <p className="mt-2 max-w-lg text-sm text-gess-muted">
                Photos and member profiles live on the Team page.
              </p>
            </div>
            <Link
              href="/team"
              className="btn-interactive inline-flex h-11 cursor-pointer items-center justify-center rounded-sm bg-gess-accent px-5 text-sm font-medium text-gess-on-accent"
            >
              View team
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
