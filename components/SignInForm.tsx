"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { LoaderCircle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      name,
      redirect: false
    });

    setLoading(false);

    if (result?.error) {
      setError("Could not sign in. Use a valid email address.");
      return;
    }

    window.location.reload();
  };

  return (
    <Card>
      <form onSubmit={submit} className="space-y-4">
        <h2 className="text-lg font-semibold text-[#e6edf3]">Sign in to start generating skills</h2>
        <p className="text-sm text-[#9da7b3]">
          Use your work email so purchase unlock can be matched correctly after checkout.
        </p>

        <Input
          type="email"
          required
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          Continue
        </Button>
      </form>
    </Card>
  );
}
