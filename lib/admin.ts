import { cookies } from "next/headers";
import { supabaseRequest } from "./supabase";
export type AdminUser = { id: string; email: string };
function allowed(email: string) { const list = (process.env.ADMIN_EMAIL_ALLOWLIST || "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean); return list.includes(email.toLowerCase()); }
export async function getAdmin(): Promise<AdminUser | null> { const token = (await cookies()).get("eg_admin_access")?.value; if (!token) return null; try { const user = await supabaseRequest<{ id: string; email?: string }>("/auth/v1/user", { method: "GET" }, token); return user.email && allowed(user.email) ? { id: user.id, email: user.email } : null; } catch { return null; } }
export async function requireAdminApi() { const user = await getAdmin(); if (!user) throw new Error("UNAUTHENTICATED"); return user; }
