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

    // Bootcamp course booking (public, no portal account needed).
    if (md.type === "bootcamp") {
      const admin = createAdminClient();
      const email = session.customer_details?.email ?? "";
      const name =
        session.customer_details?.name ??
        // Falls back to the "Child's name" custom field if the buyer's name is blank.
        session.custom_fields?.find((f) => f.key === "child_name")?.text
          ?.value ??
        null;

      const { error: enrErr } = await admin
        .from("bootcamp_enrolments")
        .insert({
          name,
          email,
          amount_gbp: (session.amount_total ?? 0) / 100,
          early_bird: md.early_bird === "true",
          stripe_session_id: session.id,
        });
      if (enrErr && !enrErr.message.includes("duplicate")) {
        console.error("[stripe webhook] bootcamp enrol failed:", enrErr.message);
      }

      // Confirm to the buyer + notify Chris (best-effort).
      const { sendMail } = await import("@/lib/email");
      const notify = process.env.CONTACT_NOTIFY_EMAIL ?? "hello@phonicstophysics.com";
      if (email) {
        await sendMail({
          to: email,
          subject: "You're booked — Complete 11+ Summer Bootcamp",
          html: `<p>Thank you — your place on the Complete 11+ Summer Bootcamp is booked! 🎉</p>
            <p><strong>When:</strong> Mon–Fri, 3–28 August 2026, 9:30–10:30am, live online.</p>
            <p>I'll email your joining link and the first workbook before we start.
            Every session is recorded in case you miss one.</p>
            <p>Warm wishes,<br>Chris<br><em>Small steps, big results.</em></p>`,
        }).catch(() => {});
      }
      await sendMail({
        to: notify,
        subject: `New bootcamp booking — ${name ?? email}`,
        html: `<p>New 11+ Bootcamp booking:</p>
          <p><strong>${name ?? "—"}</strong> · ${email}<br>
          Paid £${((session.amount_total ?? 0) / 100).toFixed(2)}
          ${md.early_bird === "true" ? "(early bird)" : ""}</p>`,
      }).catch(() => {});
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
