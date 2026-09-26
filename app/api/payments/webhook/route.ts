import { NextResponse } from "next/server";
import { fulfilOrder } from "@/lib/fulfilment";
import { hmacHex, verifyHmacSignature } from "@/lib/security.js";
import { supabaseRequest } from "@/lib/supabase";

export async function POST(request: Request) {
  const raw = await request.text(); const signature = request.headers.get("x-razorpay-signature") || "";
  if (!process.env.RAZORPAY_WEBHOOK_SECRET || !await verifyHmacSignature(process.env.RAZORPAY_WEBHOOK_SECRET, raw, signature)) return NextResponse.json({ message: "Invalid signature." }, { status: 401 });
  try { const payload = JSON.parse(raw) as any; const eventId = request.headers.get("x-razorpay-event-id") || await hmacHex(process.env.RAZORPAY_WEBHOOK_SECRET, raw); try { await supabaseRequest("/rest/v1/webhook_events", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ external_event_id: eventId, provider: "razorpay", event_type: payload.event, received_at: new Date().toISOString() }) }); } catch (error) { if (String(error).toLowerCase().includes("duplicate")) return NextResponse.json({ ok: true, duplicate: true }); throw error; }
    if (["payment.captured", "order.paid"].includes(payload.event)) { const payment = payload.payload?.payment?.entity; const order = payload.payload?.order?.entity; const orderId = payment?.order_id || order?.id; if (orderId) { await supabaseRequest(`/rest/v1/orders?razorpay_order_id=eq.${encodeURIComponent(orderId)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ razorpay_payment_id: payment?.id || null, status: "paid", paid_at: new Date().toISOString() }) }); await fulfilOrder(orderId); } }
    return NextResponse.json({ ok: true });
  } catch (error) { console.error("razorpay_webhook_failed", error); return NextResponse.json({ message: "Webhook processing failed." }, { status: 500 }); }
}
