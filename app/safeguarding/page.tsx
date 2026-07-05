import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Safeguarding",
  description:
    "Phonics to Physics is committed to keeping children safe. Read our safeguarding statement.",
};

export default function SafeguardingPage() {
  return (
    <LegalPage title="Safeguarding Statement" updated="July 2026">
      <p>
        The wellbeing and safety of every child I work with comes first. This
        statement sets out how Phonics to Physics helps keep children safe.
      </p>

      <h2>My commitments</h2>
      <ul>
        <li>
          I hold an enhanced <strong>DBS check</strong>, available for parents to
          view on request.
        </li>
        <li>
          Lessons for younger children take place with a parent or guardian at
          home and aware of the session, whether online or in person.
        </li>
        <li>
          Online lessons use reputable video tools; I do not contact children
          privately. All arrangements and messages go through the parent.
        </li>
        <li>
          I keep children&apos;s personal data to a minimum and never share it
          publicly.
        </li>
      </ul>

      <h2>Concerns</h2>
      <p>
        If you ever have a safeguarding concern, please contact me directly at{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>. If a child is at
        immediate risk of harm, always contact the emergency services on 999, or
        the NSPCC helpline on 0808 800 5000.
      </p>
    </LegalPage>
  );
}
