export function normalizeEmail(value: unknown): string;
export function isEmail(value: unknown): boolean;
export function cleanText(value: unknown, max?: number): string;
export function timingSafeEqual(left: unknown, right: unknown): boolean;
export function hmacHex(secret: string, payload: string): Promise<string>;
export function verifyHmacSignature(secret: string, payload: string, signature: string): Promise<boolean>;
export function getClientIp(headers: Headers): string;
