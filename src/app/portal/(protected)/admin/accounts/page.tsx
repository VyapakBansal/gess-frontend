import type { Metadata } from "next";
import { AccountsTable, AddMemberForm } from "@/components/portal/admin-accounts";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSecretSupabaseEnv } from "@/lib/supabase/env";
import type { TeamMember } from "@/lib/types";

export const metadata: Metadata = {
  title: "Members",
  robots: { index: false, follow: false },
};

export default async function AdminAccountsPage() {
  const { supabase, user } = await requireAdmin();
  const client = hasSecretSupabaseEnv() ? createAdminClient() : supabase;
  const { data, error } = await client
    .from("team")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-meta text-gess-accent mb-2">Admin</p>
        <h1 className="text-3xl font-semibold tracking-tight">Members</h1>
        <p className="mt-2 max-w-2xl text-sm text-gess-muted">
          Add anyone to the public team page, upload their photo, and remove them when they leave.
        </p>
      </div>

      <AddMemberForm />
      <AccountsTable accounts={(data ?? []) as TeamMember[]} currentUserId={user.id} />
    </div>
  );
}
