import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { TOKEN_EXPIRY_MONTHS } from "@/lib/tokens";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ ok: false, reason: "not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature ?? "", secret);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const md = session.metadata ?? {};
    const parentId = md.parent_id;
    const tier = md.tier;
    const tokens = Number(md.tokens ?? 0);

    if (parentId && tier && tokens > 0) {
      const admin = createAdminClient();
      const expires = new Date();
      expires.setMonth(expires.getMonth() + TOKEN_EXPIRY_MONTHS);

      // Idempotent: the unique index on stripe_session_id rejects duplicates
      // if Stripe re-delivers the event.
      const { error } = await admin.from("token_transactions").insert({
        parent_id: parentId,
        tier,
        type: "purchase",
        amount: tokens,
        stripe_session_id: session.id,
        pack_label: md.pack_label ?? null,
        expires_at: expires.toISOString(),
      });
      if (error && !error.message.includes("duplicate")) {
        console.error("[stripe webhook] failed to credit tokens:", error.message);
        return NextResponse.json({ error: "credit failed" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
