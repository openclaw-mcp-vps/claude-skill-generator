import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-[#2d333b] bg-[#0d1117] px-4 py-3 text-sm text-[#e6edf3] outline-none transition focus:border-[#2ea043]",
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
