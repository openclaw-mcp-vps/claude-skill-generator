import Link from "next/link";
import { getServerSession } from "next-auth";
import { UnlockForm } from "@/components/UnlockForm";
import { authOptions } from "@/lib/auth";

export default async function SuccessPage() {
  const session = await getServerSession(authOptions);

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 pb-16 pt-10 sm:px-6">
      <section className="rounded-2xl border border-[#2d333b] bg-[#161b22]/80 p-6">
        <h1 className="text-2xl font-bold text-[#e6edf3]">Complete Your Access Unlock</h1>
        <p className="mt-3 text-sm text-[#9da7b3]">
          Stripe checkout is complete. Final step: verify the purchase email so this device receives the paid access cookie for the generator.
        </p>
      </section>

      {session?.user?.email ? (
        <UnlockForm defaultEmail={session.user.email} />
      ) : (
        <section className="rounded-2xl border border-[#2d333b] bg-[#161b22]/80 p-6 text-sm text-[#9da7b3]">
          Sign in first, then return here to unlock access.
          <div className="mt-4">
            <Link href="/generate" className="text-[#58a6ff] hover:underline">
              Go to sign in page
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
