import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[#2ea043] text-[#0d1117] hover:bg-[#3fb950] disabled:cursor-not-allowed disabled:opacity-70",
  secondary: "bg-[#1f6feb] text-[#e6edf3] hover:bg-[#388bfd] disabled:cursor-not-allowed disabled:opacity-70",
  outline:
    "border border-[#2d333b] bg-[#0d1117] text-[#e6edf3] hover:border-[#3fb950] disabled:cursor-not-allowed disabled:opacity-70"
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
