import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function SiteHeader({ dark = false }: { dark?: boolean }) {
  return (
    <header className={`inner-header ${dark ? "inner-header-dark" : ""}`}>
      <div className="wrap inner-header-grid">
        <Link className="brand" href="/" aria-label="echoglitch home">
          <span className="brand-mark">e</span><span>echoglitch</span>
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/playbooks">Playbooks</Link><Link href="/blog">Field notes</Link><Link href="/#method">Our method</Link>
        </nav>
        <Link className="nav-cta" href="/playbooks">Start executing <ArrowUpRight size={17} /></Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-main">
        <div>
          <Link className="brand footer-brand" href="/"><span className="brand-mark">e</span><span>echoglitch</span></Link>
          <p>Execution tools for work that deserves to exist.</p>
        </div>
        <div className="footer-links">
          <div><strong>Explore</strong><Link href="/playbooks">Playbooks</Link><Link href="/blog">Field notes</Link><Link href="/#method">Our method</Link></div>
          <div><strong>Policies</strong><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/refunds">Refunds</Link><Link href="/data-policy">Data policy</Link></div>
          <div><strong>Contact</strong><a href="mailto:help@echoglitch.in">help@echoglitch.in</a><Link href="/admin">Admin</Link></div>
        </div>
      </div>
      <div className="wrap footer-bottom"><span>© 2026 echoglitch</span><span>Built in India · Prices include applicable taxes unless stated otherwise.</span></div>
    </footer>
  );
}
