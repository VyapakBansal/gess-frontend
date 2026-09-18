"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { PortalSignOut } from "@/components/portal/sign-out";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { TeamMember } from "@/lib/types";
import { cn } from "@/lib/utils";

const links = [
  { href: "/portal", label: "Dashboard" },
  { href: "/portal/profile", label: "Profile" },
  { href: "/portal/events", label: "Events" },
];

export function PortalShell({
  profile,
  children,
}: {
  profile: TeamMember;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gess-black">
      <header className="border-b border-gess-border">
        <div className="section-pad mx-auto flex h-16 max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Logo href="/portal" />
            <span className="hidden text-meta text-gess-muted sm:inline">Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden text-right sm:block">
              <p className="text-sm">{profile.display_name}</p>
              <p className="text-meta text-gess-accent">
                {profile.is_admin ? "Admin" : "Exec"}
              </p>
            </div>
            <PortalSignOut />
          </div>
        </div>
      </header>

      <div className="section-pad mx-auto grid max-w-6xl gap-8 py-8 lg:grid-cols-[220px_1fr]">
        <aside>
          <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible" aria-label="Portal">
            {links.map((link) => {
              const active =
                link.href === "/portal"
                  ? pathname === "/portal"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "whitespace-nowrap rounded-sm px-3 py-2 text-sm transition",
                    active
                      ? "bg-gess-accent/15 text-gess-accent"
                      : "text-gess-white/75 hover:bg-gess-white/5 hover:text-gess-white",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            {profile.is_admin ? (
              <Link
                href="/portal/admin/accounts"
                className={cn(
                  "whitespace-nowrap rounded-sm px-3 py-2 text-sm transition",
                  pathname.startsWith("/portal/admin")
                    ? "bg-gess-accent/15 text-gess-accent"
                    : "text-gess-white/75 hover:bg-gess-white/5 hover:text-gess-white",
                )}
              >
                Accounts
              </Link>
            ) : null}
            <Link
              href="/"
              className="whitespace-nowrap rounded-sm px-3 py-2 text-sm text-gess-muted hover:text-gess-accent"
            >
              Public site →
            </Link>
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
