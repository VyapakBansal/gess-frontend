import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  getPublishableKey,
  getSupabaseUrl,
  hasPublicSupabaseEnv,
} from "@/lib/supabase/env";

/**
 * Session refresh helper used by src/proxy.ts for /portal routes.
 * Keep this isolated from public page imports.
 */
export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isLogin = pathname.startsWith("/portal/login");
  const isPortal = pathname.startsWith("/portal");

  if (isPortal && !isLogin && !hasPublicSupabaseEnv()) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/portal/login";
    redirectUrl.searchParams.set("error", "config");
    return NextResponse.redirect(redirectUrl);
  }

  let supabaseResponse = NextResponse.next({ request });

  if (!hasPublicSupabaseEnv()) {
    return supabaseResponse;
  }

  const supabase = createServerClient(getSupabaseUrl(), getPublishableKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isPortal && !isLogin && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/portal/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Only send logged-in users away from /portal/login when they have an
  // active team row. Otherwise Auth↔login redirects loop ("refreshed too many times")
  // e.g. after an invite that created auth.users but no public.team row.
  if (isLogin && user) {
    const errorParam = request.nextUrl.searchParams.get("error");
    if (errorParam === "inactive" || errorParam === "config") {
      return supabaseResponse;
    }

    const { data: profile } = await supabase
      .from("team")
      .select("id, is_active")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.is_active) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/portal";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }

    return supabaseResponse;
  }

  return supabaseResponse;
}
