import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for Phonics to Physics tutoring and courses.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions" updated="July 2026">
      <p>
        These terms govern the tutoring and courses provided by Phonics to
        Physics. By booking a lesson, buying lesson credits, or enrolling on a
        course you agree to them. If anything is unclear, just ask at{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>

      <h2>The service</h2>
      <ul>
        <li>
          One-to-one tutoring (55-minute lessons), delivered online or, for
          families in and around Cambridge, in person.
        </li>
        <li>
          Group courses such as the 11+ Summer Bootcamp, delivered live online.
        </li>
      </ul>

      <h2>Accounts &amp; access</h2>
      <ul>
        <li>
          The account holder must be an adult (parent or guardian) and is
          responsible for the account and for supervising younger children
          during online lessons.
        </li>
        <li>
          Portal accounts are set up by Chris after an introductory call — there
          is no open self-registration.
        </li>
        <li>
          Keep your login details secure and let us know promptly of any misuse.
        </li>
      </ul>

      <h2>Lesson credits &amp; pricing</h2>
      <ul>
        <li>
          One lesson credit = one 55-minute lesson. Credits are priced by level:
          Primary £30, Secondary £35, A-level £40, with a 10% saving on a pack of
          ten. All prices are in GBP.
        </li>
        <li>
          Credits are bought in advance via Stripe and shown in your portal.
          Credits are tier-specific and used as lessons are booked.
        </li>
        <li>
          Lesson credits expire 6 months after purchase. Expiry dates are shown
          in your transaction history.
        </li>
        <li>
          Some trusted, established clients may instead be enabled to book and
          pay in person by arrangement.
        </li>
      </ul>

      <h2>Booking, cancellations &amp; reschedules</h2>
      <ul>
        <li>You book your own lessons against Chris&apos;s live availability.</li>
        <li>
          Cancel or reschedule <strong>more than 24 hours</strong> before a
          lesson and your credit is returned to your balance.
        </li>
        <li>
          Cancel with <strong>less than 24 hours&apos; notice</strong>, or miss
          a lesson, and the credit is used — to respect the reserved time.
        </li>
      </ul>

      <h2>Refunds</h2>
      <p>
        Unused lesson credits can be refunded on request, less any lessons
        already delivered. Refunds are made to your original payment method via
        Stripe. Email{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a> to request one.
      </p>

      <h2>Courses &amp; bootcamps</h2>
      <ul>
        <li>
          Course places (e.g. the 11+ Summer Bootcamp) are sold as one programme
          and paid up front via Stripe.
        </li>
        <li>
          You may cancel a course place for a full refund up to 7 days before the
          start date; after that, fees are non-refundable, but all sessions are
          recorded so your child can catch up.
        </li>
        <li>
          Places are capped. Joining details are sent by email before the course
          begins.
        </li>
      </ul>

      <h2>Messaging &amp; conduct</h2>
      <p>
        The portal&apos;s messaging is for communication between the parent and
        Chris about lessons. Please keep it courteous and relevant; we may
        withdraw access for misuse.
      </p>

      <h2>Our responsibilities</h2>
      <p>
        We provide tutoring with reasonable care and skill, but learning outcomes
        depend on many factors, so we cannot guarantee specific grades or exam
        results. Nothing in these terms limits our liability where it would be
        unlawful to do so (including for death or personal injury caused by
        negligence). Otherwise, our liability is limited to the fees you have
        paid for the affected lessons or course.
      </p>

      <h2>Safeguarding</h2>
      <p>
        We take the safety of children seriously — see our{" "}
        <a href="/safeguarding">safeguarding statement</a> and{" "}
        <a href="/privacy">privacy policy</a>.
      </p>

      <h2>Changes &amp; governing law</h2>
      <p>
        We may update these terms from time to time; the latest version is always
        published here. These terms are governed by the law of England and Wales.
      </p>
    </LegalPage>
  );
}
