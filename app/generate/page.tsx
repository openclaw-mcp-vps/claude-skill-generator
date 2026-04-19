"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, LoaderCircle, Sparkles } from "lucide-react";
import { UrlInput } from "@/components/UrlInput";
import { SkillEditor } from "@/components/SkillEditor";
import { SkillPreview } from "@/components/SkillPreview";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type GenerateResponse = {
  skillMarkdown: string;
  provider: "anthropic" | "fallback";
  source: {
    url: string;
    title: string;
    hostname: string;
  };
};

export default function GeneratePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState("");
  const [provider, setProvider] = useState<"anthropic" | "fallback" | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");

  const infoLabel = useMemo(() => {
    if (provider === "anthropic") {
      return "Generated with Anthropic Claude";
    }
    if (provider === "fallback") {
      return "Generated with built-in fallback";
    }
    return "Paste docs URL to generate";
  }, [provider]);

  const generateSkill = async (url: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-skill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url })
      });

      const data = (await response.json()) as GenerateResponse | { error?: string };

      if (!response.ok || !("skillMarkdown" in data)) {
        const message = "error" in data && data.error ? data.error : "Failed to generate skill.";
        setError(message);
        return;
      }

      setMarkdown(data.skillMarkdown);
      setProvider(data.provider);
      setSourceUrl(data.source.url);
    } catch {
      setError("Request failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Skill Generator Workspace</h1>
          <p className="text-sm text-[var(--muted)]">Generate, edit, and export install-ready SKILL.md files.</p>
        </div>
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Landing
        </Link>
      </header>

      <UrlInput onGenerate={generateSkill} disabled={loading} initialUrl="https://nextjs.org/docs" />

      <Card>
        <CardContent className="flex items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-2 text-sm">
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span>{infoLabel}</span>
          </div>
          {sourceUrl ? <Badge variant="secondary">Source: {sourceUrl}</Badge> : null}
        </CardContent>
      </Card>

      {error ? (
        <Card className="border-rose-500/40">
          <CardContent className="flex items-center gap-2 p-4 text-sm text-rose-300">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-2 lg:items-start">
        <SkillEditor value={markdown} onChange={setMarkdown} />
        <SkillPreview markdown={markdown} />
      </section>
    </main>
  );
}
