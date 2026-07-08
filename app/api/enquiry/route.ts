import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { enquirySchema } from "@/lib/enquiry";
import { site } from "@/lib/site";

// nodemailer needs the Node.js runtime (not Edge).
export const runtime = "nodejs";

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

  // Verify hCaptcha, if configured. Skipped gracefully until the secret is set.
  const hcaptchaSecret = process.env.HCAPTCHA_SECRET;
  if (hcaptchaSecret) {
    const token =
      body && typeof body === "object" && "captchaToken" in body
        ? String((body as { captchaToken?: unknown }).captchaToken ?? "")
        : "";
    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Please complete the anti-spam check." },
        { status: 422 },
      );
    }
    try {
      const verify = await fetch("https://api.hcaptcha.com/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret: hcaptchaSecret, response: token }),
      });
      const result = (await verify.json()) as { success?: boolean };
      if (!result.success) {
        return NextResponse.json(
          { ok: false, error: "Anti-spam check failed — please try again." },
          { status: 422 },
        );
      }
    } catch {
      return NextResponse.json(
        { ok: false, error: "Couldn't verify the anti-spam check." },
        { status: 502 },
      );
    }
  }

  // TODO(Phase 2): persist the enquiry to the database with status "new".

  // SMTP config (Namecheap Private Email). Sending "from" must be the
  // authenticated mailbox — the provider won't relay arbitrary addresses.
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const notify = process.env.CONTACT_NOTIFY_EMAIL ?? user ?? site.email;
  const from =
    process.env.CONTACT_FROM_EMAIL ??
    (user ? `Phonics to Physics <${user}>` : undefined);

  // If email isn't configured yet, don't fail the enquiry — log and succeed
  // so the marketing site works before SMTP credentials are set.
  if (!host || !user || !pass || !from) {
    console.warn(
      "[enquiry] SMTP not configured — enquiry received but no email sent.",
      { parentName: data.parentName, email: data.email },
    );
    return NextResponse.json({ ok: true, emailed: false });
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // 465 = implicit TLS; 587 = STARTTLS
      auth: { user, pass },
    });

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

    // Notify Chris — reply-to set to the enquirer so a reply goes straight back.
    await transporter.sendMail({
      from,
      to: notify,
      replyTo: `${data.parentName} <${data.email}>`,
      subject: `New enquiry — ${data.parentName} (${data.yearGroup})`,
      html: summary,
    });

    // Auto-reply to the enquirer
    await transporter.sendMail({
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
