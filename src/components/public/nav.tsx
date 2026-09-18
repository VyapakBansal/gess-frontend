"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

const links = [
  { href: "/#geomatics", label: "Geomatics" },
  { href: "/about", label: "About" },
  { href: "/team", label: "Team" },
  { href: "/events", label: "Events" },
  { href: "/contact", label: "Contact" },
];

export function PublicNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300",
        solid
          ? "border-gess-border bg-gess-black/90 backdrop-blur-md"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="section-pad page-shell flex h-16 items-center justify-between">
        <Logo priority />

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm tracking-wide transition hover:text-gess-accent",
                  active || (link.href === "/#geomatics" && pathname === "/")
                    ? "text-gess-accent"
                    : "text-gess-white/80",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <ThemeToggle />
          <Link
            href="/contact"
            className="btn-interactive inline-flex h-10 cursor-pointer items-center rounded-sm bg-gess-accent px-4 text-sm font-medium text-gess-on-accent"
          >
            Join
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-sm border border-gess-border"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">Menu</span>
            <span className="flex w-4 flex-col gap-1.5">
              <span className={cn("h-px bg-gess-white transition", open && "translate-y-[3.5px] rotate-45")} />
              <span className={cn("h-px bg-gess-white transition", open && "opacity-0")} />
              <span className={cn("h-px bg-gess-white transition", open && "-translate-y-[3.5px] -rotate-45")} />
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={cn(
          "section-pad border-t border-gess-border bg-gess-black md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav className="flex flex-col gap-1 py-4" aria-label="Mobile">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="cursor-pointer rounded-sm px-2 py-3 text-base text-gess-white/90 hover:bg-gess-white/5 hover:text-gess-accent"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="btn-interactive mt-2 inline-flex h-11 cursor-pointer items-center justify-center rounded-sm bg-gess-accent px-4 text-sm font-medium text-gess-on-accent"
          >
            Join
          </Link>
        </nav>
      </div>
    </header>
  );
}
