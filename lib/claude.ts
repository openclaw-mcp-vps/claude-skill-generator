import Anthropic from "@anthropic-ai/sdk";
import { createFallbackSkillFromDocs, ensureFrontmatter } from "@/lib/skill-template";
import type { ScrapedDocumentation } from "@/lib/scraper";

const MODEL = "claude-sonnet-4-20250514";

function buildPrompt(docs: ScrapedDocumentation): string {
  return [
    "You are generating an installable SKILL.md file for Claude Code.",
    "Return Markdown only.",
    "The output must start with YAML frontmatter between --- lines.",
    "Include sections: Purpose, When To Use, Workflow, Guardrails, Examples.",
    "Examples must be practical and specific to the source docs.",
    "Avoid generic filler or placeholders.",
    "",
    "Source URL:",
    docs.url,
    "",
    "Source title:",
    docs.title,
    "",
    "Source description:",
    docs.description,
    "",
    "Extracted headings:",
    docs.headings.map((item) => `- ${item}`).join("\n"),
    "",
    "Extracted paragraphs:",
    docs.paragraphs.map((item) => `- ${item}`).join("\n"),
    "",
    "Extracted code snippets:",
    docs.codeBlocks.map((item) => `\`\`\`\n${item}\n\`\`\``).join("\n\n")
  ].join("\n");
}

export async function generateSkillMarkdown(docs: ScrapedDocumentation): Promise<{
  markdown: string;
  provider: "anthropic" | "fallback";
}> {
  const fallback = createFallbackSkillFromDocs(docs);
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return { markdown: fallback, provider: "fallback" };
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      temperature: 0.2,
      system:
        "You write practical Claude Code skills grounded in official docs. Output only final SKILL.md markdown.",
      messages: [
        {
          role: "user",
          content: buildPrompt(docs)
        }
      ]
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    if (!text) {
      return { markdown: fallback, provider: "fallback" };
    }

    const withFrontmatter = ensureFrontmatter(
      text,
      docs.title || docs.hostname,
      docs.description || `Generated skill based on ${docs.url}`
    );

    return { markdown: withFrontmatter, provider: "anthropic" };
  } catch {
    return { markdown: fallback, provider: "fallback" };
  }
}
