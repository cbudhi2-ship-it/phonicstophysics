import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of service for Phonics to Physics tutoring.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="July 2026">
      <p>
        These terms govern tutoring provided by Phonics to Physics. By booking
        lessons you agree to them. If anything is unclear, just ask at{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>

      <h2>Lessons</h2>
      <ul>
        <li>Lessons are one-to-one, delivered online or in person as agreed.</li>
        <li>
          Times and subjects are arranged directly between you and Chris and
          shown in your parent portal.
        </li>
      </ul>

      <h2>Payment</h2>
      <ul>
        <li>
          Fees are agreed in advance and paid via Stripe — pay-per-lesson or as a
          prepaid block of lessons.
        </li>
        <li>
          Prepaid lesson credits are used as lessons are completed and are shown
          in your portal.
        </li>
        <li>All prices are in GBP.</li>
      </ul>

      <h2>Cancellations &amp; rescheduling</h2>
      <p>
        Please give at least 24 hours&apos; notice to reschedule or cancel a
        lesson. Lessons cancelled with less notice may be charged, at Chris&apos;s
        discretion, to respect the reserved time.
      </p>

      <h2>Refunds</h2>
      <p>
        Unused prepaid lesson credits can be refunded on request, less any
        lessons already delivered. Contact{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>

      <h2>Responsibilities</h2>
      <p>
        Tutoring supports a child&apos;s learning but does not guarantee specific
        grades or outcomes. A parent or guardian is responsible for the
        account and for supervising younger children during online lessons.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms from time to time; the latest version will
        always be published here.
      </p>
    </LegalPage>
  );
}
