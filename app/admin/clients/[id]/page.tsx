import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBalances } from "@/lib/tokens";
import { tierLabel, type Tier } from "@/lib/tiers";
import { sendAdminMessage } from "@/lib/admin-actions";
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

          <ChildLearning
            childId={child.id}
            targets={allTargets.filter((t) => t.child_id === child.id)}
            homework={allHomework.filter((h) => h.child_id === child.id)}
          />
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
