import { load } from "cheerio";
import OpenAI from "openai";
import { z } from "zod";
import { buildDeterministicSkill, parseSkillMarkdown } from "@/lib/skill-parser";

const urlSchema = z.string().url();

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  : null;

type ScrapeResult = {
  title: string;
  text: string;
  codeExamples: string;
};

function clip(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function collapse(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

async function scrapeDocumentation(url: string): Promise<ScrapeResult> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "ClaudeSkillGenerator/1.0 (+https://claude-skill-generator.dev)"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch documentation: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const raw = await response.text();

  if (contentType.includes("text/plain") || url.endsWith(".md") || url.includes("raw.githubusercontent.com")) {
    const title = raw.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? new URL(url).hostname;
    return {
      title,
      text: clip(collapse(raw), 12000),
      codeExamples: ""
    };
  }

  const $ = load(raw);
  $("script, style, noscript, footer, nav, aside, svg").remove();

  const title =
    $("h1").first().text().trim() || $("title").first().text().trim() || new URL(url).hostname;

  const rootSelectors = ["main", "article", "#content", ".content", ".markdown-body"];
  let text = "";

  for (const selector of rootSelectors) {
    const candidate = collapse($(selector).first().text());
    if (candidate.length > text.length) {
      text = candidate;
    }
  }

  if (text.length < 400) {
    text = collapse($("body").text());
  }

  const codeExamples = $("pre code")
    .slice(0, 8)
    .map((_, node) => collapse($(node).text()))
    .get()
    .filter(Boolean)
    .join("\n\n");

  return {
    title,
    text: clip(text, 12000),
    codeExamples: clip(codeExamples, 4000)
  };
}

async function generateWithModel(params: {
  url: string;
  title: string;
  text: string;
  codeExamples: string;
  goal?: string;
}): Promise<string> {
  if (!client) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const system = `You generate production-ready Claude Code skill files.
Return markdown only.
Always include valid YAML frontmatter with keys: name, description, source_url, generated_at, confidence.
The body must include sections exactly named: ## Purpose, ## Scope, ## Primary Workflows, ## Examples, ## Safety Rules.
Use concise, concrete instructions that an engineering assistant can execute.`;

  const user = `Build a SKILL.md from this documentation context.

URL: ${params.url}
Title: ${params.title}
Goal: ${params.goal ?? "General implementation and troubleshooting workflows"}

Documentation Summary:
${params.text}

Code Snippets:
${params.codeExamples || "No explicit code snippets found."}

Output must be complete and installable as ~/.claude/skills/<name>/SKILL.md`;

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: system }]
      },
      {
        role: "user",
        content: [{ type: "input_text", text: user }]
      }
    ],
    temperature: 0.3
  });

  const markdown = response.output_text?.trim();
  if (!markdown) {
    throw new Error("Model returned an empty response.");
  }

  return markdown;
}

export async function generateSkillFromUrl(input: { url: string; goal?: string }): Promise<{
  skill: string;
  title: string;
  sourceUrl: string;
  usedModel: boolean;
}> {
  const url = urlSchema.parse(input.url);
  const scraped = await scrapeDocumentation(url);

  let generated: string;
  let usedModel = false;

  try {
    generated = await generateWithModel({
      url,
      title: scraped.title,
      text: scraped.text,
      codeExamples: scraped.codeExamples,
      goal: input.goal
    });
    parseSkillMarkdown(generated);
    usedModel = true;
  } catch {
    generated = buildDeterministicSkill({
      url,
      title: scraped.title,
      extractedText: scraped.text,
      goal: input.goal
    });
    parseSkillMarkdown(generated);
  }

  return {
    skill: generated,
    title: scraped.title,
    sourceUrl: url,
    usedModel
  };
}
