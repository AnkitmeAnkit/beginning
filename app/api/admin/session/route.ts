import { NextResponse } from "next/server";
import { isEmail, normalizeEmail } from "@/lib/security.js";

export async function POST(request: Request) {
  try { const { email: rawEmail, password } = await request.json() as { email?: string; password?: string }; const email = normalizeEmail(rawEmail); const allowed = (process.env.ADMIN_EMAIL_ALLOWLIST || "").split(",").map((item) => item.trim().toLowerCase()).includes(email);
    if (!isEmail(email) || !password || !allowed) return NextResponse.json({ message: "These credentials are not authorised for echoglitch admin." }, { status: 401 });
    const base = process.env.SUPABASE_URL?.replace(/\/$/, ""); const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY; if (!base || !key) return NextResponse.json({ message: "Admin authentication is not configured." }, { status: 503 });
    const auth = await fetch(`${base}/auth/v1/token?grant_type=password`, { method: "POST", headers: { apikey: key, "content-type": "application/json" }, body: JSON.stringify({ email, password }) }); const result = await auth.json() as { access_token?: string; refresh_token?: string; expires_in?: number; error_description?: string };
    if (!auth.ok || !result.access_token) return NextResponse.json({ message: result.error_description || "Sign in failed." }, { status: 401 });
    const response = NextResponse.json({ ok: true }); const secure = process.env.NODE_ENV === "production"; response.cookies.set("eg_admin_access", result.access_token, { httpOnly: true, secure, sameSite: "strict", path: "/", maxAge: result.expires_in || 3600 }); if (result.refresh_token) response.cookies.set("eg_admin_refresh", result.refresh_token, { httpOnly: true, secure, sameSite: "strict", path: "/api/admin", maxAge: 60 * 60 * 24 * 30 }); return response;
  } catch (error) { console.error("admin_signin_failed", error); return NextResponse.json({ message: "Sign in is temporarily unavailable." }, { status: 503 }); }
}
export async function DELETE() { const response = NextResponse.json({ ok: true }); response.cookies.set("eg_admin_access", "", { httpOnly: true, maxAge: 0, path: "/" }); response.cookies.set("eg_admin_refresh", "", { httpOnly: true, maxAge: 0, path: "/api/admin" }); return response; }
