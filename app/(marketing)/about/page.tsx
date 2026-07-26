import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet Chris — a patient, SEND-trained 1-to-1 tutor helping children who find school a struggle, from learning to read in Year 1 through to GCSE and A-level.",
};

const creds = [
  "🎓 Qualified teacher",
  "🧩 SEND-trained (The National College)",
  "📖 Reading & English",
  "➗ Maths (Y1 – A-level)",
  "🔬 GCSE Science",
  "✅ DBS checked",
  "💻 Online, or in-person in Cambridge",
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
              I&apos;ve spent years tutoring children of every age and stage, and
              the work I care about most is helping the children who find learning
              hard going — the ones who&apos;ve fallen a bit behind, lost their
              confidence, or need things explained in a way that finally makes
              sense.
            </p>
            <p className="mb-3.5 text-[16px] text-navy-soft">
              I believe no child is &ldquo;just bad&rdquo; at a subject. Usually
              they&apos;ve missed a step somewhere and never had the time, one to
              one, to fill it in — and in a busy classroom of thirty, that&apos;s
              so easy to happen. My job is to find that step, go back, and build it
              properly, without pressure and at your child&apos;s pace.
            </p>
            <p className="mb-3.5 text-[16px] text-navy-soft">
              I&apos;ve completed specialist SEND training with The National
              College, and I support children with additional needs in mainstream
              school alongside the help they get in class. I&apos;m DBS checked,
              and I work online or in person across Cambridge.
            </p>
            <p className="mb-3.5 text-[16px] text-navy-soft">
              Most of all, I keep it calm and encouraging — because a child who
              feels safe and capable learns far faster than one who feels anxious.
              Small steps, every week. That&apos;s how the big results happen.
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
              t: "Understand your child",
              d: "A relaxed first session to see where they are, what they find hard, and what makes them switch off.",
            },
            {
              n: "2",
              t: "Go at their pace",
              d: "Small, achievable steps and no pressure — we build confidence with early wins, then keep them coming.",
            },
            {
              n: "3",
              t: "Keep you in the loop",
              d: "Honest, jargon-free updates — and I work alongside what your child is already doing in school.",
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
            Book a free intro chat
          </Link>
        </div>
      </div>
    </section>
  );
}
