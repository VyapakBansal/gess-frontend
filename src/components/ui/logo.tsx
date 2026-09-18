import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Dual transparent PNGs — no invert filters (those caused the white patch).
 * Black mark on light surfaces, white mark on dark surfaces.
 */
export function Logo({
  className,
  priority = false,
  href = "/",
  surface = "auto",
}: {
  className?: string;
  priority?: boolean;
  href?: string;
  surface?: "auto" | "dark" | "light";
}) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="GESS home"
    >
      <span className="relative inline-flex size-10 shrink-0 items-center justify-center sm:size-11">
        <Image
          src="/logo.png"
          alt=""
          width={44}
          height={44}
          priority={priority}
          unoptimized
          className={cn(
            "size-10 object-contain transition-transform duration-300 group-hover:scale-105 sm:size-11",
            surface === "auto" && "dark:hidden",
            surface === "dark" && "hidden",
          )}
        />
        <Image
          src="/logo-white.png"
          alt=""
          width={44}
          height={44}
          priority={priority}
          unoptimized
          className={cn(
            "absolute inset-0 m-auto size-10 object-contain transition-transform duration-300 group-hover:scale-105 sm:size-11",
            surface === "auto" && "hidden dark:block",
            surface === "light" && "hidden",
            surface === "dark" && "block",
          )}
        />
      </span>
      <span
        className={cn(
          "text-sm font-semibold tracking-[0.18em] transition-colors group-hover:text-gess-accent",
          surface === "auto" && "text-gess-white",
          surface === "dark" && "text-white",
          surface === "light" && "text-black",
        )}
      >
        GESS
      </span>
    </Link>
  );
}
