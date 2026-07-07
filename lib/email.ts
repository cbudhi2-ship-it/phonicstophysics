import nodemailer from "nodemailer";
import { site } from "@/lib/site";

/**
 * Shared transactional email sender over Namecheap Private Email SMTP.
 * Returns false (without throwing) when SMTP isn't configured, so callers
 * can degrade gracefully (e.g. show a temp password in the UI instead).
 */
function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export function emailFrom() {
  return (
    process.env.CONTACT_FROM_EMAIL ??
    `Phonics to Physics <${process.env.SMTP_USER ?? site.email}>`
  );
}

export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const transport = getTransport();
  if (!transport) {
    console.warn("[email] SMTP not configured — skipped sending:", subject);
    return false;
  }
  await transport.sendMail({ from: emailFrom(), to, subject, html });
  return true;
}
