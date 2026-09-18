import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { TeamMember } from "@/lib/types";

export async function assertAdminApi() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, status: 401, error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("team")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.is_active || !profile.is_admin) {
    return { ok: false as const, status: 403, error: "Admin access required" };
  }

  return {
    ok: true as const,
    user,
    profile: profile as TeamMember,
    supabase,
  };
}
