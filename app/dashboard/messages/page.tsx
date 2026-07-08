import { createClient } from "@/lib/supabase/server";
import { MessageComposer } from "./MessageComposer";

export const dynamic = "force-dynamic";

type Message = {
  id: string;
  sender: string;
  body: string;
  created_at: string;
};

export default async function MessagesTab() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("messages")
    .select("id, sender, body, created_at")
    .order("created_at", { ascending: true });

  const messages = (data ?? []) as Message[];

  return (
    <div>
      <p className="mb-4 text-[14px] text-muted">
        Private messages between you and Chris. He&apos;s emailed when you send,
        and you&apos;re emailed when he replies.
      </p>

      {messages.length === 0 ? (
        <div className="rounded-xl border border-line bg-cream px-4 py-6 text-center text-[14px] text-muted">
          No messages yet — say hello below.
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => {
            const mine = m.sender === "client";
            return (
              <div
                key={m.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[14px] ${
                    mine
                      ? "bg-teal text-white"
                      : "border border-line bg-white text-navy"
                  }`}
                >
                  <div className="mb-0.5 text-[11px] font-bold uppercase tracking-wide opacity-70">
                    {mine ? "You" : "Chris"}
                  </div>
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <div className="mt-1 text-[11px] opacity-60">
                    {new Date(m.created_at).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <MessageComposer />
    </div>
  );
}
