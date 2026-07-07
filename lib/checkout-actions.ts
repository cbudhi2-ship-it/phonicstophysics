"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireClient } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { findProduct } from "@/lib/tokens";

/**
 * Start a Stripe Checkout for a token pack. Only enabled clients can buy.
 * Credits are added by the webhook on checkout.session.completed.
 */
export async function startCheckout(formData: FormData) {
  const { user, profile } = await requireClient();
  if (profile?.status !== "enabled") {
    redirect("/dashboard/tokens?error=not_enabled");
  }

  const tier = String(formData.get("tier") ?? "");
  const tokens = Number(formData.get("tokens") ?? 0);
  const product = findProduct(tier, tokens);
  const stripe = getStripe();
  const priceId = product ? process.env[product.priceEnv] : undefined;

  if (!stripe || !product || !priceId) {
    redirect("/dashboard/tokens?error=unavailable");
  }

  const admin = createAdminClient();

  // Ensure the parent has a Stripe customer.
  const { data: prof } = await admin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user!.id)
    .single();

  let customerId = prof?.stripe_customer_id as string | null;
  if (!customerId) {
    const customer = await stripe!.customers.create({
      email: user!.email ?? undefined,
      metadata: { parent_id: user!.id },
    });
    customerId = customer.id;
    await admin
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user!.id);
  }

  const h = await headers();
  const host = h.get("host") ?? "www.phonicstophysics.com";
  const proto = host.startsWith("localhost") ? "http" : "https";
  const base = `${proto}://${host}`;

  const session = await stripe!.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      parent_id: user!.id,
      tier,
      tokens: String(tokens),
      pack_label: product!.label,
    },
    success_url: `${base}/dashboard/tokens?bought=1`,
    cancel_url: `${base}/dashboard/tokens?canceled=1`,
  });

  redirect(session.url ?? "/dashboard/tokens?error=unavailable");
}

/** Open the Stripe Customer Portal (receipts, saved cards). */
export async function openCustomerPortal() {
  const { user } = await requireClient();
  const stripe = getStripe();
  if (!stripe) redirect("/dashboard/tokens?error=unavailable");

  const admin = createAdminClient();
  const { data: prof } = await admin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user!.id)
    .single();

  const customerId = prof?.stripe_customer_id as string | null;
  if (!customerId) redirect("/dashboard/tokens?error=no_customer");

  const h = await headers();
  const host = h.get("host") ?? "www.phonicstophysics.com";
  const proto = host.startsWith("localhost") ? "http" : "https";

  const portal = await stripe!.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${proto}://${host}/dashboard/tokens`,
  });
  redirect(portal.url);
}
