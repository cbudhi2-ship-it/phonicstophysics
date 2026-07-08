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

  // A refund removes the lesson credits that payment bought, so money and
  // balance stay in sync. Deducts in proportion to the amount refunded.
  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const amount = charge.amount ?? 0;
    const refunded = charge.amount_refunded ?? 0;
    const paymentIntent =
      typeof charge.payment_intent === "string"
        ? charge.payment_intent
        : (charge.payment_intent?.id ?? null);

    if (paymentIntent && amount > 0 && refunded > 0) {
      // Recover our metadata from the checkout session behind this payment.
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: paymentIntent,
        limit: 1,
      });
      const md = sessions.data[0]?.metadata ?? {};
      const parentId = md.parent_id;
      const tier = md.tier;
      const purchased = Number(md.tokens ?? 0);

      const deduct = Math.min(
        purchased,
        Math.round(purchased * (refunded / amount)),
      );

      if (parentId && tier && deduct > 0) {
        const admin = createAdminClient();
        // Idempotent per charge: stripe_session_id holds the charge id here
        // (distinct from checkout-session ids, so no collision).
        const { error } = await admin.from("token_transactions").insert({
          parent_id: parentId,
          tier,
          type: "adjustment",
          amount: -deduct,
          stripe_session_id: charge.id,
          pack_label: "Stripe refund",
          note: `Refund of £${(refunded / 100).toFixed(2)} — removed ${deduct} lesson(s)`,
        });
        if (error && !error.message.includes("duplicate")) {
          console.error(
            "[stripe webhook] refund adjustment failed:",
            error.message,
          );
          return NextResponse.json({ error: "refund adjust failed" }, { status: 500 });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
