import type { Metadata } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import "./globals.css";

const siteUrl = "https://claude-skill-generator.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Claude Skill Generator",
    template: "%s | Claude Skill Generator"
  },
  description:
    "Paste any docs URL and generate an installable SKILL.md for ~/.claude/skills/ in under two minutes.",
  keywords: [
    "Claude Code",
    "SKILL.md",
    "developer tooling",
    "documentation automation",
    "AI dev tools",
    "Claude skills"
  ],
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Claude Skill Generator",
    description:
      "Generate complete Claude SKILL.md files from any docs URL. Copy, edit, and install in ~/.claude/skills/.",
    siteName: "Claude Skill Generator"
  },
  twitter: {
    card: "summary_large_image",
    title: "Claude Skill Generator",
    description:
      "Paste docs URL. Get production-ready SKILL.md with frontmatter and examples in under two minutes."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0d1117] text-[var(--foreground)] antialiased">
        {children}
        <Script src="https://app.lemonsqueezy.com/js/lemon.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
