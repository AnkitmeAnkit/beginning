import { NextResponse } from "next/server";
import { cleanText, getClientIp, isEmail, normalizeEmail } from "@/lib/security.js";
import { claimSubmission, supabaseRequest } from "@/lib/supabase";

export async function POST(request: Request) {
  try { const body = await request.json() as Record<string, unknown>; if (body.website) return NextResponse.json({ ok: true }); const email = normalizeEmail(body.email); const name = cleanText(body.name, 100); const playbookSlug = cleanText(body.playbookSlug, 100); if (!isEmail(email) || name.length < 2 || !playbookSlug || body.consent !== true) return NextResponse.json({ message: "Add a valid name, email, and consent." }, { status: 400 });
    if (!await claimSubmission(`waitlist:${playbookSlug}`, email, getClientIp(request.headers))) return NextResponse.json({ message: "You’re already on this list." }, { status: 429 });
    await supabaseRequest("/rest/v1/waitlist", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify({ email, name, playbook_slug: playbookSlug, consented_at: new Date().toISOString() }) }); return NextResponse.json({ ok: true });
  } catch (error) { console.error("waitlist_submission_failed", error); return NextResponse.json({ message: "The waitlist is temporarily unavailable. Email help@echoglitch.in instead." }, { status: 503 }); }
}
