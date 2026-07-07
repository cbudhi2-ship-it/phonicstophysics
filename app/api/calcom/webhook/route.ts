import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CANCEL_WINDOW_HOURS } from "@/lib/tokens";

export const runtime = "nodejs";

function verify(body: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

type CalPayload = {
  uid?: string;
  startTime?: string;
  metadata?: Record<string, string>;
  attendees?: { email?: string; name?: string }[];
  location?: string;
  videoCallData?: { url?: string };
};

export async function POST(request: Request) {
  const secret = process.env.CALCOM_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, reason: "not configured" }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("x-cal-signature-256");
  if (!verify(body, signature, secret)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body) as { triggerEvent?: string; payload?: CalPayload };
  const trigger = event.triggerEvent;
  const p = event.payload ?? {};
  const uid = p.uid;
  const md = p.metadata ?? {};
  const parentId = md.parent_id;
  const tier = md.tier;
  const childId = md.child_id || null;

  if (!uid) return NextResponse.json({ received: true });
  const admin = createAdminClient();

  if (trigger === "BOOKING_CREATED" && parentId && tier) {
    // Deduct one token (idempotent on the booking uid + type).
    const { error: dErr } = await admin.from("token_transactions").insert({
      parent_id: parentId,
      tier,
      type: "booking",
      amount: -1,
      cal_booking_uid: uid,
    });
    if (dErr && !dErr.message.includes("duplicate")) {
      console.error("[cal webhook] deduct failed:", dErr.message);
    }

    await admin.from("bookings").upsert(
      {
        parent_id: parentId,
        child_id: childId,
        tier,
        cal_booking_uid: uid,
        starts_at: p.startTime ?? null,
        join_url: p.videoCallData?.url ?? null,
        mode: p.location ?? null,
        status: "scheduled",
      },
      { onConflict: "cal_booking_uid" },
    );

    // TODO: if the tier balance is now negative (rare overbooking race),
    // cancel the Cal.com booking via API and email the parent to top up.
  }

  if (trigger === "BOOKING_CANCELLED") {
    const { data: booking } = await admin
      .from("bookings")
      .select("parent_id, tier, starts_at")
      .eq("cal_booking_uid", uid)
      .single();

    if (booking?.starts_at) {
      const hoursUntil =
        (new Date(booking.starts_at).getTime() - Date.now()) / 3_600_000;
      if (hoursUntil > CANCEL_WINDOW_HOURS) {
        // Free cancellation → refund the token (idempotent).
        const { error: rErr } = await admin.from("token_transactions").insert({
          parent_id: booking.parent_id,
          tier: booking.tier,
          type: "refund",
          amount: 1,
          cal_booking_uid: uid,
        });
        if (rErr && !rErr.message.includes("duplicate")) {
          console.error("[cal webhook] refund failed:", rErr.message);
        }
      }
    }
    await admin.from("bookings").update({ status: "cancelled" }).eq("cal_booking_uid", uid);
  }

  if (trigger === "BOOKING_RESCHEDULED") {
    // Keep the same token; just move the booking.
    await admin
      .from("bookings")
      .update({ starts_at: p.startTime ?? null, status: "scheduled" })
      .eq("cal_booking_uid", uid);
  }

  return NextResponse.json({ received: true });
}
