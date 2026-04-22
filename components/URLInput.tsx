"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  url: z.string().url("Enter a valid URL (include https://)"),
  goal: z.string().max(280, "Keep goal under 280 characters").optional()
});

type FormValues = z.infer<typeof formSchema>;

type URLInputProps = {
  onGenerated: (result: {
    skill: string;
    title: string;
    sourceUrl: string;
    usedModel: boolean;
  }) => void;
};

export function URLInput({ onGenerated }: URLInputProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      goal: ""
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    setApiError(null);

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });

    const payload = (await response.json()) as
      | {
          skill: string;
          title: string;
          sourceUrl: string;
          usedModel: boolean;
        }
      | { error?: string };

    if (!response.ok) {
      const errorMessage =
        typeof payload === "object" &&
        payload !== null &&
        "error" in payload &&
        typeof payload.error === "string"
          ? payload.error
          : "Failed to generate skill.";
      setApiError(errorMessage);
      return;
    }

    onGenerated(payload as { skill: string; title: string; sourceUrl: string; usedModel: boolean });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-[#2d333b] bg-[#161b22]/80 p-6">
      <label className="block text-sm font-semibold text-[#e6edf3]" htmlFor="url">
        Documentation URL
      </label>
      <Input
        id="url"
        type="url"
        placeholder="https://nextjs.org/docs"
        {...register("url")}
      />
      {errors.url ? <p className="text-sm text-red-400">{errors.url.message}</p> : null}

      <label className="block text-sm font-semibold text-[#e6edf3]" htmlFor="goal">
        Optional focus goal
      </label>
      <Textarea
        id="goal"
        rows={3}
        placeholder="Example: focus on deployment, monitoring, and debugging workflows"
        {...register("goal")}
      />
      {errors.goal ? <p className="text-sm text-red-400">{errors.goal.message}</p> : null}

      {apiError ? <p className="rounded-lg bg-red-950/40 p-3 text-sm text-red-300">{apiError}</p> : null}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Generating skill (usually under 2 minutes)...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate SKILL.md
          </>
        )}
      </Button>
    </form>
  );
}
