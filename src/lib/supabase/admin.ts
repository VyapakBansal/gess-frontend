import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { getSecretKey, getSupabaseUrl, hasSecretSupabaseEnv } from "@/lib/supabase/env";

/**
 * Secret-key client — server-only admin operations.
 * Never import into Client Components or public routes.
 */
export function createAdminClient() {
  if (!hasSecretSupabaseEnv()) {
    throw new Error("Missing Supabase secret key credentials");
  }

  return createClient<Database>(getSupabaseUrl(), getSecretKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
