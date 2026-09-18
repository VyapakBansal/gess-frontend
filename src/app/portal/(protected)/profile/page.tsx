import type { Metadata } from "next";
import { ProfileForm } from "@/components/portal/profile-form";
import { requireTeamProfile } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const { profile } = await requireTeamProfile();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-meta text-gess-accent mb-2">Profile</p>
        <h1 className="text-3xl font-semibold tracking-tight">Your team card</h1>
        <p className="mt-2 text-sm text-gess-muted">
          Only you can edit this profile. Changes appear on the public Team page after revalidation.
        </p>
      </div>
      <ProfileForm profile={profile} />
    </div>
  );
}
