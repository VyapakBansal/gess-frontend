import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/database.types";
import {
  getPublishableKey,
  getSupabaseUrl,
  hasPublicSupabaseEnv,
} from "@/lib/supabase/env";

function requirePublicEnv() {
  const url = getSupabaseUrl();
  const key = getPublishableKey();
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  }
  return { url, key };
}

/**
 * Cookie-aware server client for authenticated portal routes.
 */
export async function createClient() {
  const { url, key } = requirePublicEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component — proxy will refresh sessions.
        }
      },
    },
  });
}

/**
 * Anonymous server client for public ISR pages.
 * Uses the publishable key only — no auth cookies, safe for cached public renders.
 */
export function createPublicClient() {
  if (!hasPublicSupabaseEnv()) {
    return null;
  }

  return createSupabaseClient<Database>(getSupabaseUrl(), getPublishableKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
