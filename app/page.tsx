import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, Code2, ShieldCheck, Zap } from "lucide-react";
import { PricingCard } from "@/components/PricingCard";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ACCESS_COOKIE_NAME } from "@/lib/auth";
import { getLemonCheckoutUrl } from "@/lib/lemonsqueezy";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "What exactly gets generated?",
    answer:
      "A complete SKILL.md file with YAML frontmatter, a practical workflow, guardrails, and source-specific examples based on the URL you paste."
  },
  {
    question: "How long does one skill take?",
    answer:
      "Typical generation is 20-90 seconds depending on source page size and model latency."
  },
  {
    question: "Can I edit the generated skill?",
    answer: "Yes. You get a full markdown editor plus rendered preview before copying or downloading SKILL.md."
  },
  {
    question: "How does payment unlock work?",
    answer:
      "Lemon Squeezy webhook events are stored server-side. Enter the purchase email and optional order ID to set a secure paid-access cookie."
  }
];

const outcomes = [
  {
    icon: Code2,
    title: "From docs URL to SKILL.md",
    description:
      "Drop in framework docs, CLI references, README pages, or migration guides. The generator extracts the important context and builds a useful skill."
  },
  {
    icon: Zap,
    title: "Faster than hand-writing",
    description:
      "Skip the 30-60 minute manual authoring cycle. Generate, tweak, and install in a fraction of the time."
  },
  {
    icon: ShieldCheck,
    title: "Grounded, production-focused output",
    description:
      "Prompts are tuned for operational guidance: concrete workflows, edge-case guardrails, and examples you can reuse in real projects."
  }
];

type HomePageProps = {
  searchParams?: Promise<{ paywall?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const query = (await searchParams) ?? {};
  const cookieStore = await cookies();
  const unlocked = cookieStore.get(ACCESS_COOKIE_NAME)?.value === "active";
  const checkoutUrl = getLemonCheckoutUrl();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-10 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[radial-gradient(circle_at_top_right,_rgba(47,129,247,0.18),_transparent_45%),linear-gradient(180deg,#161b22_0%,#0d1117_100%)] p-8 sm:p-12">
        <Badge variant="secondary" className="mb-4 w-fit">
          Claude Code Tooling for Power Users
        </Badge>
        <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">
          Claude Skill Generator: paste a docs URL, get an installable `~/.claude/skills/` file.
        </h1>
        <p className="mt-5 max-w-2xl text-base text-[var(--muted)] sm:text-lg">
          If your tool stack is deep, manual skill creation becomes bottlenecked. Turn any official documentation URL into a structured SKILL.md with frontmatter and examples in under two minutes.
        </p>
        {query.paywall === "locked" ? (
          <div className="mt-4 rounded-md border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
            Generator access is paid. Complete checkout, then unlock with your purchase email.
          </div>
        ) : null}
        <div className="mt-7 flex flex-wrap items-center gap-3">
          {unlocked ? (
            <Link href="/generate" className={cn(buttonVariants({ size: "lg" }))}>
              Open Generator
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          ) : (
            <a href="#pricing" className={cn(buttonVariants({ size: "lg" }))}>
              Unlock for $9/mo
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          )}
          <p className="text-sm text-[var(--muted)]">Niche: AI dev tools | Built for Claude Code users</p>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {outcomes.map((item) => (
          <article key={item.title} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
            <item.icon className="h-6 w-6 text-[#58a6ff]" />
            <h2 className="mt-4 text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">{item.description}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 rounded-2xl border border-[var(--border)] bg-[#111822] p-8 lg:grid-cols-2 lg:items-start" id="pricing">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">Stop spending an hour per skill</h2>
          <p className="mt-3 text-[var(--muted)]">
            Most experienced Claude Code users maintain 10-40 internal workflows. Writing each skill manually is expensive and inconsistent. This generator turns your existing documentation into clean, reusable skills quickly.
          </p>
          <Separator className="my-5" />
          <ul className="space-y-2 text-sm text-[var(--foreground)]">
            <li>- Convert docs into repeatable assistant behavior.</li>
            <li>- Keep generated guidance grounded in source material.</li>
            <li>- Edit before install to match team conventions.</li>
            <li>- Enforce paid access with secure cookies.</li>
          </ul>
        </div>
        <PricingCard checkoutUrl={checkoutUrl} />
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8">
        <h2 className="text-2xl font-bold sm:text-3xl">FAQ</h2>
        <div className="mt-6 grid gap-4">
          {faqs.map((item) => (
            <article key={item.question} className="rounded-lg border border-[var(--border)] bg-[#0f1520] p-5">
              <h3 className="text-base font-semibold">{item.question}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
