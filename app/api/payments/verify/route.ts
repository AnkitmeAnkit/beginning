import { NextResponse } from "next/server";
import { fulfilOrder } from "@/lib/fulfilment";
import { verifyHmacSignature } from "@/lib/security.js";
import { supabaseRequest } from "@/lib/supabase";

export async function POST(request: Request) {
  try { const body = await request.json() as { razorpay_order_id?: string; razorpay_payment_id?: string; razorpay_signature?: string }; const orderId = body.razorpay_order_id || ""; const paymentId = body.razorpay_payment_id || ""; if (!process.env.RAZORPAY_KEY_SECRET || !await verifyHmacSignature(process.env.RAZORPAY_KEY_SECRET, `${orderId}|${paymentId}`, body.razorpay_signature || "")) return NextResponse.json({ message: "Payment signature is invalid." }, { status: 400 });
    await supabaseRequest(`/rest/v1/orders?razorpay_order_id=eq.${encodeURIComponent(orderId)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ razorpay_payment_id: paymentId, status: "paid", paid_at: new Date().toISOString() }) }); await fulfilOrder(orderId); return NextResponse.json({ ok: true });
  } catch (error) { console.error("payment_verification_failed", error); return NextResponse.json({ message: "Payment is being reconciled. Fulfilment will continue by email." }, { status: 503 }); }
}
