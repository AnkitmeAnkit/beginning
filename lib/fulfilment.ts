import { supabaseRequest, supabaseSecretKey } from "./supabase";

type Order = { id: string; razorpay_order_id: string; buyer_email: string; buyer_name: string; product_slug: string; product_title: string; amount: number; status: string; fulfilment_status: string };
type Product = { file_path: string | null; status: string };

function arrayBufferToBase64(buffer: ArrayBuffer) { const bytes = new Uint8Array(buffer); let binary = ""; for (let offset = 0; offset < bytes.length; offset += 0x8000) binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000)); return btoa(binary); }

async function sendEmail(payload: Record<string, unknown>) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) throw new Error("Resend is not configured.");
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, "content-type": "application/json", "idempotency-key": String(payload.idempotencyKey) }, body: JSON.stringify({ ...payload, idempotencyKey: undefined }) });
  const result = await response.json() as { id?: string; message?: string }; if (!response.ok) throw new Error(result.message || "Email delivery failed."); return result;
}

export async function fulfilOrder(razorpayOrderId: string) {
  const orders = await supabaseRequest<Order[]>(`/rest/v1/orders?razorpay_order_id=eq.${encodeURIComponent(razorpayOrderId)}&select=*`);
  const order = orders[0]; if (!order) throw new Error("Order was not found."); if (order.fulfilment_status === "sent") return;
  const products = await supabaseRequest<Product[]>(`/rest/v1/playbooks?slug=eq.${encodeURIComponent(order.product_slug)}&select=file_path,status`); const product = products[0];
  const preorder = product?.status === "preorder";
  let attachments: { filename: string; content: string }[] | undefined;
  if (product?.file_path && !preorder) {
    const base = process.env.SUPABASE_URL?.replace(/\/$/, ""); const key = supabaseSecretKey()!;
    const file = await fetch(`${base}/storage/v1/object/playbooks/${product.file_path}`, { headers: { apikey: key, ...(key.startsWith("eyJ") ? { authorization: `Bearer ${key}` } : {}) } });
    if (!file.ok) throw new Error("Product file could not be loaded."); attachments = [{ filename: `${order.product_slug}.pdf`, content: arrayBufferToBase64(await file.arrayBuffer()) }];
  }
  const subject = preorder ? `Pre-order confirmed: ${order.product_title}` : attachments ? `Your echoglitch playbook: ${order.product_title}` : `Payment confirmed: ${order.product_title}`;
  const html = preorder ? `<p>Hi ${order.buyer_name},</p><p>Your pre-order for <strong>${order.product_title}</strong> is confirmed. We will deliver it to this address on release.</p><p>Keep moving,<br>echoglitch</p>` : attachments ? `<p>Hi ${order.buyer_name},</p><p>Your copy of <strong>${order.product_title}</strong> is attached. Start with the first-proof page and make one result visible today.</p><p>Keep moving,<br>echoglitch</p>` : `<p>Hi ${order.buyer_name},</p><p>Your payment for <strong>${order.product_title}</strong> is confirmed. The download is being prepared and will follow shortly. If you need help, reply to this email or contact help@echoglitch.in.</p>`;
  const email = await sendEmail({ idempotencyKey: `fulfil-${order.id}`, from: process.env.RESEND_FROM_EMAIL, to: [order.buyer_email], reply_to: "help@echoglitch.in", subject, html, attachments });
  await supabaseRequest(`/rest/v1/orders?id=eq.${order.id}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ fulfilment_status: attachments || preorder ? "sent" : "awaiting_asset", fulfilment_email_id: email.id || null, fulfilled_at: new Date().toISOString() }) });
}
