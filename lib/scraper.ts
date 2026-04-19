import { load } from "cheerio";

export type ScrapedDocumentation = {
  url: string;
  hostname: string;
  title: string;
  description: string;
  headings: string[];
  paragraphs: string[];
  codeBlocks: string[];
  plainText: string;
};

const MAX_PARAGRAPHS = 24;
const MAX_CODE_BLOCKS = 12;
const MAX_TOTAL_TEXT = 12000;

function squashWhitespace(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

export async function scrapeDocumentation(url: string): Promise<ScrapedDocumentation> {
  const parsedUrl = new URL(url);
  const response = await fetch(url, {
    headers: {
      "User-Agent": "claude-skill-generator/1.0 (+https://claude-skill-generator.app)",
      Accept: "text/html,application/xhtml+xml"
    },
    signal: AbortSignal.timeout(25_000)
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL (${response.status})`);
  }

  const html = await response.text();
  const $ = load(html);

  $("script,style,noscript,nav,footer,header,aside,form,svg").remove();

  const title =
    squashWhitespace($("meta[property='og:title']").attr("content") || "") ||
    squashWhitespace($("title").first().text()) ||
    parsedUrl.hostname;

  const description =
    squashWhitespace($("meta[name='description']").attr("content") || "") ||
    squashWhitespace($("p").first().text()) ||
    "";

  const headingSet = new Set<string>();
  $("main h1, main h2, main h3, article h1, article h2, article h3, h1, h2, h3").each((_, node) => {
    const text = squashWhitespace($(node).text());
    if (text.length >= 4 && text.length <= 120) {
      headingSet.add(text);
    }
  });

  const paragraphSet = new Set<string>();
  $("main p, article p, p, li").each((_, node) => {
    const text = squashWhitespace($(node).text());
    if (text.length >= 48 && text.length <= 420) {
      paragraphSet.add(text);
    }
  });

  const codeSet = new Set<string>();
  $("pre code, code").each((_, node) => {
    const text = $(node).text().trim();
    if (text.length >= 12 && text.length <= 1200) {
      codeSet.add(text);
    }
  });

  const headings = Array.from(headingSet).slice(0, 20);
  const paragraphs = Array.from(paragraphSet).slice(0, MAX_PARAGRAPHS);
  const codeBlocks = Array.from(codeSet).slice(0, MAX_CODE_BLOCKS);

  let plainText = [title, description, ...headings, ...paragraphs, ...codeBlocks].join("\n");
  if (plainText.length > MAX_TOTAL_TEXT) {
    plainText = plainText.slice(0, MAX_TOTAL_TEXT);
  }

  return {
    url,
    hostname: parsedUrl.hostname,
    title,
    description,
    headings,
    paragraphs,
    codeBlocks,
    plainText
  };
}
