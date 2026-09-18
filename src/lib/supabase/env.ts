/**
 * Centralized Supabase env access — publishable (public) + secret (server-only).
 * Do not use legacy anon / service_role keys.
 */

export function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}

export function getPublishableKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
}

export function getSecretKey() {
  return process.env.SUPABASE_SECRET_KEY ?? "";
}

export function hasPublicSupabaseEnv() {
  return Boolean(getSupabaseUrl() && getPublishableKey());
}

export function hasSecretSupabaseEnv() {
  return Boolean(getSupabaseUrl() && getSecretKey());
}
