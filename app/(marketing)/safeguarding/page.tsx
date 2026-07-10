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
        statement sets out how Phonics to Physics helps keep children safe,
        whether in one-to-one lessons or a group course.
      </p>

      <h2>My commitments</h2>
      <ul>
        <li>
          I hold an enhanced <strong>DBS check</strong>, available for parents to
          view on request.
        </li>
        <li>
          A parent or guardian holds every account and is responsible for
          supervising younger children during online lessons.
        </li>
        <li>
          I never contact children privately. All arrangements and messages go
          through the parent, via the portal or email.
        </li>
        <li>
          I keep children&apos;s personal data to a minimum and never share it
          publicly (see our <a href="/privacy">privacy policy</a>).
        </li>
      </ul>

      <h2>Online lessons &amp; group courses</h2>
      <ul>
        <li>
          Sessions use a reputable video platform. Group sessions (such as the
          11+ Bootcamp) use a <strong>waiting room</strong> and a private join
          link shared only with enrolled families — never posted publicly.
        </li>
        <li>
          <strong>Cameras are optional</strong>, and there are no private
          one-to-one messages between children and the tutor during sessions.
        </li>
        <li>
          Parents are welcome nearby and are copied on all course communications.
        </li>
      </ul>

      <h2>Recordings</h2>
      <p>
        Some group sessions are recorded so enrolled families can catch up if
        they miss a day. Recordings are shared only with enrolled families
        through a private link, are not made public, and are deleted a
        reasonable time after the course ends. Please let me know at signup if
        you&apos;d prefer your child not to appear on camera.
      </p>

      <h2>Raising a concern</h2>
      <p>
        If you ever have a safeguarding concern, please contact me directly at{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>. If a child is at
        immediate risk of harm, always call the emergency services on{" "}
        <strong>999</strong>. You can also contact the NSPCC helpline on{" "}
        <strong>0808 800 5000</strong> or your local authority&apos;s children&apos;s
        services.
      </p>
    </LegalPage>
  );
}
