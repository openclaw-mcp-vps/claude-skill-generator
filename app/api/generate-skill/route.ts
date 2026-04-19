import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateSkillMarkdown } from "@/lib/claude";
import { scrapeDocumentation } from "@/lib/scraper";
import { hasPaidAccess } from "@/lib/auth";

const requestSchema = z.object({
  url: z.string().url("Provide a valid documentation URL.")
});

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!hasPaidAccess(request)) {
    return NextResponse.json({ error: "Paid access required. Complete checkout before generating skills." }, { status: 402 });
  }

  try {
    const json = await request.json();
    const payload = requestSchema.parse(json);

    const docs = await scrapeDocumentation(payload.url);
    const generated = await generateSkillMarkdown(docs);

    return NextResponse.json({
      skillMarkdown: generated.markdown,
      provider: generated.provider,
      source: {
        url: docs.url,
        title: docs.title,
        hostname: docs.hostname
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
