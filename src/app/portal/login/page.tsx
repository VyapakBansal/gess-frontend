import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/portal/login-form";
import { Logo } from "@/components/ui/logo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portal Login",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const nextPath = params.next ?? "/portal";

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-16">
      <div className="absolute inset-0 grid-overlay opacity-40" aria-hidden />
      <div className="relative w-full max-w-md border border-gess-border bg-gess-surface/70 p-8 backdrop-blur">
        <Logo href="/" className="mb-8" />
        <p className="text-meta text-gess-accent mb-2">GESS Portal</p>
        <h1 className="text-2xl font-semibold tracking-tight">Executive sign in</h1>
        <p className="mt-2 text-sm text-gess-muted">
          Invite-only access. There is no public registration.
        </p>

        {params.error === "inactive" ? (
          <p className="mt-4 rounded-sm border border-red-500/40 px-3 py-2 text-sm text-red-300">
            This account is inactive. Contact an administrator.
          </p>
        ) : null}

        {params.error === "config" ? (
          <p className="mt-4 rounded-sm border border-amber-500/40 px-3 py-2 text-sm text-amber-200">
            Supabase environment variables are not configured yet. Add
            NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to
            .env.local (see supabase/SETUP.md).
          </p>
        ) : null}

        <div className="mt-8">
          <LoginForm nextPath={nextPath} />
        </div>

        <p className="mt-8 text-sm text-gess-muted">
          <Link href="/" className="hover:text-gess-accent">
            ← Back to public site
          </Link>
        </p>
      </div>
    </div>
  );
}
