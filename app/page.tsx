import Link from "next/link";
import { JourneyMark } from "@/components/Logo";
import { subjects, trustBadges } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="py-14">
        <div className="wrap grid items-center gap-12 md:grid-cols-[1.1fr_.9fr]">
          <div>
            <span className="mb-4 inline-block rounded-pill border border-line bg-white px-3.5 py-1.5 text-[13px] font-bold text-teal">
              1-to-1 tutoring · in person &amp; online
            </span>
            <h1 className="mb-4 text-[40px] leading-[1.08] md:text-[52px]">
              From <span className="text-coral">first words</span>
              <br />
              to <span className="text-teal">final exams</span>.
            </h1>
            <p className="mb-7 max-w-[520px] text-[19px] text-navy-soft">
              Friendly, patient tuition from Year 1 phonics all the way to
              A-level Maths and Science — building confidence one lesson at a
              time.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className="btn btn-primary">
                Book a free intro call
              </Link>
              <Link href="/about" className="btn btn-ghost">
                Meet your tutor
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
                ["7+", "years tutoring"],
                ["Y1–A-lvl", "all ages"],
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

      {/* SUBJECTS */}
      <section className="py-16">
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
        </div>
      </section>

      {/* ABOUT TEASER */}
      <section className="border-y border-line bg-white py-16">
        <div className="wrap grid items-center gap-11 md:grid-cols-[.8fr_1.2fr]">
          <div
            className="flex aspect-square items-center justify-center rounded-[20px] border border-line font-bold text-navy-soft shadow-soft"
            style={{
              background: "linear-gradient(135deg,#FFE9CF,#D5F0EA)",
            }}
          >
            Your photo here
          </div>
          <div>
            <span className="eyebrow">About me</span>
            <h2 className="mb-3.5 mt-1 text-[34px]">Hi, I&apos;m Chris 👋</h2>
            <p className="mb-3.5 text-[16px] text-navy-soft">
              I&apos;ve spent the last several years tutoring students of every
              age and stage — from helping five-year-olds sound out their first
              words, to guiding A-level students through calculus and mechanics.
              I believe every child can thrive with the right support, patience
              and a bit of fun.
            </p>
            <Link href="/about" className="btn btn-teal mt-2">
              Read more about me
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS PLACEHOLDER */}
      <section className="py-16">
        <div className="wrap">
          <div className="mb-10 text-center">
            <span className="eyebrow">Kind words</span>
            <h2 className="mt-1.5 text-[36px]">What parents say</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <figure key={i} className="card">
                <div className="mb-3 text-gold">★★★★★</div>
                <blockquote className="text-[15px] italic text-navy-soft">
                  “A short, glowing testimonial from a parent will sit here once
                  reviews come in.”
                </blockquote>
                <figcaption className="mt-4 text-[13px] font-semibold text-muted">
                  Parent of a Year — learner
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
              Ready to take the first step?
            </h2>
            <p className="mx-auto mt-3 max-w-[520px] text-[16px] text-[#C7D1E6]">
              Book a free, no-pressure intro call. We&apos;ll talk through where
              your child is now and how I can help.
            </p>
            <Link href="/contact" className="btn btn-primary mt-6">
              Book a free intro call
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
