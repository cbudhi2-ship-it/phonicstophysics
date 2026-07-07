"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMail } from "@/lib/email";

export type LoginState = { error: string | null };

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: "Sorry — that email or password isn't right." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  // redirect() throws NEXT_REDIRECT — must be outside any try/catch.
  redirect(profile?.role === "admin" ? "/admin" : "/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export type ResetRequestState = { sent: boolean; error?: string };

/**
 * Send a password-reset link over our own SMTP. We generate a Supabase
 * recovery token, build a link to our /auth/confirm route, and email it —
 * so delivery uses Namecheap SMTP, not Supabase's rate-limited email.
 * Always returns a generic "sent" so we never reveal whether an account exists.
 */
export async function requestPasswordReset(
  _prev: ResetRequestState,
  formData: FormData,
): Promise<ResetRequestState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email || !email.includes("@")) {
    return { sent: false, error: "Please enter a valid email." };
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
    });

    const hashedToken = data?.properties?.hashed_token;
    if (!error && hashedToken) {
      const h = await headers();
      const host = h.get("host") ?? "www.phonicstophysics.com";
      const proto =
        host.startsWith("localhost") || host.startsWith("127.")
          ? "http"
          : "https";
      const link = `${proto}://${host}/auth/confirm?token_hash=${hashedToken}&type=recovery&next=/reset-password`;

      const emailed = await sendMail({
        to: email,
        subject: "Reset your Phonics to Physics password",
        html: `
          <p>Hi,</p>
          <p>We received a request to reset your Phonics to Physics password.
          Click the link below to choose a new one — it expires shortly.</p>
          <p><a href="${link}">Reset my password</a></p>
          <p>If you didn't ask for this, you can safely ignore this email.</p>
          <p>— Phonics to Physics</p>
        `,
      });

      // Dev fallback so the flow is testable without SMTP configured locally.
      if (!emailed && process.env.NODE_ENV !== "production") {
        console.log("[reset] dev reset link:", link);
      }
    }
  } catch {
    // Swallow — never reveal account existence or internal errors.
  }

  return { sent: true };
}

export type ChangePasswordState = { error: string | null; ok?: boolean };

export async function changePassword(
  _prev: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) {
    return { error: "Use at least 8 characters." };
  }
  if (password !== confirm) {
    return { error: "Those passwords don't match." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You're not signed in." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: "Sorry — couldn't update your password." };
  }
  return { error: null, ok: true };
}
