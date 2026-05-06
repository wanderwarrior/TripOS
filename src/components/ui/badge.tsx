import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] transition-colors",
  {
    variants: {
      variant: {
        default: "bg-navy text-ivory",
        outline: "border border-line bg-white text-navy",
        accent: "bg-sand-100 text-sand-800 border border-sand-200",
        muted: "bg-ivory text-muted-foreground border border-line",
        danger: "bg-red-50 text-red-700 border border-red-100",
        success: "bg-emerald-50 text-emerald-700 border border-emerald-100",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  );
}
