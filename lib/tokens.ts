import type { SupabaseClient } from "@supabase/supabase-js";
import type { Tier } from "@/lib/tiers";

export type TokenProduct = {
  tier: Tier;
  tokens: number; // how many lessons this credits (1 or 10)
  label: string;
  gbp: number;
  priceEnv: string; // env var holding the Stripe price id
};

/** The six purchasable products — must line up with the Stripe prices. */
export const tokenProducts: TokenProduct[] = [
  { tier: "primary", tokens: 1, label: "Primary — 1 lesson", gbp: 30, priceEnv: "STRIPE_PRICE_PRIMARY_1" },
  { tier: "primary", tokens: 10, label: "Primary — 10-lesson pack", gbp: 270, priceEnv: "STRIPE_PRICE_PRIMARY_10" },
  { tier: "secondary", tokens: 1, label: "Secondary — 1 lesson", gbp: 35, priceEnv: "STRIPE_PRICE_SECONDARY_1" },
  { tier: "secondary", tokens: 10, label: "Secondary — 10-lesson pack", gbp: 315, priceEnv: "STRIPE_PRICE_SECONDARY_10" },
  { tier: "a_level", tokens: 1, label: "A-level — 1 lesson", gbp: 40, priceEnv: "STRIPE_PRICE_ALEVEL_1" },
  { tier: "a_level", tokens: 10, label: "A-level — 10-lesson pack", gbp: 360, priceEnv: "STRIPE_PRICE_ALEVEL_10" },
];

export function productKey(tier: Tier, tokens: number) {
  return `${tier}:${tokens}`;
}

export function findProduct(tier: string, tokens: number): TokenProduct | undefined {
  return tokenProducts.find((p) => p.tier === tier && p.tokens === tokens);
}

export type Balances = Record<Tier, number>;

export function emptyBalances(): Balances {
  return { primary: 0, secondary: 0, a_level: 0 };
}

/** Balance per tier = sum of the ledger. Uses whatever client is passed
 *  (a user client returns only their own rows via RLS). */
export async function getBalances(
  supabase: SupabaseClient,
  parentId?: string,
): Promise<Balances> {
  let query = supabase.from("token_transactions").select("tier, amount");
  if (parentId) query = query.eq("parent_id", parentId);
  const { data } = await query;

  const bal = emptyBalances();
  for (const row of (data ?? []) as { tier: Tier; amount: number }[]) {
    if (row.tier in bal) bal[row.tier] += row.amount;
  }
  return bal;
}

export const TOKEN_EXPIRY_MONTHS = Number(process.env.TOKEN_EXPIRY_MONTHS ?? 6);
export const CANCEL_WINDOW_HOURS = Number(process.env.CANCEL_WINDOW_HOURS ?? 24);
