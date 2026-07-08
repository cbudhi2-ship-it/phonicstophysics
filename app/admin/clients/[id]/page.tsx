import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBalances } from "@/lib/tokens";
import { tierLabel, type Tier } from "@/lib/tiers";
import {
  addTarget,
  setTargetStatus,
  deleteTarget,
  addHomework,
  deleteHomework,
  sendAdminMessage,
} from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

const field =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-[14px] outline-none focus:border-teal";

export default async function AdminClientDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const admin = createAdminClient();

  const [{ data: profile }, { data: userRes }, { data: children }, balances] =
    await Promise.all([
      admin
        .from("profiles")
        .select("full_name, phone, status, pay_in_person")
        .eq("id", id)
        .single(),
      admin.auth.admin.getUserById(id),
      admin
        .from("children")
        .select("id, name, year_group, tier")
        .eq("parent_id", id)
        .order("created_at"),
      getBalances(admin, id),
    ]);

  const kids = (children ?? []) as {
    id: string;
    name: string;
    year_group: string | null;
    tier: Tier | null;
  }[];
  const childIds = kids.map((k) => k.id);

  const [{ data: targets }, { data: homework }, { data: messages }] =
    await Promise.all([
      childIds.length
        ? admin
            .from("targets")
            .select("id, child_id, title, detail, status")
            .in("child_id", childIds)
            .order("created_at")
        : Promise.resolve({ data: [] }),
      childIds.length
        ? admin
            .from("homework")
            .select("id, child_id, title, detail, due_date, done")
            .in("child_id", childIds)
            .order("created_at")
        : Promise.resolve({ data: [] }),
      admin
        .from("messages")
        .select("id, sender, body, created_at")
        .eq("parent_id", id)
        .order("created_at"),
    ]);

  const allTargets = (targets ?? []) as {
    id: string;
    child_id: string;
    title: string;
    detail: string | null;
    status: string;
  }[];
  const allHomework = (homework ?? []) as {
    id: string;
    child_id: string;
    title: string;
    detail: string | null;
    due_date: string | null;
    done: boolean;
  }[];
  const thread = (messages ?? []) as {
    id: string;
    sender: string;
    body: string;
    created_at: string;
  }[];

  // Opening the thread marks the parent's messages as read.
  if (thread.some((m) => m.sender === "client")) {
    await admin
      .from("messages")
      .update({ read: true })
      .eq("parent_id", id)
      .eq("sender", "client")
      .eq("read", false);
  }

  const name = profile?.full_name ?? "Client";
  const email = userRes?.user?.email ?? "";

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/clients"
          className="text-[13px] font-semibold text-teal hover:underline"
        >
          ← Clients
        </Link>
        <h1 className="mt-1 text-[28px]">{name}</h1>
        <p className="text-[14px] text-muted">
          {email} · {profile?.status}
          {profile?.pay_in_person ? " · pays in person" : ""}
        </p>
        <p className="mt-1 text-[13px] text-muted">
          Balance:{" "}
          {(["primary", "secondary", "a_level"] as Tier[])
            .filter((t) => balances[t] !== 0)
            .map((t) => `${tierLabel[t]} ${balances[t]}`)
            .join(" · ") || "0"}
        </p>
      </div>

      {kids.length === 0 && (
        <p className="rounded-xl border border-line bg-cream px-4 py-3 text-[14px] text-muted">
          This client hasn&apos;t added any children yet.
        </p>
      )}

      {kids.map((child) => (
        <section key={child.id} className="card">
          <h2 className="text-[20px]">
            {child.name}
            <span className="ml-2 text-[13px] font-normal text-muted">
              {child.year_group ?? ""}
              {child.tier ? ` · ${tierLabel[child.tier]}` : ""}
            </span>
          </h2>

          {/* Targets */}
          <h3 className="mb-2 mt-5 text-[15px] font-bold text-navy-soft">
            Targets
          </h3>
          <div className="space-y-2">
            {allTargets
              .filter((t) => t.child_id === child.id)
              .map((t) => (
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
                    {t.detail && (
                      <span className="ml-2 text-muted">— {t.detail}</span>
                    )}
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
          </div>
          <form
            action={addTarget}
            className="mt-2 flex flex-wrap items-center gap-2"
          >
            <input type="hidden" name="child_id" value={child.id} />
            <input name="title" required placeholder="New target" className={`${field} flex-1`} />
            <input name="detail" placeholder="detail (optional)" className={`${field} flex-1`} />
            <button className="rounded-lg bg-coral px-3 py-2 text-[13px] font-bold text-white">
              Add
            </button>
          </form>

          {/* Homework */}
          <h3 className="mb-2 mt-6 text-[15px] font-bold text-navy-soft">
            Homework
          </h3>
          <div className="space-y-2">
            {allHomework
              .filter((h) => h.child_id === child.id)
              .map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2"
                >
                  <div className="text-[14px]">
                    <span className="font-semibold text-navy">{h.title}</span>
                    {h.done ? (
                      <span className="ml-2 text-[12px] font-bold text-teal">
                        ✓ done
                      </span>
                    ) : (
                      <span className="ml-2 text-[12px] text-muted">
                        not done
                      </span>
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
          </div>
          <form action={addHomework} className="mt-2 grid gap-2 sm:grid-cols-2">
            <input type="hidden" name="child_id" value={child.id} />
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
        </section>
      ))}

      {/* Messages */}
      <section className="card">
        <h2 className="mb-3 text-[20px]">Messages</h2>
        {thread.length === 0 ? (
          <p className="text-[14px] text-muted">No messages yet.</p>
        ) : (
          <div className="mb-4 space-y-2">
            {thread.map((m) => {
              const fromChris = m.sender === "admin";
              return (
                <div
                  key={m.id}
                  className={`flex ${fromChris ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-[14px] ${
                      fromChris
                        ? "bg-navy text-white"
                        : "border border-line bg-white text-navy"
                    }`}
                  >
                    <div className="mb-0.5 text-[11px] font-bold uppercase tracking-wide opacity-70">
                      {fromChris ? "You" : name}
                    </div>
                    <p className="whitespace-pre-wrap">{m.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <form action={sendAdminMessage}>
          <input type="hidden" name="parent_id" value={id} />
          <textarea
            name="body"
            required
            rows={3}
            placeholder="Reply to this parent…"
            className={field}
          />
          <button className="btn btn-primary mt-2">Send reply</button>
        </form>
      </section>
    </div>
  );
}
