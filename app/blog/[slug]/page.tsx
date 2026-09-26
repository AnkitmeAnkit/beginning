import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { articles } from "@/lib/content";

export function generateStaticParams() { return articles.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const article = articles.find((entry) => entry.slug === slug); return article ? { title: article.title, description: article.dek } : {}; }

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const article = articles.find((entry) => entry.slug === slug); if (!article) notFound();
  return <main><SiteHeader /><article className="article-page wrap"><Link className="back-link" href="/blog"><ArrowLeft size={17} />All field notes</Link><header><p className="article-meta">{article.category} · {article.readTime} · {article.published}</p><h1>{article.title}</h1><p className="article-dek">{article.dek}</p></header><div className="article-body">{article.body.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}</div><aside className="article-cta"><p>Take it into the work.</p><h2>Turn today&apos;s idea into today&apos;s proof.</h2><Link className="button button-primary" href="/playbooks">Explore the playbooks</Link></aside></article><SiteFooter /></main>;
}
