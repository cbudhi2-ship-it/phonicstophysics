"use server";

import { randomBytes } from "crypto";
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
  tempPassword?: string;
  emailed?: boolean;
  name?: string;
};

/** Generate a readable but strong temporary password (mixed classes). */
function tempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(10);
  let out = "";
  for (let i = 0; i < 10; i++) out += chars[bytes[i] % chars.length];
  // Guarantee a digit and a symbol so it satisfies common password policies.
  return `${out}4!`;
}

function welcomeEmail(name: string, email: string, password: string) {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.phonicstophysics.com";
  const first = name.split(" ")[0] || name;
  return `
    <p>Hi ${first},</p>
    <p>Your Phonics to Physics parent account is ready. You can log in to see
    lessons, targets, homework and messages.</p>
    <p><strong>Log in:</strong> <a href="${url}/login">${url}/login</a><br>
    <strong>Email:</strong> ${email}<br>
    <strong>Temporary password:</strong> ${password}</p>
    <p>Please change your password after your first login (there's a "Change
    password" option in your account).</p>
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
  const password = tempPassword();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
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

  // The signup trigger creates the profile row; fill in the rest.
  await admin
    .from("profiles")
    .update({ full_name: fullName, phone: phone || null, status })
    .eq("id", data.user.id);

  const emailed = await sendMail({
    to: email,
    subject: "Your Phonics to Physics account",
    html: welcomeEmail(fullName, email, password),
  });

  revalidatePath("/admin/clients");
  return { ok: true, tempPassword: password, emailed, name: fullName };
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
