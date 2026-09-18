import type { Metadata } from "next";
import { AccountsTable, InviteForm } from "@/components/portal/admin-accounts";
import { requireAdmin } from "@/lib/auth";
import type { TeamMember } from "@/lib/types";

export const metadata: Metadata = {
  title: "Accounts",
  robots: { index: false, follow: false },
};

export default async function AdminAccountsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("team")
    .select("*")
    .order("display_order", { ascending: true });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-meta text-gess-accent mb-2">Admin</p>
        <h1 className="text-3xl font-semibold tracking-tight">Accounts</h1>
        <p className="mt-2 text-sm text-gess-muted">
          Invite executives, reorder team cards, and deactivate departed members.
        </p>
      </div>

      <InviteForm />
      <AccountsTable accounts={(data ?? []) as TeamMember[]} />
    </div>
  );
}
