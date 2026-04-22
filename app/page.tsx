import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, FileCode2, ShieldCheck } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPaymentLink } from "@/lib/lemonsqueezy";

const faqs = [
  {
    q: "How accurate are generated skills?",
    a: "The generator reads the source docs, extracts practical workflows, and outputs strict SKILL.md structure with operational examples. You can edit before installing."
  },
  {
    q: "Can I generate multiple skills from one framework?",
    a: "Yes. Create focused skills for setup, testing, deployment, and debugging from the same doc set to keep Claude responses specialized and reliable."
  },
  {
    q: "How does access control work?",
    a: "Checkout is handled by Stripe Payment Link. After payment webhook confirmation, we set an HttpOnly access cookie so only paid accounts can use generation endpoints."
  },
  {
    q: "Where do I install the output?",
    a: "Copy or download the generated markdown and save as ~/.claude/skills/<skill-name>/SKILL.md on your machine."
  }
];

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const paymentLink = getPaymentLink();

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <header className="mb-16 rounded-2xl border border-[#2d333b] bg-[#161b22]/70 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-[#9da7b3]">ai-dev-tools · $9/month</p>
          <div className="flex items-center gap-3 text-sm text-[#9da7b3]">
            {session?.user?.email ? <span>Signed in: {session.user.email}</span> : <span>Not signed in</span>}
            <Link href="/generate" className="rounded-lg bg-[#2ea043] px-3 py-2 font-semibold text-[#0d1117]">
              Open Generator
            </Link>
          </div>
        </div>

        <div className="mt-8 max-w-3xl space-y-5">
          <h1 className="text-3xl font-bold tracking-tight text-[#e6edf3] sm:text-5xl">
            Claude Skill Generator
            <span className="block text-[#58a6ff]">Paste docs URL, get installable SKILL.md in under 2 minutes.</span>
          </h1>
          <p className="text-base text-[#c9d1d9] sm:text-lg">
            Stop hand-writing skills for every tool in your stack. Turn framework docs into focused Claude Code skills with frontmatter, workflows, and examples ready for ~/.claude/skills/.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 rounded-xl bg-[#2ea043] px-5 py-3 text-sm font-semibold text-[#0d1117] transition hover:bg-[#3fb950]"
            >
              Start Generating
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={paymentLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-xl border border-[#2d333b] bg-[#0d1117] px-5 py-3 text-sm font-semibold text-[#e6edf3] transition hover:border-[#3fb950]"
            >
              Buy Access ($9/mo)
            </a>
          </div>
        </div>
      </header>

      <section className="mb-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#2d333b] bg-[#161b22]/70 p-5">
          <Clock3 className="mb-3 h-5 w-5 text-[#3fb950]" />
          <h3 className="font-semibold text-[#e6edf3]">Problem</h3>
          <p className="mt-2 text-sm text-[#9da7b3]">Manual skill authoring costs 30-60 minutes every time you add a new tool.</p>
        </div>
        <div className="rounded-xl border border-[#2d333b] bg-[#161b22]/70 p-5">
          <FileCode2 className="mb-3 h-5 w-5 text-[#3fb950]" />
          <h3 className="font-semibold text-[#e6edf3]">Solution</h3>
          <p className="mt-2 text-sm text-[#9da7b3]">Paste docs URL and generate complete SKILL.md with examples, workflows, and safety rules.</p>
        </div>
        <div className="rounded-xl border border-[#2d333b] bg-[#161b22]/70 p-5">
          <CheckCircle2 className="mb-3 h-5 w-5 text-[#3fb950]" />
          <h3 className="font-semibold text-[#e6edf3]">Outcome</h3>
          <p className="mt-2 text-sm text-[#9da7b3]">Power users can spin up 20+ high-quality skills from their existing documentation stack.</p>
        </div>
        <div className="rounded-xl border border-[#2d333b] bg-[#161b22]/70 p-5">
          <ShieldCheck className="mb-3 h-5 w-5 text-[#3fb950]" />
          <h3 className="font-semibold text-[#e6edf3]">Access Model</h3>
          <p className="mt-2 text-sm text-[#9da7b3]">Stripe checkout plus cookie-gated generation API prevents unpaid access to the core tool.</p>
        </div>
      </section>

      <section className="mb-14 rounded-2xl border border-[#2d333b] bg-[#161b22]/70 p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-[#e6edf3]">Pricing</h2>
        <p className="mt-3 max-w-2xl text-[#c9d1d9]">
          One plan for Claude Code power users: unlimited skill generation, downloadable SKILL.md files, and rapid iteration as your stack evolves.
        </p>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-6 rounded-xl border border-[#2d333b] bg-[#0d1117] p-6">
          <div>
            <p className="text-sm text-[#9da7b3]">Claude Skill Generator</p>
            <p className="mt-1 text-4xl font-bold text-[#e6edf3]">$9<span className="text-lg text-[#9da7b3]">/month</span></p>
            <ul className="mt-4 space-y-2 text-sm text-[#c9d1d9]">
              <li>Unlimited generated SKILL.md files</li>
              <li>Documentation scraping + AI synthesis</li>
              <li>Copy + download workflow for ~/.claude/skills/</li>
            </ul>
          </div>
          <a
            href={paymentLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#2ea043] px-5 py-3 text-sm font-semibold text-[#0d1117] transition hover:bg-[#3fb950]"
          >
            Subscribe with Stripe
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section className="rounded-2xl border border-[#2d333b] bg-[#161b22]/70 p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-[#e6edf3]">FAQ</h2>
        <div className="mt-6 space-y-4">
          {faqs.map((item) => (
            <article key={item.q} className="rounded-xl border border-[#2d333b] bg-[#0d1117] p-4">
              <h3 className="font-semibold text-[#e6edf3]">{item.q}</h3>
              <p className="mt-2 text-sm text-[#9da7b3]">{item.a}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
