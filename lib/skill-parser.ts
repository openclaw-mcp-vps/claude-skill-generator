import { z } from "zod";

const frontmatterSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(12),
  source_url: z.string().url().optional(),
  generated_at: z.string().optional(),
  confidence: z.string().optional()
});

export const generateRequestSchema = z.object({
  url: z.string().url(),
  goal: z.string().trim().max(280).optional()
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;

export type ParsedSkill = {
  frontmatter: z.infer<typeof frontmatterSchema>;
  markdown: string;
};

function parseFrontmatter(markdown: string): Record<string, string> {
  const match = markdown.match(/^---\n([\s\S]+?)\n---\n?/);
  if (!match) {
    throw new Error("Generated output is missing YAML frontmatter.");
  }

  const map: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const index = line.indexOf(":");
    if (index === -1) {
      continue;
    }
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim().replace(/^"|"$/g, "");
    if (key.length > 0 && value.length > 0) {
      map[key] = value;
    }
  }

  return map;
}

export function parseSkillMarkdown(markdown: string): ParsedSkill {
  const frontmatterRaw = parseFrontmatter(markdown);
  const frontmatter = frontmatterSchema.parse(frontmatterRaw);

  if (!markdown.includes("## Primary Workflows")) {
    throw new Error("Generated skill must include a '## Primary Workflows' section.");
  }

  if (!markdown.includes("## Examples")) {
    throw new Error("Generated skill must include a '## Examples' section.");
  }

  return {
    frontmatter,
    markdown
  };
}

export function buildDeterministicSkill(params: {
  url: string;
  title: string;
  extractedText: string;
  goal?: string;
}): string {
  const { url, title, extractedText, goal } = params;
  const condensed = extractedText
    .replace(/\s+/g, " ")
    .split(".")
    .slice(0, 8)
    .join(".")
    .trim();

  const safeName = `${title} Skill`
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return `---
name: "${safeName}"
description: "Operational guide for using ${title} effectively in Claude Code workflows."
source_url: "${url}"
generated_at: "${new Date().toISOString()}"
confidence: "fallback"
---
# ${title} Skill

## Purpose
This skill helps Claude Code solve day-to-day engineering tasks involving ${title}. It is optimized for fast execution, practical commands, and reliable delivery.

## Scope
- Use this skill when requests involve APIs, setup, debugging, migration, or performance work in ${title}.
- Prefer direct documentation-backed steps and avoid speculative behavior.
- If user intent conflicts with documentation, raise the conflict and propose the safest path.

## Knowledge Snapshot
${condensed || "Source documentation was readable but sparse. Use examples and known conventions from the referenced docs URL."}

## Primary Workflows
1. Identify the user's target outcome and the exact ${title} feature involved.
2. Confirm prerequisites (runtime versions, required packages, environment variables).
3. Implement the smallest working change first, then expand.
4. Validate behavior with a concrete command and expected output.
5. Document operational caveats and rollback instructions when risk exists.

## Examples
### Example 1: New Implementation
User: "Set up a minimal ${title} flow for our existing project."
Assistant behavior:
- Inspect current project structure and version constraints.
- Add only required dependencies and integration code.
- Provide the exact commands and file edits.
- Run checks and summarize observable results.

### Example 2: Production Bug Triage
User: "Our ${title} integration fails in production with intermittent errors."
Assistant behavior:
- Reproduce with logs or targeted diagnostics.
- Isolate environment-specific misconfiguration.
- Patch with minimal blast radius.
- Add a verification step and monitoring recommendation.

## Output Standards
- Return executable instructions with concrete file paths and commands.
- Explicitly call out assumptions.
- Prefer deterministic fixes over exploratory suggestions.
${goal ? `- User goal emphasis: ${goal}` : ""}
`;
}
