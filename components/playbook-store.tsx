"use client";

import { FormEvent, useState } from "react";
import { ArrowUpRight, Check, LoaderCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Playbook } from "@/lib/content";
import { formatPrice } from "@/lib/content";

declare global { interface Window { Razorpay?: new (options: Record<string, unknown>) => { open(): void }; } }

async function loadRazorpay() {
  if (window.Razorpay) return true;
  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script"); script.src = "https://checkout.razorpay.com/v1/checkout.js"; script.async = true;
    script.onload = () => resolve(true); script.onerror = () => resolve(false); document.body.appendChild(script);
  });
}

export function PlaybookStore({ items }: { items: Playbook[] }) {
  const [selected, setSelected] = useState<Playbook | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function checkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!selected) return; setBusy(true); setNotice("");
    const form = new FormData(event.currentTarget); const name = String(form.get("name") || ""); const email = String(form.get("email") || "");
    try {
      const response = await fetch("/api/payments/order", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug: selected.slug, name, email, consent: form.get("consent") === "on" }) });
      const result = await response.json() as { message?: string; keyId?: string; orderId?: string; amount?: number; currency?: string };
      if (!response.ok || !result.orderId) throw new Error(result.message || "Checkout is not available yet.");
      if (!await loadRazorpay() || !window.Razorpay) throw new Error("Payment checkout could not load. Please check your connection and try again.");
      const razorpay = new window.Razorpay({ key: result.keyId, amount: result.amount, currency: result.currency, order_id: result.orderId, name: "echoglitch", description: selected.title, prefill: { name, email }, theme: { color: "#071a2b" },
        handler: async (payment: Record<string, string>) => {
          const verify = await fetch("/api/payments/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...payment, email }) });
          if (!verify.ok) { setNotice("Payment was received, but fulfilment is still being verified. We’ll email you shortly."); return; }
          setNotice("Payment verified. Your playbook is on its way to your inbox.");
        },
      });
      razorpay.open();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Checkout is temporarily unavailable."); }
    finally { setBusy(false); }
  }

  async function waitlist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!selected) return; setBusy(true); setNotice(""); const form = new FormData(event.currentTarget);
    try { const response = await fetch("/api/waitlist", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ playbookSlug: selected.slug, name: form.get("name"), email: form.get("email"), consent: form.get("consent") === "on", website: form.get("website") }) }); const result = await response.json() as { message?: string }; if (!response.ok) throw new Error(result.message || "Could not join the waitlist."); setNotice("You’re in. We’ll send the launch note and the waitlist price first."); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Please try again."); } finally { setBusy(false); }
  }

  return <div className="catalogue-grid">
    {items.map((item) => <article className={`product-card accent-${item.accent}`} key={item.slug}>
      <div className="product-status"><span>{item.statusLabel}</span><span>{item.price ? formatPrice(item.price) : "Free to join"}</span></div>
      <div><p className="product-code">PLAYBOOK / {item.shortTitle}</p><h2>{item.title}</h2><p className="product-promise">{item.promise}</p></div>
      <ul>{item.includes.slice(0,3).map((entry) => <li key={entry}><Check size={16} />{entry}</li>)}</ul>
      <Dialog onOpenChange={(open) => { if (!open) { setSelected(null); setNotice(""); } }}>
        <DialogTrigger asChild><button className="product-action" onClick={() => setSelected(item)}>{item.status === "available" ? "Get the playbook" : item.status === "preorder" ? "Pre-order now" : "Join the waitlist"}<ArrowUpRight size={18} /></button></DialogTrigger>
        {selected?.slug === item.slug && <DialogContent className="checkout-dialog">
          <DialogHeader><DialogTitle>{selected.title}</DialogTitle><DialogDescription>{selected.description}</DialogDescription></DialogHeader>
          <div className="dialog-facts"><span>{selected.format}</span><span>{selected.duration}</span></div>
          <ul className="dialog-includes">{selected.includes.map((entry) => <li key={entry}><Check size={16} />{entry}</li>)}</ul>
          <form className="checkout-form" onSubmit={selected.status === "waitlist" ? waitlist : checkout}>
            <label>Name<input name="name" required autoComplete="name" /></label><label>Email<input name="email" type="email" required autoComplete="email" /></label>
            <input className="honeypot" name="website" tabIndex={-1} autoComplete="off" />
            <label className="consent-line"><input name="consent" type="checkbox" required /><span>I agree to the terms and privacy policy and to receive fulfilment and product emails.</span></label>
            <button className="button button-primary" disabled={busy}>{busy ? <><LoaderCircle className="spin" size={18} /> Working…</> : selected.status === "waitlist" ? "Join the research waitlist" : `Pay ${formatPrice(selected.price)} securely`}</button>
            {selected.status !== "waitlist" && <p className="payment-note">Secure checkout by Razorpay. UPI, cards, netbanking, and supported wallets.</p>}
            {notice && <p className="form-notice" role="status">{notice}</p>}
          </form>
        </DialogContent>}
      </Dialog>
    </article>)}
  </div>;
}
