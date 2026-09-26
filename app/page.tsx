import Link from "next/link";
import { ArrowUpRight, Check, Wind } from "lucide-react";
import { LeadForm } from "@/components/lead-form";
import { PlaybookStore } from "@/components/playbook-store";
import { SiteFooter } from "@/components/site-chrome";
import { playbooks } from "@/lib/content";

const moves = [
  ["01", "Choose the outcome", "One concrete finish line, not a longer list."],
  ["02", "Cut the drag", "Remove the decisions and setup that stall the first move."],
  ["03", "Ship the proof", "Close the loop with something visible, useful, and done."],
];

export default function Home() {
  return (
    <main>
      <section className="hero-shell">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/hero-sky.png"
          aria-hidden="true"
        >
          <source src="/hero-motion.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay" aria-hidden="true" />
        <header className="site-header wrap">
          <Link className="brand" href="/" aria-label="echoglitch home">
            <span className="brand-mark">e</span>
            <span>echoglitch</span>
          </Link>
          <nav aria-label="Main navigation">
            <Link href="/playbooks">Playbooks</Link>
            <Link href="/blog">Field notes</Link>
            <Link href="#method">Our method</Link>
          </nav>
          <Link className="nav-cta" href="/playbooks">
            Start executing <ArrowUpRight size={17} />
          </Link>
        </header>

        <div className="hero-content wrap">
          <div className="hero-copy">
            <p className="signal"><Wind size={18} /> Built for forward motion</p>
            <h1>Make progress loud enough to echo.</h1>
            <p className="hero-intro">
              Practical playbooks for people who are done collecting advice and
              ready to turn a clear decision into shipped work.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/playbooks">
                Find your playbook <ArrowUpRight size={19} />
              </Link>
              <Link className="text-link" href="/blog">Read the field notes</Link>
            </div>
            <p className="trust-line"><Check size={16} /> One purchase. Lifetime access. Built for India.</p>
          </div>
        </div>
      </section>

      <section className="method wrap" id="method">
        <div className="section-heading">
          <p>Less productivity theatre. More completed loops.</p>
          <h2>A system that starts where motivation ends.</h2>
        </div>
        <div className="move-grid">
          {moves.map(([number, title, body]) => (
            <article key={number} className="move-card">
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="featured-section">
        <div className="wrap">
          <div className="section-heading section-heading-top">
            <p>Pick the constraint you need to solve now.</p>
            <div><h2>Field-tested ways to get unstuck.</h2><a className="text-link" href="/playbooks">Compare every playbook</a></div>
          </div>
          <PlaybookStore items={playbooks} />
        </div>
      </section>
      <section className="signal-section" id="signal">
        <div className="wrap signal-grid">
          <div><p className="signal-kicker">Keep the channel clear</p><h2>What are you trying to move?</h2><p>Tell us where execution keeps breaking. Your answer shapes the next field note, playbook, or tool we build.</p></div>
          <LeadForm source="home" />
        </div>
      </section>
      <section className="faq-section wrap">
        <div className="section-heading"><p>Plain answers before you buy.</p><h2>What makes a playbook different?</h2></div>
        <div className="faq-grid">
          <details><summary>Is this another productivity ebook?</summary><p>No. Each playbook is organised around decisions, worksheets, and a defined proof of completion. Read only what you need to take the next action.</p></details>
          <details><summary>How are playbooks delivered?</summary><p>Razorpay verifies the payment, then echoglitch sends the PDF and included resources to the email used at checkout.</p></details>
          <details><summary>Can I use the templates for client work?</summary><p>Yes, for your own work and delivery. The licence does not allow reselling or redistributing the original files.</p></details>
          <details><summary>What happens with a pre-order?</summary><p>You lock the listed price and receive a confirmation immediately. The complete files arrive by email on release, with a cancellation option before delivery.</p></details>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
