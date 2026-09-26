"use client";

import { FormEvent, useState } from "react";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";

export function LeadForm({ source = "site-footer" }: { source?: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("sending"); setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/leads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({
        name: form.get("name"), email: form.get("email"), goal: form.get("goal"), consent: form.get("consent") === "on", website: form.get("website"), source,
      }) });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message || "We could not save your note.");
      setState("done"); setMessage("You’re on the list. Watch your inbox for the useful stuff."); event.currentTarget.reset();
    } catch (error) { setState("error"); setMessage(error instanceof Error ? error.message : "Try again in a moment."); }
  }

  if (state === "done") return <div className="form-success" role="status"><CheckCircle2 /><div><strong>Signal received.</strong><p>{message}</p></div></div>;
  return (
    <form className="lead-form" onSubmit={submit}>
      <div className="form-row"><label>Name<input name="name" autoComplete="name" required minLength={2} /></label><label>Email<input name="email" type="email" autoComplete="email" required /></label></div>
      <label>What are you trying to move forward?<textarea name="goal" rows={3} maxLength={600} placeholder="A launch, a workflow, a stuck decision…" /></label>
      <input className="honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <label className="consent-line"><input name="consent" type="checkbox" required /><span>I agree to echoglitch storing this information to answer my request and send relevant updates. I can unsubscribe at any time.</span></label>
      <div className="form-submit"><button className="button button-primary" disabled={state === "sending"}>{state === "sending" ? "Sending…" : <>Send my signal <ArrowUpRight size={18} /></>}</button><span>Useful notes only. No noisy newsletter treadmill.</span></div>
      {state === "error" && <p className="form-error" role="alert">{message}</p>}
    </form>
  );
}
