const encoder = new TextEncoder();
export function normalizeEmail(value) { return String(value ?? "").trim().toLowerCase(); }
export function isEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value)) && normalizeEmail(value).length <= 254; }
export function cleanText(value, max = 600) { return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max); }
export function timingSafeEqual(left, right) { const a = encoder.encode(String(left)); const b = encoder.encode(String(right)); if (a.length !== b.length) return false; let difference = 0; for (let index = 0; index < a.length; index += 1) difference |= a[index] ^ b[index]; return difference === 0; }
export async function hmacHex(secret, payload) { const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]); const result = await crypto.subtle.sign("HMAC", key, encoder.encode(payload)); return [...new Uint8Array(result)].map((byte) => byte.toString(16).padStart(2, "0")).join(""); }
export async function verifyHmacSignature(secret, payload, signature) { if (!secret || !signature) return false; return timingSafeEqual(await hmacHex(secret, payload), String(signature).trim().toLowerCase()); }
export function getClientIp(headers) { return headers.get("cf-connecting-ip") || headers.get("x-real-ip") || headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"; }
