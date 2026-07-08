import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/portal/EmptyState";

export const dynamic = "force-dynamic";

type Child = { id: string; name: string };
type Target = {
  id: string;
  child_id: string;
  title: string;
  detail: string | null;
  status: string;
};

export default async function TargetsTab() {
  const supabase = await createClient();
  const [{ data: children }, { data: targets }] = await Promise.all([
    supabase.from("children").select("id, name").order("created_at"),
    supabase
      .from("targets")
      .select("id, child_id, title, detail, status")
      .order("created_at"),
  ]);

  const kids = (children ?? []) as Child[];
  const all = (targets ?? []) as Target[];

  if (all.length === 0) {
    return (
      <EmptyState icon="🎯" title="No targets yet">
        Chris will set learning goals for your child here — you&apos;ll see
        what they&apos;re working on and celebrate each one as it&apos;s
        achieved.
      </EmptyState>
    );
  }

  return (
    <div className="space-y-8">
      {kids.map((child) => {
        const forChild = all.filter((t) => t.child_id === child.id);
        if (forChild.length === 0) return null;
        return (
          <section key={child.id}>
            <h2 className="mb-3 text-[20px]">{child.name}</h2>
            <div className="space-y-3">
              {forChild.map((t) => {
                const achieved = t.status === "achieved";
                return (
                  <div
                    key={t.id}
                    className={`rounded-xl border px-4 py-3 ${
                      achieved
                        ? "border-teal/40 bg-[#EAF7F4]"
                        : "border-line bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{achieved ? "🌟" : "🎯"}</span>
                      <div>
                        <div className="font-semibold text-navy">
                          {t.title}
                          {achieved && (
                            <span className="ml-2 rounded-pill bg-teal px-2 py-0.5 text-[11px] font-bold text-white">
                              Achieved!
                            </span>
                          )}
                        </div>
                        {t.detail && (
                          <p className="mt-1 text-[14px] text-muted">
                            {t.detail}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
