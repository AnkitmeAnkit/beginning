import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LeadForm } from "@/components/lead-form";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { articles } from "@/lib/content";

export const metadata: Metadata = { title: "Field notes", description: "Useful notes on execution, focus, and working with AI." };

export default function BlogPage() {
  return <main><SiteHeader />
    <section className="page-hero notes-hero"><div className="wrap"><p className="page-kicker">Field notes</p><h1>Ideas are cheap. Useful evidence is not.</h1><p>Short, practical essays on focus, execution, and using AI without giving away your judgment.</p></div></section>
    <section className="article-list wrap">{articles.map((article, index) => <article className="article-row" key={article.slug}><span className="article-index">{String(index+1).padStart(2,"0")}</span><div><p className="article-meta">{article.category} · {article.readTime}</p><h2><Link href={`/blog/${article.slug}`}>{article.title}</Link></h2><p>{article.dek}</p></div><Link className="article-open" href={`/blog/${article.slug}`} aria-label={`Read ${article.title}`}><ArrowUpRight /></Link></article>)}</section>
    <section className="signal-section"><div className="wrap signal-grid"><div><p className="signal-kicker">One useful note at a time</p><h2>Join the field list.</h2><p>New essays, launch notes, and practical templates. Sent when there is something worth sending.</p></div><LeadForm source="blog" /></div></section><SiteFooter />
  </main>;
}
