"use client";

import { useTheme } from "@/components/ui/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
      className={cn(
        "relative inline-flex h-9 w-[3.25rem] shrink-0 items-center rounded-full border border-gess-border bg-gess-surface transition hover:border-gess-accent/50",
        className,
      )}
    >
      <span
        className={cn(
          "absolute left-1 flex size-6 items-center justify-center rounded-full bg-gess-accent text-[10px] font-semibold text-[#0A0A0A] transition-transform",
          isDark ? "translate-x-0" : "translate-x-[1.35rem]",
        )}
        aria-hidden
      >
        {isDark ? "D" : "L"}
      </span>
    </button>
  );
}
