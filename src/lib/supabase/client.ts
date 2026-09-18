"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";
import { getPublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

/**
 * Browser Supabase client — PORTAL ONLY.
 * Never import this module from public route components.
 */
export function createClient() {
  const url = getSupabaseUrl();
  const key = getPublishableKey();

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return createBrowserClient<Database>(url, key);
}
