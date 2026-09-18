import Image from "next/image";
import type { TeamMember } from "@/lib/types";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="currentColor"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.06-2.065 2.064 2.064 0 112.06 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function TeamCard({ member }: { member: TeamMember }) {
  return (
    <article className="group flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden bg-gess-surface">
        {member.photo_url ? (
          <Image
            src={member.photo_url}
            alt={`Portrait of ${member.display_name}`}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-end p-4 grid-overlay">
            <span className="text-meta text-gess-muted">NO IMAGE</span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gess-black/0 transition duration-300 group-hover:bg-gess-black/45" />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-gess-white/10" />

        {member.linkedin_url ? (
          <a
            href={member.linkedin_url}
            target="_blank"
            rel="noreferrer"
            aria-label={`LinkedIn profile for ${member.display_name}`}
            className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100 focus-visible:opacity-100"
          >
            <span className="flex size-14 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur-sm transition hover:border-gess-accent hover:text-gess-accent">
              <LinkedInIcon className="size-6" />
            </span>
          </a>
        ) : null}
      </div>

      <div className="mt-4 space-y-2">
        <div>
          <h3 className="text-lg font-medium tracking-tight">{member.display_name}</h3>
          <p className="text-meta text-gess-accent mt-1">{member.role}</p>
        </div>
        {member.description ? (
          <p className="text-sm leading-relaxed text-gess-muted">{member.description}</p>
        ) : null}
      </div>
    </article>
  );
}
