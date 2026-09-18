import type { Metadata } from "next";
import { ContactForm } from "@/components/public/contact-form";
import { SectionHeading } from "@/components/ui/section-heading";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact GESS for membership, partnerships, and event inquiries.",
};

export default function ContactPage() {
  return (
    <div className="pt-24">
      <section className="section-pad page-shell grid gap-12 py-16 lg:grid-cols-[1fr_1.1fr] lg:py-20">
        <div>
          <SectionHeading
            eyebrow="Contact"
            title="Get in touch."
            description="Questions about membership, sponsorship, or collaborating on an event? Send a note."
          />

          <div className="mt-10 space-y-6 border border-gess-border bg-gess-surface/40 p-6">
            <div>
              <p className="text-meta text-gess-accent mb-2">Email</p>
              <a href={`mailto:${SITE.email}`} className="text-sm hover:text-gess-accent">
                {SITE.email}
              </a>
            </div>
            <div>
              <p className="text-meta text-gess-accent mb-2">Meetings</p>
              <p className="text-sm text-gess-muted">{SITE.meetingInfo}</p>
            </div>
            <div>
              <p className="text-meta text-gess-accent mb-2">Social</p>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href={SITE.socials.instagram} className="hover:text-gess-accent" target="_blank" rel="noreferrer">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href={SITE.socials.linkedin} className="hover:text-gess-accent" target="_blank" rel="noreferrer">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href={SITE.socials.discord} className="hover:text-gess-accent" target="_blank" rel="noreferrer">
                    Discord
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border border-gess-border bg-gess-surface/30 p-6 sm:p-8">
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
