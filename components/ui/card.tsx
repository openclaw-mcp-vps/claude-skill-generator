import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-[#2d333b] bg-[#161b22]/80 p-6", className)}
      {...props}
    />
  );
}
