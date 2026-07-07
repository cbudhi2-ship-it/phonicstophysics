import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { tierLabel, type Tier } from "@/lib/tiers";
import {
  getBalances,
  tokenProducts,
  emptyBalances,
  type Balances,
} from "@/lib/tokens";
import { stripeConfigured } from "@/lib/stripe";
import { startCheckout, openCustomerPortal } from "@/lib/checkout-actions";
import { BookLessonButton } from "./BookLessonButton";

export const dynamic = "force-dynamic";

type Child = { id: string; name: string; tier: Tier | null };

export default async function TokensTab({
  searchParams,
}: {
  searchParams: Promise<{ bought?: string; canceled?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const { user, profile } = await getSession();
  const supabase = await createClient();

  const enabled = profile?.status === "enabled";
  const canBuy = enabled && stripeConfigured();

  const [{ data: children }, { data: txns }, balances] = await Promise.all([
    supabase.from("children").select("id, name, tier"),
    supabase
      .from("token_transactions")
      .select("id, tier, type, amount, created_at, pack_label")
      .order("created_at", { ascending: false })
      .limit(50),
    getBalances(supabase, user?.id).catch(() => emptyBalances()),
  ]);

  const kids = (children ?? []) as Child[];
  // Tiers relevant to this parent (from their children), else show all.
  const tiers: Tier[] = Array.from(
    new Set(kids.map((k) => k.tier).filter(Boolean) as Tier[]),
  );
  const shownTiers: Tier[] = tiers.length
    ? tiers
    : (["primary", "secondary", "a_level"] as Tier[]);

  const bal: Balances = balances ?? emptyBalances();

  return (
    <div className="space-y-8">
      {sp.bought && (
        <div className="rounded-xl border border-teal/40 bg-[#EAF7F4] px-4 py-3 text-[14px] font-semibold text-teal">
          ✓ Payment received — your lessons have been added.
        </div>
      )}
      {sp.error && (
        <div className="rounded-xl border border-coral/40 bg-coral/10 px-4 py-3 text-[14px] font-semibold text-coral-dark">
          {sp.error === "not_enabled"
            ? "Your account isn't active for booking yet."
            : "Sorry — that isn't available right now."}
        </div>
      )}

      {/* Balances */}
      <section>
        <h2 className="mb-3 text-[20px]">Your lesson balance</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {shownTiers.map((t) => (
            <div key={t} className="card text-center">
              <div className="font-serif text-[36px] text-navy">{bal[t]}</div>
              <div className="text-[13px] text-muted">
                {tierLabel[t]} {bal[t] === 1 ? "lesson" : "lessons"}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Buy */}
      <section>
        <h2 className="mb-1 text-[20px]">Buy lessons</h2>
        <p className="mb-4 text-[14px] text-muted">
          One lesson is a 55-minute session. Save 10% with a pack of ten.
        </p>
        {!enabled && (
          <p className="mb-4 rounded-xl border border-gold/50 bg-gold/10 px-4 py-3 text-[14px] text-navy-soft">
            Buying unlocks once Chris activates your account after your intro
            call.
          </p>
        )}
        {enabled && !stripeConfigured() && (
          <p className="mb-4 rounded-xl border border-line bg-cream px-4 py-3 text-[14px] text-navy-soft">
            Online payment is being set up — for now, arrange lessons directly
            with Chris.
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-3">
          {shownTiers.map((t) => (
            <div key={t} className="card">
              <h3 className="mb-3 text-[17px]">{tierLabel[t]}</h3>
              <div className="space-y-2">
                {tokenProducts
                  .filter((p) => p.tier === t)
                  .map((p) => (
                    <form key={p.priceEnv} action={startCheckout}>
                      <input type="hidden" name="tier" value={p.tier} />
                      <input type="hidden" name="tokens" value={p.tokens} />
                      <button
                        type="submit"
                        disabled={!canBuy}
                        className="flex w-full items-center justify-between rounded-xl border border-line bg-white px-3.5 py-2.5 text-[14px] font-semibold transition-colors hover:border-coral disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span>
                          {p.tokens === 1 ? "1 lesson" : "10-lesson pack"}
                        </span>
                        <span className="text-teal">£{p.gbp}</span>
                      </button>
                    </form>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Book */}
      <section>
        <h2 className="mb-1 text-[20px]">Book a lesson</h2>
        <p className="mb-4 text-[14px] text-muted">
          Pick a slot from Chris&apos;s availability. One lesson is used per
          booking; cancel free up to 24 hours before.
        </p>
        {kids.length === 0 ? (
          <p className="rounded-xl border border-line bg-cream px-4 py-3 text-[14px] text-navy-soft">
            Add a child in{" "}
            <a href="/account" className="font-semibold text-teal">
              Settings
            </a>{" "}
            to book lessons.
          </p>
        ) : (
          <div className="space-y-2">
            {kids.map((k) => (
              <div
                key={k.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3"
              >
                <div>
                  <span className="font-semibold text-navy">{k.name}</span>
                  {k.tier && (
                    <span className="ml-2 text-[13px] text-muted">
                      {tierLabel[k.tier]} · {bal[k.tier]} left
                    </span>
                  )}
                </div>
                <BookLessonButton
                  tier={k.tier}
                  childId={k.id}
                  parentId={user?.id ?? ""}
                  balance={k.tier ? bal[k.tier] : 0}
                  name={profile?.full_name ?? ""}
                  email={user?.email ?? ""}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* History */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[20px]">History</h2>
          {stripeConfigured() && (
            <form action={openCustomerPortal}>
              <button
                type="submit"
                className="text-[13px] font-semibold text-teal hover:underline"
              >
                Payments &amp; receipts →
              </button>
            </form>
          )}
        </div>
        {(txns ?? []).length === 0 ? (
          <p className="text-[14px] text-muted">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-[16px] border border-line bg-white">
            <table className="w-full min-w-[420px] text-left text-[14px]">
              <tbody>
                {(txns ?? []).map(
                  (tx: {
                    id: string;
                    tier: Tier;
                    type: string;
                    amount: number;
                    created_at: string;
                    pack_label: string | null;
                  }) => (
                    <tr key={tx.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-2.5 capitalize">{tx.type}</td>
                      <td className="px-4 py-2.5 text-muted">
                        {tx.pack_label ?? tierLabel[tx.tier]}
                      </td>
                      <td
                        className={`px-4 py-2.5 text-right font-semibold ${
                          tx.amount >= 0 ? "text-teal" : "text-navy-soft"
                        }`}
                      >
                        {tx.amount >= 0 ? "+" : ""}
                        {tx.amount}
                      </td>
                      <td className="px-4 py-2.5 text-right text-muted">
                        {new Date(tx.created_at).toLocaleDateString("en-GB")}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
