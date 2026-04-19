"use client";

import { useState, type FormEvent } from "react";
import { Globe, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type UrlInputProps = {
  disabled?: boolean;
  initialUrl?: string;
  onGenerate: (url: string) => void;
};

export function UrlInput({ disabled, initialUrl = "", onGenerate }: UrlInputProps) {
  const [url, setUrl] = useState(initialUrl);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!url.trim()) {
      return;
    }
    onGenerate(url.trim());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Globe className="h-5 w-5" />
          Generate From Any Docs URL
        </CardTitle>
        <CardDescription>
          Paste a framework README, migration guide, or API documentation page. You will get a usable SKILL.md file in under two minutes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-3 md:flex-row" onSubmit={handleSubmit}>
          <Input
            aria-label="Documentation URL"
            placeholder="https://docs.example.com/getting-started"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            disabled={disabled}
            required
          />
          <Button type="submit" size="lg" className="md:w-auto" disabled={disabled || !url.trim()}>
            <Sparkles className="mr-2 h-4 w-4" />
            {disabled ? "Generating..." : "Generate Skill"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
