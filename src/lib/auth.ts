import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasPublicSupabaseEnv } from "@/lib/supabase/env";
import type { TeamMember } from "@/lib/types";

export async function requireUser() {
  if (!hasPublicSupabaseEnv()) {
    redirect("/portal/login?error=config");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/portal/login");
  }

  return { supabase, user };
}

export async function requireTeamProfile() {
  const { supabase, user } = await requireUser();
  const { data: profile, error } = await supabase
    .from("team")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!profile || !profile.is_active) {
    redirect("/portal/login?error=inactive");
  }

  return { supabase, user, profile: profile as TeamMember };
}

export async function requireAdmin() {
  const ctx = await requireTeamProfile();
  if (!ctx.profile.is_admin) {
    redirect("/portal");
  }
  return ctx;
}
