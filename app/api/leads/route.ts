import { NextResponse } from "next/server";
import { cleanText, getClientIp, isEmail, normalizeEmail } from "@/lib/security.js";
import { claimSubmission, supabaseRequest } from "@/lib/supabase";

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") || 0) > 12000) return NextResponse.json({ message: "Request is too large." }, { status: 413 });
  try { const body = await request.json() as Record<string, unknown>; if (body.website) return NextResponse.json({ ok: true }); const email = normalizeEmail(body.email); const name = cleanText(body.name, 100); const goal = cleanText(body.goal, 600); if (!isEmail(email) || name.length < 2 || body.consent !== true) return NextResponse.json({ message: "Add a valid name, email, and consent." }, { status: 400 });
    if (!await claimSubmission("lead", email, getClientIp(request.headers))) return NextResponse.json({ message: "You have sent a few notes already. Please try again later." }, { status: 429 });
    await supabaseRequest("/rest/v1/leads", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ email, name, goal, source: cleanText(body.source, 80), consented_at: new Date().toISOString() }) }); return NextResponse.json({ ok: true });
  } catch (error) { console.error("lead_submission_failed", error); return NextResponse.json({ message: "The form is temporarily unavailable. Email help@echoglitch.in instead." }, { status: 503 }); }
}
