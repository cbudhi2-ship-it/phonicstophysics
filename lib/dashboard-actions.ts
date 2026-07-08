"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMail } from "@/lib/email";
import { site } from "@/lib/site";

/** Parent toggles a homework item done/not-done (RLS scopes to own children). */
export async function toggleHomeworkDone(id: string, done: boolean) {
  const supabase = await createClient();
  await supabase.from("homework").update({ done }).eq("id", id);
  revalidatePath("/dashboard/homework");
}

export type SendMessageState = { ok: boolean; error?: string };

/** Parent sends a message to Chris; notifies him by email. */
export async function sendMessage(
  _prev: SendMessageState,
  formData: FormData,
): Promise<SendMessageState> {
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { ok: false, error: "Type a message first." };
  if (body.length > 4000) return { ok: false, error: "That message is too long." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You're not signed in." };

  const { error } = await supabase.from("messages").insert({
    parent_id: user.id,
    sender: "client",
    body,
  });
  if (error) return { ok: false, error: "Sorry — couldn't send that." };

  // Notify Chris (best-effort).
  const notify = process.env.CONTACT_NOTIFY_EMAIL ?? site.email;
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.phonicstophysics.com";
  await sendMail({
    to: notify,
    subject: "New message from a parent — Phonics to Physics",
    html: `<p>You have a new message in the portal:</p>
      <blockquote>${body.replace(/</g, "&lt;")}</blockquote>
      <p><a href="${url}/admin/clients">Open admin</a></p>`,
  }).catch(() => {});

  revalidatePath("/dashboard/messages");
  return { ok: true };
}
