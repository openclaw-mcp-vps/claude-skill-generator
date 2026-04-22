import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { generateSkillFromUrl } from "@/lib/ai-generator";
import { authOptions } from "@/lib/auth";
import { hasAccessCookie } from "@/lib/lemonsqueezy";
import { generateRequestSchema } from "@/lib/skill-parser";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const cookieStore = await cookies();
  if (!hasAccessCookie(cookieStore)) {
    return NextResponse.json({ error: "Active subscription required." }, { status: 402 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = generateRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  try {
    const result = await generateSkillFromUrl(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
