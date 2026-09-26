import test from "node:test";
import assert from "node:assert/strict";
import { cleanText, hmacHex, isEmail, normalizeEmail, timingSafeEqual, verifyHmacSignature } from "../lib/security.js";

test("normalizes and validates email safely", () => { assert.equal(normalizeEmail("  Person@Example.COM "), "person@example.com"); assert.equal(isEmail("person@example.com"), true); assert.equal(isEmail("not-an-email"), false); });
test("cleans control characters and enforces a limit", () => { assert.equal(cleanText("  hello\n\u0000world  ", 20), "hello world"); assert.equal(cleanText("abcdef", 3), "abc"); });
test("uses constant-work comparison for equal-size strings", () => { assert.equal(timingSafeEqual("abc", "abc"), true); assert.equal(timingSafeEqual("abc", "abd"), false); assert.equal(timingSafeEqual("abc", "ab"), false); });
test("verifies Razorpay-compatible HMAC SHA-256 signatures", async () => { const signature = await hmacHex("secret", "order_1|pay_1"); assert.equal(await verifyHmacSignature("secret", "order_1|pay_1", signature), true); assert.equal(await verifyHmacSignature("secret", "order_1|pay_2", signature), false); });
