import type { ScrapedDocumentation } from "@/lib/scraper";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function titleFromUrl(url: string): string {
  const parsed = new URL(url);
  const host = parsed.hostname.replace(/^www\./, "");
  return host
    .split(".")
    .slice(0, -1)
    .join(" ")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase()) || host;
}

function firstSentence(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  const sentence = clean.match(/[^.!?]+[.!?]/)?.[0] ?? clean;
  return sentence.slice(0, 180);
}

export function ensureFrontmatter(markdown: string, fallbackName: string, fallbackDescription: string): string {
  const trimmed = markdown.trim();
  if (trimmed.startsWith("---")) {
    return `${trimmed}\n`;
  }

  const frontmatter = [
    "---",
    `name: ${slugify(fallbackName) || "generated-skill"}`,
    `description: ${fallbackDescription.replace(/\n+/g, " ")}`,
    "---",
    ""
  ].join("\n");

  return `${frontmatter}${trimmed}\n`;
}

export function createFallbackSkillFromDocs(docs: ScrapedDocumentation): string {
  const displayName = docs.title || titleFromUrl(docs.url);
  const name = slugify(displayName) || "generated-skill";
  const shortDescription = firstSentence(docs.description || `Assistant guidance for ${displayName}.`);
  const useCases = docs.headings.slice(0, 5);
  const references = docs.paragraphs.slice(0, 4);
  const snippets = docs.codeBlocks.slice(0, 3);

  const examples = snippets.length
    ? snippets
        .map((snippet, index) => {
          const firstLine = snippet.split("\n")[0]?.slice(0, 96) || "Command";
          return `### Example ${index + 1}\n\nGoal: Use ${displayName} safely for ${firstLine}.\n\n\`\`\`bash\n${snippet}\n\`\`\``;
        })
        .join("\n\n")
    : [
        `### Example 1\n\nGoal: Configure a new ${displayName} project using official docs.`,
        "### Example 2\n\nGoal: Diagnose a failing setup step by checking the documented prerequisites.",
        "### Example 3\n\nGoal: Ship a minimal production-ready implementation that follows documented best practices."
      ].join("\n\n");

  const workflowSteps = useCases.length
    ? useCases.map((item, index) => `${index + 1}. ${item}`).join("\n")
    : [
        "1. Identify the exact task and required version from the documentation.",
        "2. Apply the recommended setup steps in order.",
        "3. Validate output against documented examples and edge cases."
      ].join("\n");

  const referencesBlock = references.length
    ? references.map((line) => `- ${line}`).join("\n")
    : "- No description text was extractable from the URL.";

  return [
    "---",
    `name: ${name}`,
    `description: ${shortDescription}`,
    `source_url: ${docs.url}`,
    `generated_at: ${new Date().toISOString()}`,
    "---",
    "",
    `# ${displayName} Skill`,
    "",
    "## Purpose",
    `${shortDescription} This skill keeps the assistant grounded in the official source material while executing tasks quickly.`,
    "",
    "## When To Use",
    "- User asks for setup, migration, integration, debugging, or performance guidance tied to this documentation.",
    "- You need commands, flags, or configuration choices that should match official guidance.",
    "- The task has production risk and should avoid outdated community snippets.",
    "",
    "## Workflow",
    workflowSteps,
    "",
    "## Reference Notes",
    referencesBlock,
    "",
    "## Execution Rules",
    "- Prioritize commands and API usage that appear in the source docs.",
    "- Call out version-specific behavior before applying changes.",
    "- If documentation is ambiguous, state assumptions and choose the safest default.",
    "- Include a verification step (tests, build, or runtime check) before finalizing.",
    "",
    "## Examples",
    examples,
    ""
  ].join("\n");
}
