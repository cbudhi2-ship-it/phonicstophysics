import { createClient } from "@/lib/supabase/server";
import { tierLabel, type Tier } from "@/lib/tiers";
import { deleteChild } from "@/lib/children-actions";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { AddChildForm } from "./AddChildForm";

export const dynamic = "force-dynamic";

type Child = {
  id: string;
  name: string;
  year_group: string | null;
  tier: Tier | null;
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // RLS returns only this user's own children.
  const { data: children } = await supabase
    .from("children")
    .select("id, name, year_group, tier")
    .order("created_at", { ascending: true });

  const kids = (children ?? []) as Child[];

  return (
    <div className="mx-auto max-w-[640px]">
      <h1 className="text-[28px]">Settings</h1>
      <p className="mb-6 mt-1 text-[15px] text-muted">{user?.email}</p>

      {/* Children */}
      <section className="card mb-6">
        <h2 className="text-[20px]">Children</h2>
        <p className="mt-1 text-[14px] text-muted">
          Add each child you&apos;d like lessons for. Their year group sets the
          right lesson tier.
        </p>

        {kids.length > 0 && (
          <ul className="mt-4 divide-y divide-line">
            {kids.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div>
                  <span className="font-semibold text-navy">{c.name}</span>
                  <span className="ml-2 text-[13px] text-muted">
                    {c.year_group ?? "—"}
                    {c.tier ? ` · ${tierLabel[c.tier]}` : ""}
                  </span>
                </div>
                <form action={deleteChild}>
                  <input type="hidden" name="id" value={c.id} />
                  <button
                    type="submit"
                    className="text-[13px] font-semibold text-muted hover:text-coral-dark"
                  >
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <AddChildForm />
      </section>

      {/* Password */}
      <section className="card">
        <h2 className="text-[20px]">Change password</h2>
        <p className="mt-1 mb-4 text-[14px] text-muted">
          Set a new password for your account.
        </p>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
