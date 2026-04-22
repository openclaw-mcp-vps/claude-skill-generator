import { NextResponse } from "next/server";
import { markPurchase } from "@/lib/purchase-store";
import { verifyStripeSignature } from "@/lib/lemonsqueezy";

export const runtime = "nodejs";

type StripeCheckoutSession = {
  id: string;
  customer_email?: string;
  customer_details?: {
    email?: string;
  };
};

type StripeEvent = {
  id: string;
  type: string;
  data: {
    object: StripeCheckoutSession;
  };
};

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET is not configured." }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  const verified = verifyStripeSignature(rawBody, signature, secret);
  if (!verified) {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 401 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(rawBody) as StripeEvent;
  } catch {
    return NextResponse.json({ error: "Invalid event payload." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const email =
      event.data.object.customer_email?.toLowerCase() ||
      event.data.object.customer_details?.email?.toLowerCase();

    if (email) {
      await markPurchase(email, event.id);
    }
  }

  return NextResponse.json({ received: true });
}
