"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Check, Lock, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

declare global {
  interface Window {
    LemonSqueezy?: {
      Url: {
        Open: (url: string) => void;
      };
    };
    createLemonSqueezy?: () => void;
  }
}

const featureList = [
  "Unlimited skill generations",
  "Claude-native SKILL.md frontmatter",
  "Markdown editor + one-click download",
  "Webhook-verified paywall access",
  "Fast generation from docs URLs"
];

type UnlockResponse = {
  unlocked: boolean;
  message: string;
};

export function PricingCard({ checkoutUrl }: { checkoutUrl: string }) {
  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<UnlockResponse | null>(null);

  const hasCheckout = useMemo(() => checkoutUrl.trim().length > 0, [checkoutUrl]);

  const openCheckout = () => {
    if (!hasCheckout) {
      setStatus({
        unlocked: false,
        message:
          "Checkout is not configured yet. Set NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID to your Lemon Squeezy checkout URL or checkout slug."
      });
      return;
    }

    if (typeof window !== "undefined") {
      if (typeof window.createLemonSqueezy === "function") {
        window.createLemonSqueezy();
      }

      if (window.LemonSqueezy?.Url?.Open) {
        window.LemonSqueezy.Url.Open(checkoutUrl);
      } else {
        window.open(checkoutUrl, "_blank", "noopener,noreferrer");
      }
    }
  };

  const unlock = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setStatus(null);

    try {
      const response = await fetch("/api/unlock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, orderId })
      });

      const data = (await response.json()) as UnlockResponse;
      setStatus(data);

      if (response.ok && data.unlocked) {
        window.location.href = "/generate";
      }
    } catch {
      setStatus({ unlocked: false, message: "Unlock request failed. Please try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="relative overflow-hidden border-[#2f81f7]/40 bg-gradient-to-b from-[#161b22] to-[#0f1520]">
      <CardHeader>
        <Badge variant="success" className="w-fit">
          <Rocket className="mr-1 h-3.5 w-3.5" />
          Best For Power Users
        </Badge>
        <CardTitle className="mt-3 text-2xl">Claude Skill Generator Pro</CardTitle>
        <CardDescription>Create as many production-ready skills as you want for one flat monthly price.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-4xl font-bold">
          $9<span className="text-base font-medium text-[var(--muted)]">/mo</span>
        </div>
        <ul className="space-y-2 text-sm text-[var(--foreground)]">
          {featureList.map((feature) => (
            <li className="flex items-start gap-2" key={feature}>
              <Check className="mt-0.5 h-4 w-4 text-[var(--success)]" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button className="w-full" size="lg" onClick={openCheckout}>
          Unlock With Lemon Squeezy
        </Button>
        <p className="text-xs text-[var(--muted)]">
          After checkout, webhook confirmation unlocks your generator account by purchase email.
        </p>
      </CardContent>
      <CardFooter className="border-t border-[var(--border)] pt-6">
        <form className="w-full space-y-3" onSubmit={unlock}>
          <div className="flex items-center gap-2 text-sm font-medium">
            <Lock className="h-4 w-4" />
            Already Purchased? Unlock Access
          </div>
          <Input
            type="email"
            placeholder="Purchase email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Input
            placeholder="Order ID (optional but recommended)"
            value={orderId}
            onChange={(event) => setOrderId(event.target.value)}
          />
          <Button type="submit" variant="outline" className="w-full" disabled={busy}>
            {busy ? "Verifying..." : "Verify Purchase + Enter App"}
          </Button>
          {status ? <p className={`text-xs ${status.unlocked ? "text-[var(--success)]" : "text-rose-300"}`}>{status.message}</p> : null}
        </form>
      </CardFooter>
    </Card>
  );
}
