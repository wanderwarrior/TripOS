import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex w-full min-h-[88px] rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-muted-foreground transition-all leading-relaxed",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand/60 focus-visible:border-sand",
        "disabled:cursor-not-allowed disabled:opacity-50 resize-y",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
