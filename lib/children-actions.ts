"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { tierForYearGroup } from "@/lib/tiers";
import { yearGroups } from "@/lib/enquiry";

export type ChildFormState = { ok: boolean; error?: string };

const childSchema = z.object({
  name: z.string().trim().min(1, "Please enter a name").max(80),
  yearGroup: z.enum(yearGroups, { message: "Please choose a year group" }),
});

export async function addChild(
  _prev: ChildFormState,
  formData: FormData,
): Promise<ChildFormState> {
  const parsed = childSchema.safeParse({
    name: formData.get("name"),
    yearGroup: formData.get("yearGroup"),
  });
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors)
      .flat()
      .filter(Boolean)[0];
    return { ok: false, error: first ?? "Please check the form." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You're not signed in." };

  const { name, yearGroup } = parsed.data;
  const { error } = await supabase.from("children").insert({
    parent_id: user.id,
    name,
    year_group: yearGroup,
    tier: tierForYearGroup(yearGroup),
  });

  if (error) {
    return { ok: false, error: "Sorry — couldn't add that child." };
  }

  revalidatePath("/account");
  return { ok: true };
}

export async function deleteChild(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  // RLS ensures a parent can only delete their own child.
  await supabase.from("children").delete().eq("id", id);
  revalidatePath("/account");
}
