import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-2xl border border-line bg-white px-4 py-2 text-sm text-ink placeholder:text-muted-foreground transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand/60 focus-visible:border-sand",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
