import Image from "next/image";
import Link from "next/link";
import { JourneyMark } from "@/components/Logo";
import {
  subjects,
  trustBadges,
  testimonials,
  whoIHelp,
  howIWork,
} from "@/lib/site";

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="py-14">
        <div className="wrap grid items-center gap-12 md:grid-cols-[1.1fr_.9fr]">
          <div>
            <span className="mb-4 inline-block rounded-pill border border-line bg-white px-3.5 py-1.5 text-[13px] font-bold text-teal">
              Patient 1-to-1 tutoring · online &amp; in person
            </span>
            <h1 className="mb-4 text-[38px] leading-[1.1] md:text-[48px]">
              Every child can <span className="text-coral">get there</span>
              <br />
              — with the right support, at{" "}
              <span className="text-teal">the right pace</span>.
            </h1>
            <p className="mb-7 max-w-[540px] text-[18px] text-navy-soft">
              Patient, one-to-one tutoring for children who are finding school a
              struggle — including SEND learners in mainstream school who need
              extra support. From learning to read in Year 1, through to GCSE and
              A-level.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className="btn btn-primary">
                Book a free intro chat
              </Link>
              <Link href="#how-i-help" className="btn btn-ghost">
                How I help
              </Link>
            </div>
          </div>

          <div className="card text-center">
            <div
              className="relative mb-4 flex h-[220px] items-center justify-center overflow-hidden rounded-2xl"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, #FFE9CF, transparent 60%), radial-gradient(circle at 75% 70%, #D5F0EA, transparent 60%), #FBF5EC",
              }}
            >
              <JourneyMark size={160} />
            </div>
            <div className="mt-1.5 flex justify-around">
              {[
                ["10 yrs", "in the classroom"],
                ["SEND", "trained"],
                ["DBS", "checked"],
              ].map(([big, small]) => (
                <div key={small}>
                  <b className="block font-serif text-[26px] text-navy">
                    {big}
                  </b>
                  <span className="text-[12px] text-muted">{small}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-line bg-white">
        <div className="wrap flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-5 text-[14px] font-semibold text-navy-soft">
          {trustBadges.map((b) => (
            <span key={b} className="flex items-center gap-2">
              <span className="text-teal">✓</span>
              {b}
            </span>
          ))}
        </div>
      </section>

      {/* WHO I HELP */}
      <section id="how-i-help" className="scroll-mt-24 py-16">
        <div className="wrap grid gap-11 md:grid-cols-[.9fr_1.1fr] md:items-start">
          <div>
            <span className="eyebrow">Who I help</span>
            <h2 className="mt-1.5 text-[34px]">
              For the children who need a little more time.
            </h2>
            <p className="mt-4 max-w-[440px] text-[16px] text-navy-soft">
              No child is &ldquo;just bad&rdquo; at a subject. Usually they&apos;ve
              missed a step somewhere and never had the time, one to one, to fill
              it in. My job is to find that step, go back, and build it properly —
              without pressure, at your child&apos;s pace.
            </p>
          </div>
          <ul className="space-y-3">
            {whoIHelp.map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-2xl border border-line bg-white p-4 text-[15px] text-navy-soft"
              >
                <span className="mt-0.5 shrink-0 text-teal">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* SUBJECTS */}
      <section className="border-y border-line bg-white py-16">
        <div className="wrap">
          <div className="mb-10 text-center">
            <span className="eyebrow">What I teach</span>
            <h2 className="mt-1.5 text-[36px]">Support at every stage</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {subjects.map((s) => (
              <div key={s.title} className="card">
                <div
                  className="mb-3.5 flex h-12 w-12 items-center justify-center rounded-[14px] text-2xl"
                  style={{ background: s.iconBg }}
                >
                  {s.icon}
                </div>
                <h3 className="mb-2 text-[20px]">{s.title}</h3>
                <p className="text-[14px] text-muted">{s.blurb}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-[620px] text-center text-[15px] text-navy-soft">
            Plus support across the wider curriculum — including{" "}
            <span className="font-semibold">GCSE Religious Studies (RE) &amp;
            Ethics</span>. If it&apos;s on your child&apos;s timetable, just ask.
          </p>
        </div>
      </section>

      {/* HOW I WORK */}
      <section className="py-16">
        <div className="wrap">
          <div className="mb-10 text-center">
            <span className="eyebrow">How I work</span>
            <h2 className="mt-1.5 text-[34px]">Calm, patient, one step at a time</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {howIWork.map((step, i) => (
              <div key={step.title} className="card">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-pill bg-coral font-serif text-lg font-bold text-white">
                  {i + 1}
                </div>
                <h3 className="mb-2 text-[18px]">{step.title}</h3>
                <p className="text-[14px] text-muted">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT TEASER */}
      <section className="border-y border-line bg-white py-16">
        <div className="wrap grid items-center gap-11 md:grid-cols-[.8fr_1.2fr]">
          <div className="relative aspect-square overflow-hidden rounded-[20px] border border-line shadow-soft">
            <Image
              src="/chris.jpg"
              alt="Chris, founder and tutor at Phonics to Physics"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover object-[50%_25%]"
              priority
            />
          </div>
          <div>
            <span className="eyebrow">About me</span>
            <h2 className="mb-3.5 mt-1 text-[34px]">Hi, I&apos;m Chris 👋</h2>
            <p className="mb-3.5 text-[16px] text-navy-soft">
              I&apos;m a qualified teacher, and the work I care about most is
              helping the children who find learning hard going — the ones
              who&apos;ve fallen a bit behind, lost their confidence, or need
              things explained in a way that finally makes sense. I&apos;ve
              completed specialist SEND training with The National College, and I
              support children with additional needs in mainstream school
              alongside the help they get in class.
            </p>
            <Link href="/about" className="btn btn-teal mt-2">
              Read more about me
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16">
        <div className="wrap">
          <div className="mb-10 text-center">
            <span className="eyebrow">Kind words</span>
            <h2 className="mt-1.5 text-[36px]">What families say</h2>
          </div>
          <div
            className={`grid gap-6 ${
              testimonials.length > 1 ? "md:grid-cols-2" : "mx-auto max-w-[720px]"
            }`}
          >
            {testimonials.map((t) => (
              <figure key={t.name} className="card flex flex-col">
                <div className="mb-3 text-[28px] leading-none text-coral">“</div>
                <blockquote className="text-[16px] text-navy-soft">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-4 border-t border-line pt-4">
                  <span className="block font-serif text-[17px] text-navy">
                    {t.name}
                  </span>
                  <span className="text-[13px] text-muted">{t.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-8">
        <div className="wrap">
          <div className="rounded-[24px] bg-navy px-8 py-12 text-center text-white shadow-soft">
            <h2 className="text-[32px] text-white">
              It&apos;s not too late — and you&apos;re not alone.
            </h2>
            <p className="mx-auto mt-3 max-w-[560px] text-[16px] text-[#C7D1E6]">
              If your child has been struggling, a calm, patient bit of
              one-to-one help can change how they feel about learning entirely.
              Book a free, no-pressure chat and tell me about your child.
            </p>
            <Link href="/contact" className="btn btn-primary mt-6">
              Book a free intro chat
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
