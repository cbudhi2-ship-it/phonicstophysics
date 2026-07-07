import type { Metadata } from "next";
import Link from "next/link";
import { pricing } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple pay-as-you-go tutoring. Primary £30, Secondary £35, A-level £40 per 55-min lesson — or save 10% with a 10-lesson pack. Book your own slots, cancel free up to 24h.",
};

const steps = [
  {
    n: "1",
    t: "Buy lessons",
    d: "Top up in a few taps — pay for a single lesson or save 10% with a pack of ten. No subscription, no lock-in.",
  },
  {
    n: "2",
    t: "Book yourself",
    d: "Pick a slot that suits you from Chris's live availability. One lesson credit is used per booking.",
  },
  {
    n: "3",
    t: "Cancel free up to 24h",
    d: "Life happens. Cancel or reschedule more than 24 hours ahead and your lesson credit is returned.",
  },
];

export default function PricingPage() {
  return (
    <section className="py-14">
      <div className="wrap">
        {/* Heading */}
        <div className="mb-10 text-center">
          <span className="eyebrow">Simple, fair pricing</span>
          <h1 className="mt-1.5 text-[36px]">Pay as you go</h1>
          <p className="mx-auto mt-3 max-w-[580px] text-[17px] text-navy-soft">
            Every lesson is a friendly, focused 55 minutes, one-to-one. Buy
            lessons as you need them, book your own slots online, and only ever
            pay for what you use.
          </p>
        </div>

        {/* Tier cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {pricing.map((p) => (
            <div key={p.tier} className="card flex flex-col">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-[22px]">{p.tier}</h2>
                  <p className="text-[13px] text-muted">{p.years}</p>
                </div>
                <span
                  className="rounded-pill px-3 py-1 text-[12px] font-bold text-navy"
                  style={{ background: p.iconBg }}
                >
                  55 min
                </span>
              </div>

              <div className="mb-1 flex items-baseline gap-1.5">
                <span className="font-serif text-[40px] leading-none text-navy">
                  £{p.single}
                </span>
                <span className="text-[14px] text-muted">/ lesson</span>
              </div>

              <div className="mt-4 rounded-xl border border-line bg-cream px-4 py-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-[15px] font-semibold">
                    Pack of 10
                  </span>
                  <span className="font-serif text-[20px] text-navy">
                    £{p.pack}
                  </span>
                </div>
                <p className="mt-0.5 text-[13px] text-teal">
                  Save £{p.save} — that&apos;s £{p.pack / 10} a lesson (10% off)
                </p>
              </div>

              <Link
                href="/contact"
                className="btn btn-primary mt-6 w-full"
              >
                Book a free intro call
              </Link>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mt-16">
          <div className="mb-8 text-center">
            <span className="eyebrow">How it works</span>
            <h2 className="mt-1.5 text-[30px]">Lessons, on your terms</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="card">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-pill bg-coral font-serif text-lg font-bold text-white">
                  {s.n}
                </div>
                <h3 className="mb-2 text-[19px]">{s.t}</h3>
                <p className="text-[14px] text-muted">{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Fine print */}
        <p className="mx-auto mt-10 max-w-[640px] text-center text-[13px] text-muted">
          The right tier is set by your child&apos;s year group. In-person
          lessons are available for students in and around Cambridge; everywhere
          else is online. Lesson credits are valid for 6 months from purchase.
          Full details are in our{" "}
          <Link href="/terms" className="font-semibold text-teal">
            terms
          </Link>
          .
        </p>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="mb-5 text-[16px] text-navy-soft">
            Not sure which tier fits, or want to chat it through first?
          </p>
          <Link href="/contact" className="btn btn-primary">
            Book a free intro call
          </Link>
        </div>
      </div>
    </section>
  );
}
