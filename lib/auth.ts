import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "admin" | "client";
export type AccountStatus = "pending" | "enabled" | "paused";

export type Profile = {
  id: string;
  role: Role;
  status: AccountStatus;
  full_name: string | null;
};

export type SessionUser = {
  id: string;
  email: string | null;
};

/** Read the logged-in user and their profile (null if signed out). */
export async function getSession(): Promise<{
  user: SessionUser | null;
  profile: Profile | null;
}> {
  // If Supabase isn't configured (e.g. before env vars land in an env),
  // treat everyone as signed out rather than throwing a 500.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return { user: null, profile: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, status, full_name")
    .eq("id", user.id)
    .single();

  return {
    user: { id: user.id, email: user.email ?? null },
    profile: (profile as Profile | null) ?? null,
  };
}

/** Guard for the client dashboard — any signed-in user (client or admin). */
export async function requireClient() {
  const session = await getSession();
  if (!session.user) redirect("/login?redirect=/dashboard");
  return session;
}

/** Guard for the admin area — admins only. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session.user) redirect("/login?redirect=/admin");
  if (session.profile?.role !== "admin") redirect("/dashboard");
  return session;
}
