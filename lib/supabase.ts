export class IntegrationUnavailableError extends Error { constructor(public integration: string) { super(`${integration} is not configured.`); } }
function publishableKey() { return process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY; }
export function supabaseSecretKey() { return process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY; }
export function supabaseConfigured() { return Boolean(process.env.SUPABASE_URL && supabaseSecretKey()); }
export async function supabaseRequest<T = unknown>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const base = process.env.SUPABASE_URL?.replace(/\/$/, ""); const key = token ? publishableKey() : supabaseSecretKey();
  if (!base || !key) throw new IntegrationUnavailableError("Supabase");
  const legacyServerKey = !token && key.startsWith("eyJ");
  const response = await fetch(`${base}${path}`, { ...init, headers: { apikey: key, ...(token || legacyServerKey ? { authorization: `Bearer ${token || key}` } : {}), "content-type": "application/json", ...(init.headers || {}) } });
  const text = await response.text(); const payload = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(payload?.message || payload?.error_description || payload?.error || `Supabase request failed (${response.status}).`);
  return payload as T;
}
export async function claimSubmission(kind: string, email: string, ip: string) {
  return supabaseRequest<boolean>("/rest/v1/rpc/claim_submission_slot", { method: "POST", body: JSON.stringify({ p_kind: kind, p_email: email, p_ip: ip }) });
}
