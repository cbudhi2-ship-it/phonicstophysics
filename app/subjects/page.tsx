import type { Metadata } from "next";
import Link from "next/link";
import { subjects } from "@/lib/site";

export const metadata: Metadata = {
  title: "Subjects",
  description:
    "Reading & English (phonics to comprehension and writing), Maths from Year 1 to A-level, and GCSE Science — Biology, Chemistry and Physics.",
};

const detail: Record<string, string[]> = {
  "Reading & English": [
    "Phonics, blending & early reading fluency",
    "Comprehension, grammar & writing skills",
    "A love of books and reading for pleasure",
  ],
  "Maths, Y1 to A-level": [
    "Number, times tables & SATs (KS1–KS2)",
    "GCSE Foundation & Higher, exam technique",
    "A-level: pure, mechanics & statistics",
  ],
  "GCSE Science": [
    "Biology, Chemistry & Physics",
    "Clear explanations of tricky concepts",
    "Past-paper practice & revision skills",
  ],
};

export default function SubjectsPage() {
  return (
    <section className="py-14">
      <div className="wrap">
        <div className="mb-10 text-center">
          <span className="eyebrow">What I teach</span>
          <h1 className="mt-1.5 text-[36px]">Support at every stage</h1>
          <p className="mx-auto mt-3 max-w-[560px] text-[16px] text-navy-soft">
            One-to-one lessons tailored to your child — in person or online, at a
            pace that suits them.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {subjects.map((s) => (
            <div key={s.title} className="card flex flex-col">
              <div
                className="mb-3.5 flex h-12 w-12 items-center justify-center rounded-[14px] text-2xl"
                style={{ background: s.iconBg }}
              >
                {s.icon}
              </div>
              <h2 className="mb-2 text-[20px]">{s.title}</h2>
              <p className="mb-4 text-[14px] text-muted">{s.blurb}</p>
              <ul className="mt-auto space-y-2 text-[14px] text-navy-soft">
                {detail[s.title].map((d) => (
                  <li key={d} className="flex gap-2">
                    <span className="text-teal">✓</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-[620px] text-center text-[15px] text-navy-soft">
          Plus support across the wider curriculum — including{" "}
          <span className="font-semibold">GCSE Religious Studies (RE) &amp;
          Ethics</span>. If it&apos;s on your child&apos;s timetable, just ask.
        </p>

        <div className="mt-14 text-center">
          <p className="mb-5 text-[16px] text-navy-soft">
            Not sure which is the right fit? Let&apos;s have a chat.
          </p>
          <Link href="/contact" className="btn btn-primary">
            Book a free intro call
          </Link>
        </div>
      </div>
    </section>
  );
}
