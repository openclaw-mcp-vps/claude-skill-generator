"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";

type SkillPreviewProps = {
  markdown: string;
  sourceUrl: string;
  title: string;
  usedModel: boolean;
};

export function SkillPreview({ markdown, sourceUrl, title, usedModel }: SkillPreviewProps) {
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const lines = markdown.split("\n").length;
    const chars = markdown.length;
    return { lines, chars };
  }, [markdown]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className="space-y-4 rounded-2xl border border-[#2d333b] bg-[#161b22]/80 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#e6edf3]">Generated Skill Preview</h2>
          <p className="text-sm text-[#9da7b3]">
            Source: <span className="text-[#e6edf3]">{title}</span> · {stats.lines} lines · {stats.chars} chars
          </p>
        </div>
        <button
          type="button"
          onClick={copyToClipboard}
          className="inline-flex items-center gap-2 rounded-lg border border-[#2d333b] bg-[#0d1117] px-3 py-2 text-sm font-medium text-[#e6edf3] transition hover:border-[#3fb950]"
        >
          {copied ? <Check className="h-4 w-4 text-[#3fb950]" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy Markdown"}
        </button>
      </div>

      <div className="rounded-xl border border-[#2d333b] bg-[#0d1117] p-4">
        <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap text-xs leading-6 text-[#c9d1d9]">{markdown}</pre>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-[#9da7b3]">
        <span>{usedModel ? "AI model: OpenAI" : "AI model unavailable: deterministic fallback"}</span>
        <a href={sourceUrl} target="_blank" rel="noreferrer" className="text-[#58a6ff] hover:underline">
          Open source docs
        </a>
      </div>
    </section>
  );
}
