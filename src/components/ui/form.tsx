import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-meta text-gess-muted", className)}
      {...props}
    />
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-sm border border-gess-border bg-gess-surface px-3 text-sm text-gess-white placeholder:text-gess-muted/70 focus:border-gess-accent focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full rounded-sm border border-gess-border bg-gess-surface px-3 py-3 text-sm text-gess-white placeholder:text-gess-muted/70 focus:border-gess-accent focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-sm border border-gess-border bg-gess-surface px-3 text-sm text-gess-white focus:border-gess-accent focus:outline-none",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function FieldError({ children }: { children?: string | null }) {
  if (!children) return null;
  return <p className="text-sm text-red-300">{children}</p>;
}

export function FormMessage({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "success" | "error";
  children: React.ReactNode;
}) {
  const tones = {
    neutral: "border-gess-border text-gess-muted",
    success: "border-gess-accent/40 text-gess-accent",
    error: "border-red-500/40 text-red-300",
  };

  return (
    <div className={cn("rounded-sm border px-3 py-2 text-sm", tones[tone])}>
      {children}
    </div>
  );
}
