import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://claude-skill-generator.dev"),
  title: "Claude Skill Generator | Turn Docs into Installable SKILL.md Files",
  description:
    "Paste any framework docs URL and generate a production-ready Claude SKILL.md with frontmatter, workflows, and examples in under two minutes.",
  openGraph: {
    title: "Claude Skill Generator",
    description:
      "Paste docs URL, get an installable SKILL.md for Claude Code in under two minutes.",
    type: "website",
    url: "https://claude-skill-generator.dev",
    siteName: "Claude Skill Generator"
  },
  twitter: {
    card: "summary_large_image",
    title: "Claude Skill Generator",
    description:
      "Generate Claude SKILL.md files from documentation URLs with frontmatter and examples."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0d1117] text-[#e6edf3] antialiased">{children}</body>
    </html>
  );
}
