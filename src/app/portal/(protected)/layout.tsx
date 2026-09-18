import { PortalShell } from "@/components/portal/shell";
import { requireTeamProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProtectedPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireTeamProfile();

  return <PortalShell profile={profile}>{children}</PortalShell>;
}
