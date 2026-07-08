import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type Row = {
  parent_id: string;
  tier: string;
  amount: number;
  expires_at: string | null;
  created_at: string;
};

/**
 * Expire lapsed, unused lesson credits. Runs daily via Vercel Cron.
 *
 * For each (parent, tier) we replay the ledger oldest-first as FIFO lots:
 * positive rows add a lot (purchases carry an expiry), negative rows
 * (bookings, prior expiries, negative adjustments) consume the oldest lot
 * first — so the credits nearest to expiring are used up first. Whatever
 * remains in a lot whose expiry has passed is expired now. Naturally
 * idempotent: a prior expiry row consumes the lapsed lot, so re-running
 * finds nothing left to expire.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("token_transactions")
    .select("parent_id, tier, amount, expires_at, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const now = Date.now();
  const groups = new Map<string, Row[]>();
  for (const row of (data ?? []) as Row[]) {
    const key = `${row.parent_id}|${row.tier}`;
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(row);
  }

  const toInsert: {
    parent_id: string;
    tier: string;
    type: string;
    amount: number;
    note: string;
  }[] = [];

  for (const [key, rows] of groups) {
    const [parentId, tier] = key.split("|");
    const lots: { remaining: number; expiresAt: number | null }[] = [];

    for (const tx of rows) {
      if (tx.amount > 0) {
        lots.push({
          remaining: tx.amount,
          expiresAt: tx.expires_at ? new Date(tx.expires_at).getTime() : null,
        });
      } else {
        let need = -tx.amount;
        for (const lot of lots) {
          if (need <= 0) break;
          const take = Math.min(lot.remaining, need);
          lot.remaining -= take;
          need -= take;
        }
      }
    }

    const expireNow = lots.reduce(
      (sum, lot) =>
        lot.expiresAt && lot.expiresAt < now ? sum + lot.remaining : sum,
      0,
    );

    if (expireNow > 0) {
      toInsert.push({
        parent_id: parentId,
        tier,
        type: "expiry",
        amount: -expireNow,
        note: "Lessons expired (6 months after purchase)",
      });
    }
  }

  if (toInsert.length > 0) {
    const { error: insErr } = await admin
      .from("token_transactions")
      .insert(toInsert);
    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({ expiredGroups: toInsert.length });
}
