"use client";

import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SkillPreviewProps = {
  markdown: string;
};

export function SkillPreview({ markdown }: SkillPreviewProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Live Preview</CardTitle>
        <CardDescription>Rendered markdown preview of your generated SKILL.md file.</CardDescription>
      </CardHeader>
      <CardContent>
        <article className="prose prose-invert max-w-none prose-pre:overflow-x-auto prose-pre:rounded-md prose-pre:border prose-pre:border-[var(--border)] prose-pre:bg-[#0f1520] prose-code:text-[#8bcbff]">
          <ReactMarkdown>{markdown || "No content yet."}</ReactMarkdown>
        </article>
      </CardContent>
    </Card>
  );
}
