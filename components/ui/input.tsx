import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-xl border border-[#2d333b] bg-[#0d1117] px-4 py-3 text-sm text-[#e6edf3] outline-none transition focus:border-[#2ea043]",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
