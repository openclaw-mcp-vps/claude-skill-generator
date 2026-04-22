"use client";

import { useMemo, useState } from "react";
import { DownloadButton } from "@/components/DownloadButton";
import { SkillPreview } from "@/components/SkillPreview";
import { URLInput } from "@/components/URLInput";

type Generated = {
  skill: string;
  title: string;
  sourceUrl: string;
  usedModel: boolean;
};

export function GeneratorWorkspace() {
  const [generated, setGenerated] = useState<Generated | null>(null);

  const filename = useMemo(() => {
    if (!generated) {
      return "SKILL.md";
    }
    const safe = generated.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return `${safe || "generated-skill"}-SKILL.md`;
  }, [generated]);

  return (
    <div className="space-y-6">
      <URLInput onGenerated={setGenerated} />

      {generated ? (
        <>
          <div className="flex items-center justify-end">
            <DownloadButton markdown={generated.skill} filename={filename} />
          </div>
          <SkillPreview
            markdown={generated.skill}
            sourceUrl={generated.sourceUrl}
            title={generated.title}
            usedModel={generated.usedModel}
          />
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#2d333b] bg-[#161b22]/50 p-8 text-sm text-[#9da7b3]">
          Generated output will appear here. The file includes YAML frontmatter plus practical Claude workflows.
        </div>
      )}
    </div>
  );
}
