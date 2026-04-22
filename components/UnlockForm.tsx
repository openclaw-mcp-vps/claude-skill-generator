"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, LoaderCircle, UnlockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type UnlockFormProps = {
  defaultEmail: string;
};

export function UnlockForm({ defaultEmail }: UnlockFormProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/paywall/unlock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const payload = (await response.json()) as { error?: string };

    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to unlock account right now.");
      return;
    }

    setUnlocked(true);
    window.location.reload();
  };

  return (
    <Card>
      <form onSubmit={submit} className="space-y-4">
        <h2 className="text-lg font-semibold text-[#e6edf3]">Unlock your generator</h2>
        <p className="text-sm text-[#9da7b3]">
          Enter the same email used at checkout. Once webhook confirmation is received, access cookie will be set.
        </p>

        <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />

        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        {unlocked ? (
          <p className="inline-flex items-center gap-2 text-sm text-[#3fb950]">
            <CheckCircle2 className="h-4 w-4" />
            Access unlocked.
          </p>
        ) : null}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UnlockKeyhole className="h-4 w-4" />}
          Verify Purchase & Unlock
        </Button>
      </form>
    </Card>
  );
}
