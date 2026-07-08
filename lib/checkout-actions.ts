"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type Stripe from "stripe";
import { requireClient } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { findProduct } from "@/lib/tokens";

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * Return a Stripe customer id that is valid for the CURRENT Stripe account/mode.
 * A stored id from a different mode (e.g. a test customer after switching to
 * live) is discarded and replaced — so test→live switches don't break checkout.
 */
async function ensureCustomer(
  stripe: Stripe,
  admin: AdminClient,
  userId: string,
  email: string | null,
  storedId: string | null,
): Promise<string> {
  if (storedId) {
    try {
      const existing = await stripe.customers.retrieve(storedId);
      if (!("deleted" in existing && existing.deleted)) return storedId;
    } catch {
      // Not found in this mode — fall through and make a new one.
    }
  }
  const customer = await stripe.customers.create({
    email: email ?? undefined,
    metadata: { parent_id: userId },
  });
  await admin
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", userId);
  return customer.id;
}

async function baseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "www.phonicstophysics.com";
  const proto = host.startsWith("localhost") ? "http" : "https";
  return `${proto}://${host}`;
}

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

  // Build the session inside try/catch so any Stripe error becomes a friendly
  // message rather than a crash page. redirect() must run AFTER the try/catch.
  let dest = "/dashboard/tokens?error=unavailable";
  try {
    const admin = createAdminClient();
    const { data: prof } = await admin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user!.id)
      .single();

    const customerId = await ensureCustomer(
      stripe!,
      admin,
      user!.id,
      user!.email,
      (prof?.stripe_customer_id as string | null) ?? null,
    );

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
      success_url: `${await baseUrl()}/dashboard/tokens?bought=1`,
      cancel_url: `${await baseUrl()}/dashboard/tokens?canceled=1`,
    });
    if (session.url) dest = session.url;
  } catch (err) {
    console.error("[checkout] failed:", err);
  }

  redirect(dest);
}

/** Open the Stripe Customer Portal (receipts, saved cards). */
export async function openCustomerPortal() {
  const { user } = await requireClient();
  const stripe = getStripe();
  if (!stripe) redirect("/dashboard/tokens?error=unavailable");

  let dest = "/dashboard/tokens?error=unavailable";
  try {
    const admin = createAdminClient();
    const { data: prof } = await admin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user!.id)
      .single();

    const customerId = await ensureCustomer(
      stripe!,
      admin,
      user!.id,
      user!.email,
      (prof?.stripe_customer_id as string | null) ?? null,
    );

    const portal = await stripe!.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${await baseUrl()}/dashboard/tokens`,
    });
    if (portal.url) dest = portal.url;
  } catch (err) {
    console.error("[portal] failed:", err);
  }

  redirect(dest);
}
