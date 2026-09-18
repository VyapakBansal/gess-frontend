import Link from "next/link";
import { SITE } from "@/lib/constants";
import { Logo } from "@/components/ui/logo";

export function PublicFooter() {
  return (
    <footer className="border-t border-gess-border">
      <div className="section-pad page-shell grid gap-10 py-14 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-gess-muted">
            {SITE.fullName}. A technical student society focused on geospatial
            engineering, surveying technology, and the people who build it.
          </p>
        </div>

        <div>
          <p className="text-meta text-gess-accent mb-4">Navigate</p>
          <ul className="space-y-2 text-sm text-gess-white/80">
            <li><Link href="/#geomatics" className="hover:text-gess-accent">Geomatics</Link></li>
            <li><Link href="/about" className="hover:text-gess-accent">About</Link></li>
            <li><Link href="/team" className="hover:text-gess-accent">Team</Link></li>
            <li><Link href="/events" className="hover:text-gess-accent">Events</Link></li>
            <li><Link href="/contact" className="hover:text-gess-accent">Contact</Link></li>
            <li><Link href="/portal/login" className="hover:text-gess-accent">Portal</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-meta text-gess-accent mb-4">Signal</p>
          <ul className="space-y-2 text-sm text-gess-white/80">
            <li className="font-mono text-xs tracking-wide text-gess-muted">
              {SITE.coordinates.lat}
            </li>
            <li className="font-mono text-xs tracking-wide text-gess-muted">
              {SITE.coordinates.lng}
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="hover:text-gess-accent">
                {SITE.email}
              </a>
            </li>
            <li>
              <a href={SITE.socials.instagram} className="hover:text-gess-accent" rel="noreferrer" target="_blank">
                Instagram
              </a>
            </li>
            <li>
              <a href={SITE.socials.linkedin} className="hover:text-gess-accent" rel="noreferrer" target="_blank">
                LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="section-pad page-shell flex flex-col gap-2 border-t border-gess-border py-6 text-meta text-gess-muted sm:flex-row sm:items-center sm:justify-between">
        <span>GESS / {SITE.founded}</span>
        <span>Geomatics · GNSS · Terrain · Survey</span>
      </div>
    </footer>
  );
}
