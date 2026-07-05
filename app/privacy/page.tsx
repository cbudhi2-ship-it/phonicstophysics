import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Phonics to Physics collects, uses and protects your data.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="July 2026">
      <p>
        Phonics to Physics (&quot;we&quot;, &quot;I&quot;, Chris) is committed to
        protecting your privacy and that of your child. This policy explains what
        personal data we collect, why, and your rights under UK GDPR.
      </p>

      <h2>Who we are</h2>
      <p>
        Phonics to Physics is a sole-trader tutoring service. For any data
        questions, contact <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>From enquiries:</strong> parent/guardian name, email, optional
          phone number, the child&apos;s year group, subjects of interest and
          your message.
        </li>
        <li>
          <strong>From clients:</strong> lesson schedules, learning targets,
          homework and messages. For the child we keep only what&apos;s needed —
          typically a first name and year group.
        </li>
        <li>
          <strong>Payments:</strong> handled entirely by Stripe. We never see or
          store your card details — only a reference to your Stripe customer and
          payment records.
        </li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To reply to your enquiry and arrange lessons.</li>
        <li>To deliver tutoring, set targets and homework, and keep you updated.</li>
        <li>To take payment for lessons via Stripe.</li>
      </ul>
      <p>
        Our lawful bases are <em>legitimate interests</em> (responding to your
        enquiry), <em>contract</em> (providing tutoring you&apos;ve paid for) and{" "}
        <em>consent</em> where relevant.
      </p>

      <h2>Who we share it with</h2>
      <p>
        We only use trusted service providers to run the service: Stripe
        (payments), Resend (email), and our hosting and database providers. We
        never sell your data.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Enquiries that don&apos;t become clients are deleted within 12 months.
        Client records are kept for the duration of tutoring plus a reasonable
        period for tax and accounting.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask to access, correct or delete your data, or object to its use.
        Email <a href={`mailto:${site.email}`}>{site.email}</a> and we&apos;ll
        respond within one month. You may also complain to the ICO
        (ico.org.uk).
      </p>
    </LegalPage>
  );
}
