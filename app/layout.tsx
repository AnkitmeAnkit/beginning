import type { Metadata } from "next";
import "./globals.css";
import { WebMcpTools } from "@/components/webmcp-tools";

export const metadata: Metadata = {
  metadataBase: new URL("https://echoglitch.in"),
  title: { default: "echoglitch — Execute from day one", template: "%s | echoglitch" },
  description: "Practical productivity playbooks that turn clear decisions into shipped work.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organisation = { "@context": "https://schema.org", "@type": "Organization", name: "echoglitch", url: "https://echoglitch.in", email: "help@echoglitch.in", description: "Practical productivity playbooks for turning clear decisions into shipped work." };
  return (
    <html lang="en">
      <body><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organisation) }} /><WebMcpTools />{children}</body>
    </html>
  );
}
