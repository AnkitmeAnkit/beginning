"use client";
import { useEffect } from "react";
import { playbooks } from "@/lib/content";

type Tool = { name: string; description: string; inputSchema?: Record<string, unknown>; execute: (input: any) => Promise<unknown> | unknown };
type ModelContext = { registerTool: (tool: Tool, options?: { signal?: AbortSignal }) => Promise<void> };

export function WebMcpTools() {
  useEffect(() => {
    const modelContext = (document as Document & { modelContext?: ModelContext }).modelContext;
    if (!modelContext) return;
    const controller = new AbortController();
    void modelContext.registerTool({ name: "list_echoglitch_playbooks", description: "List the current echoglitch productivity playbooks with availability, promise, price in Indian rupees, and format.", inputSchema: { type: "object", properties: {}, additionalProperties: false }, execute: () => ({ content: [{ type: "text", text: playbooks.map((item) => `${item.title}: ${item.promise} — ${item.statusLabel} — ${item.price ? `₹${item.price/100}` : "free waitlist"}`).join("\n") }] }) }, { signal: controller.signal }).catch(() => undefined);
    void modelContext.registerTool({ name: "join_echoglitch_waitlist", description: "Join the research waitlist for an upcoming echoglitch playbook. Use only after the person has explicitly agreed to the privacy notice and email updates.", inputSchema: { type: "object", properties: { playbookSlug: { type: "string", enum: playbooks.filter((item) => item.status === "waitlist").map((item) => item.slug) }, name: { type: "string", minLength: 2 }, email: { type: "string", format: "email" }, consent: { type: "boolean", const: true } }, required: ["playbookSlug", "name", "email", "consent"], additionalProperties: false }, execute: async (input) => { const response = await fetch("/api/waitlist", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(input) }); const result = await response.json(); if (!response.ok) throw new Error(result.message || "Waitlist request failed."); return { content: [{ type: "text", text: "Waitlist joined. Launch details will be sent by email." }] }; } }, { signal: controller.signal }).catch(() => undefined);
    return () => controller.abort();
  }, []);
  return null;
}
