import { NextResponse } from "next/server";
import { playbooks } from "@/lib/content";
import { cleanText, getClientIp, isEmail, normalizeEmail } from "@/lib/security.js";
import { claimSubmission, supabaseRequest } from "@/lib/supabase";

export async function POST(request: Request) {
  try { const body = await request.json() as Record<string, unknown>; const email = normalizeEmail(body.email); const name = cleanText(body.name, 100); const slug = cleanText(body.slug, 100); const product = playbooks.find((entry) => entry.slug === slug && entry.status !== "waitlist");
    if (!product || !isEmail(email) || name.length < 2 || body.consent !== true) return NextResponse.json({ message: "Check the product, name, email, and consent." }, { status: 400 });
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return NextResponse.json({ message: "Payments are being connected. Join the waitlist or email help@echoglitch.in." }, { status: 503 });
    if (!await claimSubmission("payment-order", email, getClientIp(request.headers))) return NextResponse.json({ message: "Please wait before starting another checkout." }, { status: 429 });
    const receipt = `eg_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`; const authorization = btoa(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`);
    const response = await fetch("https://api.razorpay.com/v1/orders", { method: "POST", headers: { authorization: `Basic ${authorization}`, "content-type": "application/json" }, body: JSON.stringify({ amount: product.price, currency: "INR", receipt, notes: { product_slug: product.slug, buyer_email: email } }) });
    const order = await response.json() as { id?: string; amount?: number; currency?: string; error?: { description?: string } }; if (!response.ok || !order.id) throw new Error(order.error?.description || "Razorpay order creation failed.");
    await supabaseRequest("/rest/v1/orders", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ razorpay_order_id: order.id, receipt, buyer_name: name, buyer_email: email, product_slug: product.slug, product_title: product.title, amount: product.price, currency: "INR", status: "created", fulfilment_status: product.status === "preorder" ? "pending_release" : "pending", consented_at: new Date().toISOString() }) });
    return NextResponse.json({ keyId: process.env.RAZORPAY_KEY_ID, orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error) { console.error("payment_order_failed", error); return NextResponse.json({ message: "Checkout is temporarily unavailable. No payment was taken." }, { status: 503 }); }
}
