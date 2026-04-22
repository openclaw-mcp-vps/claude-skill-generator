"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button type="button" variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
      <LogOut className="h-4 w-4" />
      Sign out
    </Button>
  );
}
