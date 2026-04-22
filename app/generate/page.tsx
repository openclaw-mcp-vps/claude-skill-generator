import Link from "next/link";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { GeneratorWorkspace } from "@/components/GeneratorWorkspace";
import { SignInForm } from "@/components/SignInForm";
import { SignOutButton } from "@/components/SignOutButton";
import { UnlockForm } from "@/components/UnlockForm";
import { authOptions } from "@/lib/auth";
import { getPaymentLink, hasAccessCookie } from "@/lib/lemonsqueezy";

export default async function GeneratePage() {
  const session = await getServerSession(authOptions);
  const cookieStore = await cookies();
  const hasAccess = hasAccessCookie(cookieStore);
  const paymentLink = getPaymentLink();

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 pb-16 pt-8 sm:px-6">
      <header className="space-y-4 rounded-2xl border border-[#2d333b] bg-[#161b22]/70 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#e6edf3]">Skill Generator Workspace</h1>
            <p className="mt-2 text-sm text-[#9da7b3]">
              Paste a documentation URL and get a complete SKILL.md tuned for Claude Code execution.
            </p>
          </div>
          {session?.user?.email ? <SignOutButton /> : null}
        </div>

        <div className="rounded-xl border border-[#2d333b] bg-[#0d1117] p-4 text-xs text-[#9da7b3]">
          Access requires authentication and active paid cookie. After Stripe checkout, open <Link className="text-[#58a6ff] hover:underline" href="/success">/success</Link> to unlock.
        </div>
      </header>

      {!session?.user?.email ? (
        <SignInForm />
      ) : hasAccess ? (
        <GeneratorWorkspace />
      ) : (
        <section className="space-y-4 rounded-2xl border border-[#2d333b] bg-[#161b22]/70 p-6">
          <h2 className="text-xl font-semibold text-[#e6edf3]">Subscription Required</h2>
          <p className="text-sm text-[#9da7b3]">
            Buy access through Stripe, then verify your purchase email to set your secure access cookie.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href={paymentLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-xl bg-[#2ea043] px-4 py-3 text-sm font-semibold text-[#0d1117] transition hover:bg-[#3fb950]"
            >
              Buy Access with Stripe
            </a>
            <Link
              href="/success"
              className="inline-flex items-center rounded-xl border border-[#2d333b] bg-[#0d1117] px-4 py-3 text-sm font-semibold text-[#e6edf3] transition hover:border-[#3fb950]"
            >
              I already paid
            </Link>
          </div>

          <UnlockForm defaultEmail={session.user.email} />
        </section>
      )}
    </main>
  );
}
