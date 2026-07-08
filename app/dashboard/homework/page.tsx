import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/portal/EmptyState";
import { HomeworkItem } from "./HomeworkItem";

export const dynamic = "force-dynamic";

type Child = { id: string; name: string };
type Homework = {
  id: string;
  child_id: string;
  title: string;
  detail: string | null;
  due_date: string | null;
  attachment_url: string | null;
  done: boolean;
};

export default async function HomeworkTab() {
  const supabase = await createClient();
  const [{ data: children }, { data: homework }] = await Promise.all([
    supabase.from("children").select("id, name").order("created_at"),
    supabase
      .from("homework")
      .select("id, child_id, title, detail, due_date, attachment_url, done")
      .order("due_date", { ascending: true, nullsFirst: false }),
  ]);

  const kids = (children ?? []) as Child[];
  const all = (homework ?? []) as Homework[];

  if (all.length === 0) {
    return (
      <EmptyState icon="📝" title="No homework set">
        Tasks Chris assigns between lessons will show up here, with due dates
        and a tick-off when they&apos;re done.
      </EmptyState>
    );
  }

  return (
    <div className="space-y-8">
      {kids.map((child) => {
        const forChild = all.filter((h) => h.child_id === child.id);
        if (forChild.length === 0) return null;
        return (
          <section key={child.id}>
            <h2 className="mb-3 text-[20px]">{child.name}</h2>
            <div className="space-y-3">
              {forChild.map((h) => (
                <HomeworkItem
                  key={h.id}
                  id={h.id}
                  title={h.title}
                  detail={h.detail}
                  dueDate={h.due_date}
                  attachmentUrl={h.attachment_url}
                  done={h.done}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
