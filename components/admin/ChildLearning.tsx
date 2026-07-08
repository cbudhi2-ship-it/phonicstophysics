import {
  addTarget,
  setTargetStatus,
  deleteTarget,
  addHomework,
  deleteHomework,
} from "@/lib/admin-actions";

const field =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-[14px] outline-none focus:border-teal";

export type TargetRow = {
  id: string;
  title: string;
  detail: string | null;
  status: string;
};
export type HomeworkRow = {
  id: string;
  title: string;
  due_date: string | null;
  done: boolean;
};

/** Per-child targets + homework editor. Used on the client detail and the
 *  Targets & Homework pages. Uses server-action forms directly. */
export function ChildLearning({
  childId,
  targets,
  homework,
}: {
  childId: string;
  targets: TargetRow[];
  homework: HomeworkRow[];
}) {
  return (
    <div>
      {/* Targets */}
      <h3 className="mb-2 mt-5 text-[15px] font-bold text-navy-soft">Targets</h3>
      <div className="space-y-2">
        {targets.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2"
          >
            <div className="text-[14px]">
              <span className="font-semibold text-navy">{t.title}</span>
              {t.status === "achieved" && (
                <span className="ml-2 text-[12px] font-bold text-teal">
                  ✓ achieved
                </span>
              )}
              {t.detail && <span className="ml-2 text-muted">— {t.detail}</span>}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <form action={setTargetStatus}>
                <input type="hidden" name="id" value={t.id} />
                <input
                  type="hidden"
                  name="status"
                  value={t.status === "achieved" ? "active" : "achieved"}
                />
                <button className="text-[12px] font-semibold text-teal hover:underline">
                  {t.status === "achieved" ? "Reopen" : "Mark achieved"}
                </button>
              </form>
              <form action={deleteTarget}>
                <input type="hidden" name="id" value={t.id} />
                <button className="text-[12px] font-semibold text-muted hover:text-coral-dark">
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
        {targets.length === 0 && (
          <p className="text-[13px] text-muted">No targets yet.</p>
        )}
      </div>
      <form action={addTarget} className="mt-2 flex flex-wrap items-center gap-2">
        <input type="hidden" name="child_id" value={childId} />
        <input name="title" required placeholder="New target" className={`${field} flex-1`} />
        <input name="detail" placeholder="detail (optional)" className={`${field} flex-1`} />
        <button className="rounded-lg bg-coral px-3 py-2 text-[13px] font-bold text-white">
          Add
        </button>
      </form>

      {/* Homework */}
      <h3 className="mb-2 mt-6 text-[15px] font-bold text-navy-soft">Homework</h3>
      <div className="space-y-2">
        {homework.map((h) => (
          <div
            key={h.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2"
          >
            <div className="text-[14px]">
              <span className="font-semibold text-navy">{h.title}</span>
              {h.done ? (
                <span className="ml-2 text-[12px] font-bold text-teal">✓ done</span>
              ) : (
                <span className="ml-2 text-[12px] text-muted">not done</span>
              )}
              {h.due_date && (
                <span className="ml-2 text-[12px] text-coral-dark">
                  due{" "}
                  {new Date(h.due_date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              )}
            </div>
            <form action={deleteHomework} className="shrink-0">
              <input type="hidden" name="id" value={h.id} />
              <button className="text-[12px] font-semibold text-muted hover:text-coral-dark">
                Delete
              </button>
            </form>
          </div>
        ))}
        {homework.length === 0 && (
          <p className="text-[13px] text-muted">No homework yet.</p>
        )}
      </div>
      <form action={addHomework} className="mt-2 grid gap-2 sm:grid-cols-2">
        <input type="hidden" name="child_id" value={childId} />
        <input name="title" required placeholder="Homework title" className={field} />
        <input name="due_date" type="date" className={field} />
        <input name="detail" placeholder="instructions (optional)" className={field} />
        <input name="attachment_url" placeholder="attachment link (optional)" className={field} />
        <div className="sm:col-span-2">
          <button className="rounded-lg bg-coral px-3 py-2 text-[13px] font-bold text-white">
            Assign homework
          </button>
        </div>
      </form>
    </div>
  );
}
