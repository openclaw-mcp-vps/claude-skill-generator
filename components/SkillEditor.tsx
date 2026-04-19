"use client";

import { Download, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SkillEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SkillEditor({ value, onChange }: SkillEditorProps) {
  const copyToClipboard = async () => {
    if (!value.trim()) {
      return;
    }
    await navigator.clipboard.writeText(value);
  };

  const downloadFile = () => {
    if (!value.trim()) {
      return;
    }
    const blob = new Blob([value], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "SKILL.md";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Edit Output</CardTitle>
        <CardDescription>Polish wording, add examples, then copy or download directly into `~/.claude/skills/`.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={24}
          className="font-mono text-xs leading-relaxed"
          placeholder="Generated markdown will appear here"
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={copyToClipboard} disabled={!value.trim()}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Markdown
          </Button>
          <Button type="button" variant="outline" onClick={downloadFile} disabled={!value.trim()}>
            <Download className="mr-2 h-4 w-4" />
            Download SKILL.md
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
