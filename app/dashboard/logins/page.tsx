import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/portal/EmptyState";
import { ResourceCard } from "./ResourceCard";

export const dynamic = "force-dynamic";

type Child = { id: string; name: string };
type Resource = {
  id: string;
  child_id: string;
  label: string;
  url: string | null;
  username: string | null;
  password: string | null;
  note: string | null;
};

export default async function LoginsTab() {
  const supabase = await createClient();
  const [{ data: children }, { data: resources }] = await Promise.all([
    supabase.from("children").select("id, name").order("created_at"),
    supabase
      .from("resources")
      .select("id, child_id, label, url, username, password, note")
      .order("created_at"),
  ]);

  const kids = (children ?? []) as Child[];
  const all = (resources ?? []) as Resource[];

  if (all.length === 0) {
    return (
      <EmptyState icon="🔑" title="No logins yet">
        Any learning-platform accounts Chris sets up for your child (like
        Mathletics) will appear here, ready to use at home.
      </EmptyState>
    );
  }

  return (
    <div className="space-y-8">
      {kids.map((child) => {
        const forChild = all.filter((r) => r.child_id === child.id);
        if (forChild.length === 0) return null;
        return (
          <section key={child.id}>
            <h2 className="mb-3 text-[20px]">{child.name}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {forChild.map((r) => (
                <ResourceCard
                  key={r.id}
                  label={r.label}
                  url={r.url}
                  username={r.username}
                  password={r.password}
                  note={r.note}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
