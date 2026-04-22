import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { ACCESS_COOKIE_MAX_AGE, ACCESS_COOKIE_NAME } from "@/lib/lemonsqueezy";
import { hasPurchased } from "@/lib/purchase-store";

const unlockSchema = z.object({
  email: z.string().email()
});

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = unlockSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Valid purchase email required." }, { status: 422 });
  }

  const purchaseEmail = parsed.data.email.toLowerCase();
  if (purchaseEmail !== session.user.email.toLowerCase()) {
    return NextResponse.json(
      { error: "Purchase email must match the signed-in account email." },
      { status: 403 }
    );
  }

  const purchased = await hasPurchased(purchaseEmail);
  if (!purchased) {
    return NextResponse.json(
      {
        error:
          "No purchase found for this email yet. If checkout was just completed, wait 10-30 seconds for webhook delivery and retry."
      },
      { status: 404 }
    );
  }

  const response = NextResponse.json({ ok: true, unlocked: true });
  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: "1",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_COOKIE_MAX_AGE
  });

  return response;
}
