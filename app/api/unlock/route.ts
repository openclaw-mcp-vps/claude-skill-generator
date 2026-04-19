import { NextResponse } from "next/server";
import { z } from "zod";
import { attachPaidCookie } from "@/lib/auth";
import { hasPurchased } from "@/lib/lemonsqueezy";

const schema = z.object({
  email: z.string().email("Enter the email used at checkout."),
  orderId: z.string().trim().optional().default("")
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = schema.parse(json);

    const purchased = await hasPurchased(payload.email, payload.orderId || undefined);
    if (!purchased) {
      return NextResponse.json(
        {
          unlocked: false,
          message:
            "No matching purchase found yet. Wait for webhook delivery, then retry with the exact purchase email and order ID."
        },
        { status: 403 }
      );
    }

    const response = NextResponse.json({
      unlocked: true,
      message: "Access unlocked. Redirecting to generator..."
    });

    return attachPaidCookie(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ unlocked: false, message: error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
    }

    return NextResponse.json({ unlocked: false, message: "Unlock failed." }, { status: 500 });
  }
}
