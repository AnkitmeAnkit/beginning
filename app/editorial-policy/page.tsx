import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
export const metadata: Metadata = { title: "Editorial and reference policy" };
export default function EditorialPolicyPage() { return <LegalPage title="Editorial and reference policy" intro="echoglitch publishes practical guidance. This is how we decide what to claim, cite, correct, and disclose." sections={[
  { title: "Evidence before certainty", paragraphs: ["Factual claims that can change are checked against current primary sources where possible. Research claims are linked or named close to the claim. Experience-based advice is presented as a method to test, not a universal fact."] },
  { title: "AI-assisted work", paragraphs: ["AI may help with outlining, editing, comparison, code, or quality checks. A human remains responsible for the final claim, source selection, product decision, and published result. We do not cite AI output as evidence."] },
  { title: "Commercial independence", paragraphs: ["Product pages explain what is included, the price, delivery state, and material limitations. If we publish sponsored or affiliate content in the future, the relationship will be disclosed before the relevant link or recommendation."] },
  { title: "Corrections", paragraphs: ["Material factual errors are corrected promptly. When a correction changes the conclusion or a buyer-relevant claim, we add a visible note or directly notify affected purchasers where practical. Send correction requests with the page URL and supporting source."] },
]} />; }
