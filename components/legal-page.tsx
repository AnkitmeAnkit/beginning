import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export type LegalSection = { title: string; paragraphs: string[]; bullets?: string[] };
export function LegalPage({ title, intro, sections }: { title: string; intro: string; sections: LegalSection[] }) {
  return <main><SiteHeader /><article className="legal-page wrap"><header><p className="page-kicker">Last updated 26 September 2026</p><h1>{title}</h1><p>{intro}</p></header><div className="legal-layout"><aside><strong>Policy index</strong><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/refunds">Refunds</Link><Link href="/data-policy">Data policy</Link><Link href="/editorial-policy">Editorial policy</Link></aside><div className="legal-copy">{sections.map((section) => <section key={section.title}><h2>{section.title}</h2>{section.paragraphs.map((text) => <p key={text}>{text}</p>)}{section.bullets && <ul>{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul>}</section>)}<section><h2>Contact</h2><p>Questions, rights requests, complaints, or accessibility needs can be sent to <a href="mailto:help@echoglitch.in">help@echoglitch.in</a>. We aim to acknowledge privacy and payment issues promptly.</p></section></div></div></article><SiteFooter /></main>;
}
