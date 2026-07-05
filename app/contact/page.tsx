import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";
import { trustBadges } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Book a free intro call with Phonics to Physics. Tell me about your child and what you're looking for.",
};

export default function ContactPage() {
  return (
    <section className="py-14">
      <div className="wrap grid items-start gap-12 md:grid-cols-[.9fr_1.1fr]">
        <div>
          <span className="eyebrow">Get in touch</span>
          <h1 className="mb-4 mt-1.5 text-[36px] leading-tight">
            Book a free intro call
          </h1>
          <p className="mb-6 text-[17px] text-navy-soft">
            No pressure and no obligation — just a friendly chat about where your
            child is now and how I can help. Fill in the form and I&apos;ll be in
            touch personally.
          </p>
          <ul className="space-y-3">
            {trustBadges.map((b) => (
              <li key={b} className="flex items-center gap-2.5 font-semibold">
                <span className="flex h-6 w-6 items-center justify-center rounded-pill bg-teal text-[13px] text-white">
                  ✓
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
