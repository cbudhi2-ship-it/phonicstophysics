import type { Metadata } from "next";
import Link from "next/link";
import { bookBootcamp } from "@/lib/bootcamp-actions";
import {
  bootcamp,
  bootcampFaq,
  bootcampIncludes,
  bootcampWeek,
  bootcampWeeks,
  bootcampPrice,
  isEarlyBird,
} from "@/lib/bootcamp";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "11+ Summer Bootcamp",
  description:
    "Complete 11+ Summer Bootcamp — daily live online lessons, 3–28 August 2026. English, Maths, Verbal & Non-Verbal Reasoning, building to a full mock. Early-bird £199.",
  openGraph: {
    title: "Complete 11+ Summer Bootcamp — Phonics to Physics",
    description:
      "Daily live online 11+ lessons this August, timed for the September grammar sit.",
    images: [{ url: "/bootcamp-flyer.png" }],
  },
};

const components = [
  { icon: "📖", name: "English", blurb: "Comprehension, vocabulary, grammar" },
  { icon: "➗", name: "Maths", blurb: "Arithmetic fluency & word problems" },
  { icon: "🔤", name: "Verbal Reasoning", blurb: "Codes, logic & sequences" },
  { icon: "🧩", name: "Non-Verbal Reasoning", blurb: "Shapes, rotations & patterns" },
];

function BookButton({ label }: { label: string }) {
  return (
    <form action={bookBootcamp}>
      <button type="submit" className="btn btn-primary">
        {label}
      </button>
    </form>
  );
}

export default async function BootcampPage({
  searchParams,
}: {
  searchParams: Promise<{ booked?: string; canceled?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const early = isEarlyBird();
  const price = bootcampPrice();

  return (
    <>
      {/* Status banners */}
      {(sp.booked || sp.error || sp.canceled) && (
        <div className="wrap pt-8">
          {sp.booked && (
            <div className="rounded-xl border border-teal/40 bg-[#EAF7F4] px-4 py-3 text-[14px] font-semibold text-teal">
              ✓ You&apos;re booked! Check your inbox for confirmation — joining
              details follow before we start.
            </div>
          )}
          {sp.error && (
            <div className="rounded-xl border border-coral/40 bg-coral/10 px-4 py-3 text-[14px] font-semibold text-coral-dark">
              Sorry — booking isn&apos;t available right now. Please try again
              shortly or email hello@phonicstophysics.com.
            </div>
          )}
          {sp.canceled && (
            <div className="rounded-xl border border-line bg-cream px-4 py-3 text-[14px] text-navy-soft">
              No problem — your place isn&apos;t booked. You can book any time
              below.
            </div>
          )}
        </div>
      )}

      {/* HERO */}
      <section className="py-14">
        <div className="wrap grid items-center gap-12 md:grid-cols-[1.1fr_.9fr]">
          <div>
            <span className="mb-4 inline-block rounded-pill border border-line bg-white px-3.5 py-1.5 text-[13px] font-bold text-teal">
              🎒 Live online · {bootcamp.datesLabel}
            </span>
            <h1 className="mb-4 text-[38px] leading-[1.08] md:text-[46px]">
              Complete <span className="text-coral">11+</span> Summer Bootcamp
            </h1>
            <p className="mb-7 max-w-[520px] text-[18px] text-navy-soft">
              {bootcamp.tagline}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <BookButton label="Book your place" />
              <Link href="#included" className="btn btn-ghost">
                See what&apos;s included
              </Link>
            </div>
          </div>

          <div className="card text-center">
            <div className="text-[13px] font-bold uppercase tracking-wide text-muted">
              {early ? "Early-bird price" : "Price"}
            </div>
            <div className="mt-1 font-serif text-[52px] leading-none text-navy">
              £{price}
            </div>
            {early && (
              <div className="mt-1 text-[14px] text-muted">
                <s>£{bootcamp.standardPrice}</s> · until{" "}
                {bootcamp.earlyBirdDeadlineLabel}
              </div>
            )}
            <div className="mt-4 space-y-1 text-left text-[14px] text-navy-soft">
              <div>📅 {bootcamp.datesLabel}</div>
              <div>⏰ {bootcamp.timeLabel}</div>
              <div>💻 Live online (Zoom) · all recorded</div>
              <div>👨‍👩‍👧 20% off a second child</div>
            </div>
          </div>
        </div>
      </section>

      {/* URGENCY */}
      <section className="border-y border-line bg-white">
        <div className="wrap py-4 text-center text-[14px] font-semibold text-navy-soft">
          ⏳ {early ? `Early-bird £${bootcamp.earlyBirdPrice} ends ${bootcamp.earlyBirdDeadlineLabel}` : "Standard pricing"}{" "}
          · places are capped to keep the group small — book early to secure a spot.
        </div>
      </section>

      {/* WHAT'S COVERED */}
      <section className="py-16" id="included">
        <div className="wrap">
          <div className="mb-10 text-center">
            <span className="eyebrow">The whole exam</span>
            <h2 className="mt-1.5 text-[34px]">All four components, every week</h2>
            <p className="mx-auto mt-3 max-w-[560px] text-[16px] text-navy-soft">
              The 11+ tests four things — so we cover all four every week and
              build difficulty toward a full timed mock.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {components.map((c) => (
              <div key={c.name} className="card text-center">
                <div className="text-3xl">{c.icon}</div>
                <h3 className="mt-2 text-[17px]">{c.name}</h3>
                <p className="mt-1 text-[13px] text-muted">{c.blurb}</p>
              </div>
            ))}
          </div>

          {/* Weekly grid */}
          <h3 className="mb-4 mt-12 text-center text-[22px]">
            What each week looks like
          </h3>
          <div className="overflow-x-auto rounded-[16px] border border-line bg-white shadow-soft">
            <table className="w-full min-w-[520px] text-left text-[14px]">
              <tbody>
                {bootcampWeek.map((d) => (
                  <tr key={d.day} className="border-b border-line last:border-0">
                    <td className="w-16 px-4 py-3 font-bold text-coral">
                      {d.day}
                    </td>
                    <td className="px-4 py-3 font-semibold text-navy">
                      {d.focus}
                    </td>
                    <td className="px-4 py-3 text-muted">{d.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Difficulty arc */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {bootcampWeeks.map((w) => (
              <div key={w.label} className="card">
                <div className="text-[13px] font-bold text-teal">{w.label}</div>
                <p className="mt-1 text-[14px] text-muted">{w.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY IT WORKS */}
      <section className="border-y border-line bg-white py-16">
        <div className="wrap max-w-[760px] text-center">
          <span className="eyebrow">Why it works</span>
          <h2 className="mt-1.5 text-[30px]">
            Steady daily practice beats last-minute cramming
          </h2>
          <p className="mt-4 text-[16px] text-navy-soft">
            A little every day — technique, then timing, then a full mock — so
            your child walks into the exam calm and ready. It&apos;s a small
            group, so every child is seen, taught by a DBS-checked teacher with
            10 years in Cambridge classrooms. Miss a day? Every session is
            recorded, and workbooks are included.
          </p>
          <div className="mt-6">
            <BookButton label="Book your place" />
          </div>
        </div>
      </section>

      {/* PRICING / INCLUDED */}
      <section className="py-16">
        <div className="wrap max-w-[560px]">
          <div className="mb-8 text-center">
            <span className="eyebrow">One price, everything included</span>
            <h2 className="mt-1.5 text-[32px]">
              £{price}
              {early && (
                <span className="ml-2 align-middle text-[18px] text-muted">
                  <s>£{bootcamp.standardPrice}</s>
                </span>
              )}
            </h2>
            <p className="mt-1 text-[14px] text-muted">
              {early
                ? `Early-bird until ${bootcamp.earlyBirdDeadlineLabel}, then £${bootcamp.standardPrice}`
                : "Standard price"}{" "}
              · 20% off a second child
            </p>
          </div>
          <div className="card">
            <ul className="space-y-2.5">
              {bootcampIncludes.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[15px]">
                  <span className="mt-0.5 text-teal">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <BookButton label={`Book your place — £${price}`} />
            </div>
            <p className="mt-3 text-center text-[12px] text-muted">
              Secure checkout via Stripe. A sibling code gives 20% off a second
              child at checkout.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-line bg-white py-16">
        <div className="wrap max-w-[720px]">
          <div className="mb-8 text-center">
            <span className="eyebrow">Good to know</span>
            <h2 className="mt-1.5 text-[30px]">Questions, answered</h2>
          </div>
          <div className="space-y-4">
            {bootcampFaq.map((f) => (
              <div key={f.q} className="card">
                <h3 className="text-[16px]">{f.q}</h3>
                <p className="mt-1 text-[14px] text-muted">{f.a}</p>
              </div>
            ))}
          </div>

          {/* Booking terms */}
          <div className="mt-6 rounded-xl border border-line bg-cream px-4 py-3 text-[13px] text-navy-soft">
            <strong>Booking terms:</strong> the course is paid up front via
            Stripe. You can cancel for a full refund up to 7 days before the
            start date; after that fees are non-refundable, but every session is
            recorded so your child can catch up. Places are capped and joining
            details are emailed before we start. Full{" "}
            <Link href="/terms" className="font-semibold text-teal">
              terms
            </Link>{" "}
            and{" "}
            <Link href="/safeguarding" className="font-semibold text-teal">
              safeguarding
            </Link>{" "}
            apply.
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="pb-8 pt-16">
        <div className="wrap">
          <div className="rounded-[24px] bg-navy px-8 py-12 text-center text-white shadow-soft">
            <h2 className="text-[30px] text-white">
              Give your child the best possible run-up
            </h2>
            <p className="mx-auto mt-3 max-w-[520px] text-[16px] text-[#C7D1E6]">
              Places are limited to keep the group small. Book now to secure
              your child&apos;s spot{early ? ` at the £${bootcamp.earlyBirdPrice} early-bird price` : ""}.
            </p>
            <div className="mt-6 flex justify-center">
              <BookButton label="Book your place" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
