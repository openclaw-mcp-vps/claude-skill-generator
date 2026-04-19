import { NextResponse } from "next/server";
import { storePurchase, verifyLemonSqueezyWebhook } from "@/lib/lemonsqueezy";

export const runtime = "nodejs";

type LemonWebhookBody = {
  meta?: {
    event_name?: string;
  };
  data?: {
    id?: string;
    attributes?: {
      identifier?: string;
      order_number?: number;
      user_name?: string;
      user_email?: string;
      first_order_item?: {
        product_name?: string;
        variant_name?: string;
      };
    };
  };
};

function isPurchaseEvent(eventName: string): boolean {
  return ["order_created", "subscription_created", "subscription_resumed", "subscription_payment_success"].includes(
    eventName
  );
}

export async function POST(request: Request) {
  const signature = request.headers.get("x-signature") ?? request.headers.get("X-Signature");
  const rawBody = await request.text();

  if (!verifyLemonSqueezyWebhook(rawBody, signature)) {
    return NextResponse.json({ received: false, error: "Invalid signature." }, { status: 401 });
  }

  try {
    const body = JSON.parse(rawBody) as LemonWebhookBody;
    const eventName = body.meta?.event_name ?? "";

    if (!isPurchaseEvent(eventName)) {
      return NextResponse.json({ received: true, ignored: true });
    }

    const attributes = body.data?.attributes;
    const firstOrderItem = attributes?.first_order_item;

    const customerEmail = attributes?.user_email?.trim().toLowerCase() || "";
    const orderId = attributes?.identifier || String(attributes?.order_number || body.data?.id || "");

    if (!customerEmail || !orderId) {
      return NextResponse.json({ received: false, error: "Missing order information." }, { status: 400 });
    }

    await storePurchase({
      orderId,
      customerEmail,
      customerName: attributes?.user_name || "",
      productName: firstOrderItem?.product_name || "",
      variantName: firstOrderItem?.variant_name || "",
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ received: false, error: "Malformed webhook payload." }, { status: 400 });
  }
}
