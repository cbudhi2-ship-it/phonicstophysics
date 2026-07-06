import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet Chris — a warm, structured 1-to-1 tutor helping learners from Year 1 phonics to A-level Maths and Science.",
};

const creds = [
  "🎓 Qualified teacher · 10 years",
  "📖 Reading & English",
  "➗ Maths (Y1 – A-level)",
  "🔬 GCSE Science",
  "✅ DBS checked",
  "💻 Online or in person",
];

export default function AboutPage() {
  return (
    <section className="py-14">
      <div className="wrap">
        <div className="grid items-center gap-11 md:grid-cols-[.8fr_1.2fr]">
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
            <h1 className="mb-3.5 mt-1 text-[34px]">Hi, I&apos;m Chris 👋</h1>
            <p className="mb-3.5 text-[16px] text-navy-soft">
              I&apos;m a qualified teacher with 10 years&apos; experience across
              Cambridge primary schools, where I taught a broad range of subjects
              and got to know how children really learn. For the last 4 years
              I&apos;ve also tutored one-to-one — working with students on reading
              and English skills, secondary maths, GCSE sciences, and applied
              maths at A-level.
            </p>
            <p className="mb-3.5 text-[16px] text-navy-soft">
              I believe every child can thrive with the right support, patience
              and a bit of fun. My approach is warm, structured and tailored to
              each learner: we find where the gaps are, set clear goals, and
              celebrate the wins along the way. Parents get honest updates so you
              always know how things are going.
            </p>
            <div className="mt-2 flex flex-wrap gap-2.5">
              {creds.map((c) => (
                <span
                  key={c}
                  className="rounded-pill border border-line bg-white px-3.5 py-1.5 text-[13px] font-semibold"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Approach */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            {
              n: "1",
              t: "Find the gaps",
              d: "A relaxed first session to see where your child is confident and where the tricky bits are.",
            },
            {
              n: "2",
              t: "Set clear goals",
              d: "Small, achievable targets so every lesson has a purpose and progress is easy to see.",
            },
            {
              n: "3",
              t: "Celebrate the wins",
              d: "We build confidence by noticing progress — and I keep parents in the loop with honest updates.",
            },
          ].map((step) => (
            <div key={step.n} className="card">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-pill bg-coral font-serif text-lg font-bold text-white">
                {step.n}
              </div>
              <h3 className="mb-2 text-[19px]">{step.t}</h3>
              <p className="text-[14px] text-muted">{step.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link href="/contact" className="btn btn-primary">
            Book a free intro call
          </Link>
        </div>
      </div>
    </section>
  );
}
