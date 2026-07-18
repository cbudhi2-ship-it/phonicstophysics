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

/**
 * Manually adjust a client's lesson balance (goodwill credit, referral,
 * fixing an edge case). Writes an append-only `adjustment` ledger row.
 */
export async function adjustTokens(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const tier = String(formData.get("tier") ?? "");
  const amount = Math.trunc(Number(formData.get("amount") ?? 0));
  const note = String(formData.get("note") ?? "").trim().slice(0, 200);

  if (!id || !["primary", "secondary", "a_level"].includes(tier)) {
    return { ok: false, error: "Pick a tier." };
  }
  if (!Number.isFinite(amount) || amount === 0) {
    return { ok: false, error: "Enter a non-zero amount (e.g. 1 or -1)." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("token_transactions").insert({
    parent_id: id,
    tier,
    type: "adjustment",
    amount,
    note: note || "Manual adjustment by admin",
  });
  if (error) return { ok: false, error: "Sorry — couldn't apply that." };

  revalidatePath("/admin/clients");
  return { ok: true };
}

/** Toggle whether a client may book without buying tokens (pays in person). */
export async function setPayInPerson(
  id: string,
  value: boolean,
): Promise<{ ok: boolean }> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ pay_in_person: value })
    .eq("id", id);
  if (error) return { ok: false };
  revalidatePath("/admin/clients");
  return { ok: true };
}

// --- Phase 4: targets, homework, messaging (admin side) ---

export async function addTarget(formData: FormData) {
  await requireAdmin();
  const childId = String(formData.get("child_id") ?? "");
  const title = String(formData.get("title") ?? "").trim().slice(0, 200);
  const detail = String(formData.get("detail") ?? "").trim().slice(0, 1000);
  if (!childId || !title) return;
  const admin = createAdminClient();
  await admin
    .from("targets")
    .insert({ child_id: childId, title, detail: detail || null });
  revalidatePath(`/admin/clients`);
}

export async function setTargetStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["active", "achieved"].includes(status)) return;
  const admin = createAdminClient();
  await admin.from("targets").update({ status }).eq("id", id);
  revalidatePath(`/admin/clients`);
}

export async function deleteTarget(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const admin = createAdminClient();
  await admin.from("targets").delete().eq("id", id);
  revalidatePath(`/admin/clients`);
}

export async function addHomework(formData: FormData) {
  await requireAdmin();
  const childId = String(formData.get("child_id") ?? "");
  const title = String(formData.get("title") ?? "").trim().slice(0, 200);
  const detail = String(formData.get("detail") ?? "").trim().slice(0, 2000);
  const dueDate = String(formData.get("due_date") ?? "").trim();
  const attachment = String(formData.get("attachment_url") ?? "").trim();
  if (!childId || !title) return;
  const admin = createAdminClient();
  await admin.from("homework").insert({
    child_id: childId,
    title,
    detail: detail || null,
    due_date: dueDate || null,
    attachment_url: attachment || null,
  });
  revalidatePath(`/admin/clients`);
}

export async function deleteHomework(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const admin = createAdminClient();
  await admin.from("homework").delete().eq("id", id);
  revalidatePath(`/admin/clients`);
}

/** Admin adds a child directly to a client (parents can also add their own). */
export async function addChildForClient(formData: FormData) {
  await requireAdmin();
  const parentId = String(formData.get("parent_id") ?? "");
  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  const yearGroup = String(formData.get("year_group") ?? "").trim();
  if (!parentId || !name) return;

  const { tierForYearGroup } = await import("@/lib/tiers");
  const admin = createAdminClient();
  await admin.from("children").insert({
    parent_id: parentId,
    name,
    year_group: yearGroup || null,
    tier: yearGroup ? tierForYearGroup(yearGroup) : null,
  });
  revalidatePath(`/admin/clients/${parentId}`);
  revalidatePath("/admin/learning");
}

export async function addResource(formData: FormData) {
  await requireAdmin();
  const childId = String(formData.get("child_id") ?? "");
  const label = String(formData.get("label") ?? "").trim().slice(0, 100);
  const url = String(formData.get("url") ?? "").trim().slice(0, 500);
  const username = String(formData.get("username") ?? "").trim().slice(0, 200);
  const password = String(formData.get("password") ?? "").trim().slice(0, 200);
  const note = String(formData.get("note") ?? "").trim().slice(0, 300);
  if (!childId || !label) return;
  const admin = createAdminClient();
  await admin.from("resources").insert({
    child_id: childId,
    label,
    url: url || null,
    username: username || null,
    password: password || null,
    note: note || null,
  });
  revalidatePath("/admin/clients");
  revalidatePath("/admin/learning");
}

export async function deleteResource(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const admin = createAdminClient();
  await admin.from("resources").delete().eq("id", id);
  revalidatePath("/admin/clients");
  revalidatePath("/admin/learning");
}

/** Chris replies to a parent; notifies them by email. */
export async function sendAdminMessage(formData: FormData) {
  await requireAdmin();
  const parentId = String(formData.get("parent_id") ?? "");
  const body = String(formData.get("body") ?? "").trim().slice(0, 4000);
  if (!parentId || !body) return;

  const admin = createAdminClient();
  await admin
    .from("messages")
    .insert({ parent_id: parentId, sender: "admin", body });

  const { sendMail } = await import("@/lib/email");
  const { data } = await admin.auth.admin.getUserById(parentId);
  const email = data.user?.email;
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.phonicstophysics.com";
  if (email) {
    await sendMail({
      to: email,
      subject: "A message from Chris — Phonics to Physics",
      html: `<p>Hi,</p><p>You have a new message in your parent portal:</p>
        <blockquote>${body.replace(/</g, "&lt;")}</blockquote>
        <p><a href="${url}/dashboard/messages">Read &amp; reply</a></p>
        <p>— Phonics to Physics</p>`,
    }).catch(() => {});
  }
  revalidatePath(`/admin/clients`);
  revalidatePath(`/admin/messages`);
  revalidatePath(`/admin/clients/${parentId}`);
}

export async function deleteBootcampEnrolment(
  id: string,
): Promise<{ ok: boolean }> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("bootcamp_enrolments")
    .delete()
    .eq("id", id);
  if (error) return { ok: false };
  revalidatePath("/admin/bootcamp");
  return { ok: true };
}

export async function setEnquiryStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["new", "contacted", "converted", "declined"].includes(status)) {
    return;
  }
  const admin = createAdminClient();
  await admin.from("enquiries").update({ status }).eq("id", id);
  revalidatePath("/admin/enquiries");
}

/**
 * Permanently delete a client and everything owned by them (children,
 * lesson ledger, bookings all cascade). Refuses to delete an admin.
 */
export async function deleteClient(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: prof } = await admin
    .from("profiles")
    .select("role")
    .eq("id", id)
    .single();
  if (prof?.role === "admin") {
    return { ok: false, error: "You can't remove an admin account." };
  }

  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return { ok: false, error: "Sorry — couldn't remove that client." };

  revalidatePath("/admin/clients");
  return { ok: true };
}
