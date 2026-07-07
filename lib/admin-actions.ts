"use server";

import { randomBytes } from "crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMail } from "@/lib/email";

const createSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter a name").max(100),
  email: z.string().trim().email("Please enter a valid email"),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  status: z.enum(["enabled", "pending", "paused"]),
});

export type CreateClientState = {
  ok: boolean;
  error?: string;
  emailed?: boolean;
  setupLink?: string; // shown to admin only when email couldn't be sent
  name?: string;
};

/** Strong random password — used as a placeholder; the client sets their own. */
function randomPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(14);
  let out = "";
  for (let i = 0; i < 14; i++) out += chars[bytes[i] % chars.length];
  return `${out}4!`;
}

/** Build a "set your password" link (Supabase recovery token → our confirm route). */
async function buildSetPasswordLink(email: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
  });
  const ht = data?.properties?.hashed_token;
  if (error || !ht) return null;

  const h = await headers();
  const host = h.get("host") ?? "www.phonicstophysics.com";
  const proto =
    host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https";
  return `${proto}://${host}/auth/confirm?token_hash=${ht}&type=recovery&next=/reset-password`;
}

function welcomeEmail(name: string, link: string) {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.phonicstophysics.com";
  const first = name.split(" ")[0] || name;
  return `
    <p>Hi ${first},</p>
    <p>Welcome to Phonics to Physics! Your parent account is ready — just choose
    a password to get started:</p>
    <p><a href="${link}">Set your password</a></p>
    <p>After that you can log in any time at
    <a href="${url}/login">${url}/login</a> to see lessons, targets, homework
    and messages.</p>
    <p>Warm wishes,<br>Chris<br><em>Small steps, big results.</em></p>
  `;
}

export async function createClientUser(
  _prev: CreateClientState,
  formData: FormData,
): Promise<CreateClientState> {
  await requireAdmin();

  const parsed = createSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    status: formData.get("status") ?? "enabled",
  });
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors)
      .flat()
      .filter(Boolean)[0];
    return { ok: false, error: first ?? "Please check the form." };
  }

  const { fullName, email, phone, status } = parsed.data;
  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: randomPassword(),
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (error || !data.user) {
    const msg = (error?.message ?? "").toLowerCase();
    return {
      ok: false,
      error:
        msg.includes("already") || msg.includes("registered")
          ? "A user with that email already exists."
          : "Sorry — couldn't create that account.",
    };
  }

  await admin
    .from("profiles")
    .update({ full_name: fullName, phone: phone || null, status })
    .eq("id", data.user.id);

  const link = await buildSetPasswordLink(email);
  let emailed = false;
  if (link) {
    emailed = await sendMail({
      to: email,
      subject: "Welcome to Phonics to Physics — set your password",
      html: welcomeEmail(fullName, link),
    });
  }

  revalidatePath("/admin/clients");
  return {
    ok: true,
    emailed,
    name: fullName,
    // Only surface the link to the admin if the email didn't go out.
    setupLink: emailed ? undefined : (link ?? undefined),
  };
}

export async function setClientStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["enabled", "pending", "paused"].includes(status)) return;

  const admin = createAdminClient();
  await admin.from("profiles").update({ status }).eq("id", id);
  revalidatePath("/admin/clients");
}

/** Re-send the "set your password" email to a client. */
export async function sendClientResetLink(
  id: string,
): Promise<{ ok: boolean; emailed: boolean; setupLink?: string }> {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin.auth.admin.getUserById(id);
  const email = data.user?.email;
  if (!email) return { ok: false, emailed: false };

  const link = await buildSetPasswordLink(email);
  if (!link) return { ok: false, emailed: false };

  const emailed = await sendMail({
    to: email,
    subject: "Reset your Phonics to Physics password",
    html: `
      <p>Hi,</p>
      <p>Here's a link to set a new password for your Phonics to Physics
      account:</p>
      <p><a href="${link}">Set a new password</a></p>
      <p>If you didn't expect this, you can ignore it.</p>
      <p>— Phonics to Physics</p>
    `,
  });

  return { ok: true, emailed, setupLink: emailed ? undefined : link };
}

/**
 * Manual override — set a temporary password directly and return it so Chris
 * can pass it on. For when email delivery fails entirely.
 */
export async function resetClientPassword(
  id: string,
): Promise<{ ok: boolean; password?: string }> {
  await requireAdmin();
  const admin = createAdminClient();
  const password = randomPassword();
  const { error } = await admin.auth.admin.updateUserById(id, { password });
  if (error) return { ok: false };
  return { ok: true, password };
}
