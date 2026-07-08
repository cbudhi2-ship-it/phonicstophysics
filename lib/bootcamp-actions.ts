"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getStripe } from "@/lib/stripe";
import { bootcampPriceEnv, isEarlyBird } from "@/lib/bootcamp";

/**
 * Public booking for the bootcamp — no login needed. Creates a Stripe
 * Checkout session for the current price (early-bird vs standard by date).
 * Enrolment + joining email happen in the Stripe webhook on success.
 */
export async function bookBootcamp() {
  const stripe = getStripe();
  const priceId = process.env[bootcampPriceEnv()];
  if (!stripe || !priceId) {
    redirect("/bootcamp?error=unavailable");
  }

  const h = await headers();
  const host = h.get("host") ?? "www.phonicstophysics.com";
  const proto = host.startsWith("localhost") ? "http" : "https";
  const base = `${proto}://${host}`;

  const session = await stripe!.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true, // e.g. a "SIBLING20" coupon for a 2nd child
    phone_number_collection: { enabled: true },
    custom_fields: [
      {
        key: "child_name",
        label: { type: "custom", custom: "Child's name" },
        type: "text",
      },
    ],
    metadata: { type: "bootcamp", early_bird: String(isEarlyBird()) },
    success_url: `${base}/bootcamp?booked=1`,
    cancel_url: `${base}/bootcamp?canceled=1`,
  });

  redirect(session.url ?? "/bootcamp?error=unavailable");
}
