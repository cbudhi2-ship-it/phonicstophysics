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

type Admin = ReturnType<typeof createAdminClient>;

/** Cancel a Cal.com booking via the API (used to undo an unfunded booking). */
async function cancelCalBooking(uid: string, reason: string) {
  const key = process.env.CALCOM_API_KEY;
  if (!key) return;
  try {
    await fetch(`https://api.cal.com/v2/bookings/${uid}/cancel`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "cal-api-version": "2024-08-13",
      },
      body: JSON.stringify({ cancellationReason: reason }),
    });
  } catch (err) {
    console.error("[cal webhook] auto-cancel failed:", err);
  }
}

/** Email a parent whose booking was auto-cancelled for lack of credit. */
async function notifyNoCredit(admin: Admin, parentId: string) {
  try {
    const { data } = await admin.auth.admin.getUserById(parentId);
    const email = data.user?.email;
    if (!email) return;
    const { sendMail } = await import("@/lib/email");
    const url =
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.phonicstophysics.com";
    await sendMail({
      to: email,
      subject: "We couldn't confirm your lesson booking",
      html: `
        <p>Hi,</p>
        <p>Your recent booking couldn't be confirmed because there were no
        lessons left on your balance. Please buy a lesson and book again:</p>
        <p><a href="${url}/dashboard/tokens">Buy a lesson</a></p>
        <p>Sorry for the inconvenience!<br>— Phonics to Physics</p>
      `,
    });
  } catch (err) {
    console.error("[cal webhook] notify failed:", err);
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
    // Idempotency: if we've already processed this booking, stop.
    const { data: seen } = await admin
      .from("token_transactions")
      .select("id")
      .eq("cal_booking_uid", uid)
      .eq("type", "booking")
      .maybeSingle();
    if (seen) return NextResponse.json({ received: true });

    // Re-check the balance server-side. If there's nothing to spend (a race,
    // or a booking made without buying), auto-cancel it and notify the parent.
    const { getBalances } = await import("@/lib/tokens");
    const balances = await getBalances(admin, parentId);
    const available = balances[tier as keyof typeof balances] ?? 0;

    if (available < 1) {
      await cancelCalBooking(uid, "No lesson credit available");
      await notifyNoCredit(admin, parentId);
      return NextResponse.json({ received: true, cancelled: "no_credit" });
    }

    // Deduct one token and mirror the booking.
    await admin.from("token_transactions").insert({
      parent_id: parentId,
      tier,
      type: "booking",
      amount: -1,
      cal_booking_uid: uid,
    });

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
