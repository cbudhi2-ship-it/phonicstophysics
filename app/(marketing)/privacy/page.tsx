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
        Phonics to Physics (&quot;we&quot;, &quot;I&quot;, Chris) is committed
        to protecting your privacy and that of your child. This policy explains
        what personal data we collect, why, who we share it with, and your
        rights under UK GDPR and the Data Protection Act 2018.
      </p>

      <h2>Who we are</h2>
      <p>
        Phonics to Physics is a sole-trader tutoring service based in the UK and
        is the data controller for your information. For any privacy question or
        request, contact <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Enquiries:</strong> parent/guardian name, email, optional
          phone number, the child&apos;s year group, subjects of interest and
          your message.
        </li>
        <li>
          <strong>Account &amp; children:</strong> your name, email and phone;
          and for each child, the minimum needed to tutor them — typically a
          first name and year group.
        </li>
        <li>
          <strong>Learning data:</strong> lesson bookings, learning targets,
          homework and progress, and messages you exchange with Chris in the
          portal.
        </li>
        <li>
          <strong>Payments &amp; lesson credits:</strong> a record of purchases,
          lesson-credit balances and bookings. Card payments are processed
          entirely by Stripe — we never see or store your card details, only a
          reference to your Stripe customer and payment.
        </li>
        <li>
          <strong>Bootcamp bookings:</strong> the name, email and phone provided
          at checkout, and your booking/payment reference.
        </li>
        <li>
          <strong>Technical:</strong> a secure sign-in cookie to keep you logged
          in, and basic server logs (for security and to keep the site running).
        </li>
      </ul>

      <h2>How we use it &amp; our lawful bases</h2>
      <ul>
        <li>To reply to your enquiry — <em>legitimate interests</em>.</li>
        <li>
          To provide tutoring, run your account, take payment and manage
          bookings — <em>contract</em>.
        </li>
        <li>
          To send service emails (confirmations, reminders, messages,
          receipts) — <em>contract</em> / <em>legitimate interests</em>.
        </li>
        <li>
          To keep the service secure and prevent spam and fraud —{" "}
          <em>legitimate interests</em>.
        </li>
        <li>Where the law requires consent, we&apos;ll ask for it first.</li>
      </ul>
      <p>
        We do not use your data for advertising, and we do not sell it. We
        don&apos;t send marketing emails without your consent.
      </p>

      <h2>Who we share it with</h2>
      <p>
        We use a small number of trusted providers to run the service. They only
        process data on our instructions:
      </p>
      <ul>
        <li>
          <strong>Supabase</strong> — secure database &amp; sign-in (stores
          account, children, lessons and messages).
        </li>
        <li>
          <strong>Stripe</strong> — payment processing (card details go directly
          to Stripe).
        </li>
        <li>
          <strong>Cal.com</strong> — lesson scheduling and booking.
        </li>
        <li>
          <strong>Vercel</strong> — website hosting.
        </li>
        <li>
          <strong>Namecheap Private Email</strong> — sending our emails.
        </li>
        <li>
          <strong>hCaptcha</strong> — anti-spam checks on the contact form.
        </li>
      </ul>
      <p>
        Some providers are based outside the UK/EEA. Where data is transferred
        internationally, it is protected by appropriate safeguards such as the
        UK International Data Transfer Agreement or Standard Contractual Clauses.
      </p>

      <h2>Cookies</h2>
      <p>
        We only use essential cookies — a secure, http-only cookie that keeps
        you signed in to the portal. We don&apos;t use advertising or tracking
        cookies, so there&apos;s no cookie banner to click through.
      </p>

      <h2>Children&apos;s data</h2>
      <p>
        The account holder is always an adult (parent/guardian). We hold only
        minimal information about children (typically a first name, year group,
        their targets and homework), it is never shown publicly, and messaging
        is between the parent and Chris only. See also our{" "}
        <a href="/safeguarding">safeguarding statement</a>.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Enquiries that don&apos;t become clients are deleted within 12 months.
        Account and learning records are kept while you&apos;re a client and for
        a reasonable period afterwards. Payment records are kept for at least 6
        years to meet UK tax and accounting rules.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask to access, correct, delete or export your data, or object to
        or restrict its use. Email{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a> and we&apos;ll respond
        within one month. If you&apos;re unhappy with how we&apos;ve handled your
        data, you can complain to the Information Commissioner&apos;s Office
        (ico.org.uk).
      </p>

      <h2>Changes</h2>
      <p>
        We may update this policy from time to time; the latest version is
        always published here.
      </p>
    </LegalPage>
  );
}
