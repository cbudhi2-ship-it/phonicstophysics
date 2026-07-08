"use client";

import { useRef, useState } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import {
  enquirySchema,
  modeOptions,
  subjectOptions,
  yearGroups,
  type EnquiryInput,
} from "@/lib/enquiry";

type Status = "idle" | "submitting" | "success" | "error";

const fieldClass =
  "w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[15px] outline-none focus:border-teal";
const labelClass = "mb-1.5 block text-[13px] font-bold";

const HCAPTCHA_SITEKEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY;

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha>(null);

  function toggleSubject(s: string) {
    setSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      company: String(fd.get("company") ?? ""),
      parentName: String(fd.get("parentName") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      yearGroup: String(fd.get("yearGroup") ?? ""),
      subjects,
      mode: String(fd.get("mode") ?? ""),
      message: String(fd.get("message") ?? ""),
    };

    // Client-side validation for instant feedback.
    const parsed = enquirySchema.safeParse(payload as unknown as EnquiryInput);
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors)
        .flat()
        .filter(Boolean)[0];
      setError(first ?? "Please check the form and try again.");
      return;
    }

    if (HCAPTCHA_SITEKEY && !captchaToken) {
      setError("Please tick the box to confirm you're human.");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, captchaToken }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? "Something went wrong.");
      }
      setStatus("success");
      form.reset();
      setSubjects([]);
      setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
    }
  }

  if (status === "success") {
    return (
      <div className="card text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-pill bg-teal text-2xl text-white">
          ✓
        </div>
        <h2 className="mb-2 text-[24px]">Thank you — enquiry received!</h2>
        <p className="text-[15px] text-navy-soft">
          I&apos;ll be in touch personally, usually within a day or two, to
          arrange your free intro call. Check your inbox for a confirmation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4" noValidate>
      {/* Honeypot — hidden from humans, tempting to bots */}
      <div className="hidden" aria-hidden="true">
        <label>
          Company
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="parentName" className={labelClass}>
            Your name
          </label>
          <input
            id="parentName"
            name="parentName"
            type="text"
            required
            className={fieldClass}
            placeholder="Parent / guardian name"
          />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className={fieldClass}
            placeholder="you@email.com"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className={fieldClass}
            placeholder="07xxx xxx xxx"
          />
        </div>
        <div>
          <label htmlFor="yearGroup" className={labelClass}>
            Child&apos;s year group
          </label>
          <select id="yearGroup" name="yearGroup" required className={fieldClass}>
            <option value="">Choose…</option>
            {yearGroups.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <span className={labelClass}>Subject(s) of interest</span>
        <div className="flex flex-wrap gap-2">
          {subjectOptions.map((s) => {
            const on = subjects.includes(s);
            return (
              <button
                type="button"
                key={s}
                onClick={() => toggleSubject(s)}
                aria-pressed={on}
                className={`rounded-pill border px-3.5 py-2 text-[14px] font-semibold transition-colors ${
                  on
                    ? "border-teal bg-teal text-white"
                    : "border-line bg-white text-navy hover:border-teal"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <span className={labelClass}>Lesson preference</span>
        <div className="flex flex-wrap gap-2">
          {modeOptions.map((m, i) => (
            <label
              key={m}
              className="flex cursor-pointer items-center gap-2 rounded-pill border border-line bg-white px-3.5 py-2 text-[14px] font-semibold has-[:checked]:border-teal has-[:checked]:bg-[#EAF7F4]"
            >
              <input
                type="radio"
                name="mode"
                value={m}
                defaultChecked={i === 2}
                className="accent-teal"
              />
              {m}
            </label>
          ))}
        </div>
        <p className="mt-2 text-[12px] text-muted">
          In-person lessons are available for students in and around Cambridge —
          everywhere else is online.
        </p>
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          How can I help?
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          className={fieldClass}
          placeholder="Tell me a little about your child and what you're looking for."
        />
      </div>

      {HCAPTCHA_SITEKEY && (
        <HCaptcha
          ref={captchaRef}
          sitekey={HCAPTCHA_SITEKEY}
          onVerify={(token) => setCaptchaToken(token)}
          onExpire={() => setCaptchaToken(null)}
        />
      )}

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-coral/40 bg-coral/10 px-3.5 py-2.5 text-[14px] font-semibold text-coral-dark"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="btn btn-primary w-full disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Send enquiry"}
      </button>

      <p className="text-center text-[12px] text-muted">
        By sending this you agree to our{" "}
        <a href="/privacy" className="font-semibold text-teal">
          privacy policy
        </a>
        . We only use your details to reply to your enquiry.
      </p>
    </form>
  );
}
