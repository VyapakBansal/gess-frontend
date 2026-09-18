import type { Metadata } from "next";
import { Reveal } from "@/components/public/reveal";
import { TeamCard } from "@/components/team/team-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getTeamMembers } from "@/lib/public-data";

export const metadata: Metadata = {
  title: "Team",
  description: "Meet the GESS executive team — photos, roles, and profiles.",
};

export const revalidate = 21600;

export default async function TeamPage() {
  const team = await getTeamMembers();

  return (
    <div className="pt-24">
      <section className="section-pad page-shell py-16 sm:py-20">
        <Reveal>
          <SectionHeading
            className="mb-10"
            eyebrow="Executive team"
            title="The people behind the signal."
            description="Profiles and photographs are maintained by executives through the GESS portal."
          />
        </Reveal>

        {team.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {team.map((member, index) => (
              <Reveal key={member.id} delay={index * 60}>
                <div className="card-interactive">
                  <TeamCard member={member} />
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-gess-border p-8 text-sm text-gess-muted">
            Team profiles will appear here once executives publish them in the portal.
          </div>
        )}
      </section>
    </div>
  );
}
