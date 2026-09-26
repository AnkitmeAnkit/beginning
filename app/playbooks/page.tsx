import type { Metadata } from "next";
import { PlaybookStore } from "@/components/playbook-store";
import { LeadForm } from "@/components/lead-form";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { playbooks } from "@/lib/content";

export const metadata: Metadata = { title: "Productivity playbooks", description: "Practical guides for focus, execution, and building an AI-assisted workday." };

export default function PlaybooksPage() {
  return <main><SiteHeader />
    <section className="page-hero catalogue-hero"><div className="wrap"><p className="page-kicker">Productivity, made executable</p><h1>Choose the result. Take the route.</h1><p>Each playbook is a complete working system: clear decisions, a short sequence, practical tools, and a visible finish line. No 200-page theory dump.</p></div></section>
    <section className="catalogue-section wrap"><PlaybookStore items={playbooks} /></section>
    <section className="fit-section wrap"><h2>Built for real weeks, not ideal ones.</h2><div className="fit-grid"><div><strong>Start small</strong><p>Every system begins with the smallest useful proof.</p></div><div><strong>Keep ownership</strong><p>AI assists the work. You keep judgment and accountability.</p></div><div><strong>Close the loop</strong><p>Every workflow ends with a review and a next decision.</p></div><div><strong>Use it again</strong><p>Templates are designed to survive beyond one motivated day.</p></div></div></section>
    <section className="signal-section"><div className="wrap signal-grid"><div><p className="signal-kicker">Missing a route?</p><h2>Tell us what keeps getting stuck.</h2><p>We use these answers to decide what deserves a playbook next.</p></div><LeadForm source="playbooks" /></div></section><SiteFooter />
  </main>;
}
