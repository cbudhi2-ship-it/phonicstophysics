import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Msg = {
  parent_id: string;
  sender: string;
  body: string;
  read: boolean;
  created_at: string;
};

export default async function AdminMessagesPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const [{ data: messages }, { data: profiles }] = await Promise.all([
    admin
      .from("messages")
      .select("parent_id, sender, body, read, created_at")
      .order("created_at", { ascending: false })
      .limit(500),
    admin.from("profiles").select("id, full_name").neq("role", "admin"),
  ]);

  const nameById = new Map(
    (profiles ?? []).map((p) => [p.id, p.full_name as string | null]),
  );

  // Latest message + unread count per parent.
  const threads = new Map<
    string,
    { last: Msg; unread: number }
  >();
  for (const m of (messages ?? []) as Msg[]) {
    const t = threads.get(m.parent_id);
    if (!t) {
      threads.set(m.parent_id, {
        last: m,
        unread: m.sender === "client" && !m.read ? 1 : 0,
      });
    } else if (m.sender === "client" && !m.read) {
      t.unread += 1;
    }
  }

  const list = [...threads.entries()].sort(
    (a, b) =>
      new Date(b[1].last.created_at).getTime() -
      new Date(a[1].last.created_at).getTime(),
  );

  return (
    <>
      <Link
        href="/admin"
        className="text-[13px] font-semibold text-teal hover:underline"
      >
        ← Admin
      </Link>
      <h1 className="mt-1 text-[28px]">Messages</h1>
      <p className="mb-6 text-[15px] text-muted">
        {list.length} {list.length === 1 ? "thread" : "threads"}
      </p>

      {list.length === 0 ? (
        <div className="card text-center text-muted">
          No messages yet. Parent messages will appear here.
        </div>
      ) : (
        <div className="space-y-3">
          {list.map(([parentId, { last, unread }]) => (
            <Link
              key={parentId}
              href={`/admin/clients/${parentId}`}
              className="card block transition-shadow hover:shadow-[0_14px_34px_rgba(31,45,74,.12)]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-navy">
                  {nameById.get(parentId) ?? "Client"}
                  {unread > 0 && (
                    <span className="ml-2 rounded-pill bg-coral px-2 py-0.5 text-[11px] font-bold text-white">
                      {unread} new
                    </span>
                  )}
                </span>
                <span className="text-[12px] text-muted">
                  {new Date(last.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
              <p className="mt-1 truncate text-[14px] text-muted">
                {last.sender === "admin" ? "You: " : ""}
                {last.body}
              </p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
