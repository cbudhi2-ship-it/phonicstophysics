import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBalances } from "@/lib/tokens";
import { tierLabel, type Tier } from "@/lib/tiers";
import { sendAdminMessage, addChildForClient } from "@/lib/admin-actions";
import { yearGroups } from "@/lib/enquiry";
import { ChildLearning } from "@/components/admin/ChildLearning";

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

  const [
    { data: targets },
    { data: homework },
    { data: resources },
    { data: messages },
  ] = await Promise.all([
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
    childIds.length
      ? admin
          .from("resources")
          .select("id, child_id, label, url, username, password")
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
  const allResources = (resources ?? []) as {
    id: string;
    child_id: string;
    label: string;
    url: string | null;
    username: string | null;
    password: string | null;
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

      {/* Add a child (parents can also add their own in Settings) */}
      <section className="card">
        <h2 className="text-[18px]">Add a child</h2>
        <p className="mb-3 mt-1 text-[13px] text-muted">
          Add a child here to set their targets, homework and logins. Parents
          can also add their own in Settings.
        </p>
        <form
          action={addChildForClient}
          className="flex flex-wrap items-end gap-2"
        >
          <input type="hidden" name="parent_id" value={id} />
          <input
            name="name"
            required
            placeholder="Child's name"
            className={`${field} max-w-[220px]`}
          />
          <select name="year_group" required className={`${field} max-w-[240px]`}>
            <option value="">Year group…</option>
            {yearGroups.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button className="rounded-lg bg-coral px-3 py-2 text-[13px] font-bold text-white">
            Add child
          </button>
        </form>
      </section>

      {kids.map((child) => {
        const tCount = allTargets.filter((t) => t.child_id === child.id).length;
        const hCount = allHomework.filter((h) => h.child_id === child.id).length;
        return (
          <details key={child.id} className="group card">
            <summary className="flex cursor-pointer items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
              <span>
                <span className="font-serif text-[20px] text-navy">
                  {child.name}
                </span>
                <span className="ml-2 text-[13px] font-normal text-muted">
                  {child.year_group ?? ""}
                  {child.tier ? ` · ${tierLabel[child.tier]}` : ""} · {tCount}{" "}
                  target{tCount === 1 ? "" : "s"} · {hCount} h/w
                </span>
              </span>
              <span className="shrink-0 text-[18px] text-muted transition-transform group-open:rotate-90">
                ›
              </span>
            </summary>
            <ChildLearning
              childId={child.id}
              targets={allTargets.filter((t) => t.child_id === child.id)}
              homework={allHomework.filter((h) => h.child_id === child.id)}
              resources={allResources.filter((r) => r.child_id === child.id)}
            />
          </details>
        );
      })}

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
