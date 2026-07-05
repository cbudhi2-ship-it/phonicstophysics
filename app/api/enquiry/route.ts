import { NextResponse } from "next/server";
import { enquirySchema } from "@/lib/enquiry";
import { site } from "@/lib/site";

// Very small in-memory rate limiter (per warm serverless instance).
// Good enough to blunt casual spam; a durable store (Upstash/Redis) can
// replace this later without changing the route contract.
const hits = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.first > WINDOW_MS) {
    hits.set(ip, { count: 1, first: now });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again shortly." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 },
    );
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Please check the form and try again.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  const data = parsed.data;

  // Honeypot filled → silently accept without doing anything.
  if (data.company) {
    return NextResponse.json({ ok: true });
  }

  // TODO(Phase 2): persist the enquiry to the database with status "new".

  const apiKey = process.env.RESEND_API_KEY;
  const notify = process.env.CONTACT_NOTIFY_EMAIL ?? site.email;
  const from =
    process.env.CONTACT_FROM_EMAIL ??
    `Phonics to Physics <onboarding@resend.dev>`;

  // If email isn't configured yet, don't fail the enquiry — log and succeed
  // so the marketing site works before Resend is wired up.
  if (!apiKey) {
    console.warn(
      "[enquiry] RESEND_API_KEY not set — enquiry received but no email sent.",
      { parentName: data.parentName, email: data.email },
    );
    return NextResponse.json({ ok: true, emailed: false });
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const summary = `
      <h2>New enquiry</h2>
      <p><strong>Name:</strong> ${escapeHtml(data.parentName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(data.phone || "—")}</p>
      <p><strong>Year group:</strong> ${escapeHtml(data.yearGroup)}</p>
      <p><strong>Subjects:</strong> ${escapeHtml(data.subjects.join(", "))}</p>
      <p><strong>Mode:</strong> ${escapeHtml(data.mode)}</p>
      <p><strong>Message:</strong><br>${escapeHtml(data.message).replace(/\n/g, "<br>")}</p>
    `;

    // Notify Chris
    await resend.emails.send({
      from,
      to: notify,
      replyTo: data.email,
      subject: `New enquiry — ${data.parentName} (${data.yearGroup})`,
      html: summary,
    });

    // Auto-reply to the enquirer
    await resend.emails.send({
      from,
      to: data.email,
      subject: "Thanks for your enquiry — Phonics to Physics",
      html: `
        <p>Hi ${escapeHtml(data.parentName.split(" ")[0])},</p>
        <p>Thanks for getting in touch with Phonics to Physics. I've received your
        enquiry and will reply personally, usually within a day or two, to arrange
        a free intro call.</p>
        <p>Warm wishes,<br>Chris<br><em>Small steps, big results.</em></p>
      `,
    });

    return NextResponse.json({ ok: true, emailed: true });
  } catch (err) {
    console.error("[enquiry] Failed to send email:", err);
    return NextResponse.json(
      {
        ok: false,
        error: "Sorry — something went wrong sending your enquiry.",
      },
      { status: 502 },
    );
  }
}
