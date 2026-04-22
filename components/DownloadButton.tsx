"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type DownloadButtonProps = {
  markdown: string;
  filename?: string;
};

export function DownloadButton({ markdown, filename = "SKILL.md" }: DownloadButtonProps) {
  const downloadFile = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <Button type="button" onClick={downloadFile}>
      <Download className="h-4 w-4" />
      Download SKILL.md
    </Button>
  );
}
