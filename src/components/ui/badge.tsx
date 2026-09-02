import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold leading-none whitespace-nowrap",
  {
    variants: {
      variant: {
        neutral: "bg-card-sunken text-ink-soft",
        outline: "border border-border-strong text-ink-soft",
        blue: "bg-status-blue-soft text-status-blue",
        green: "bg-status-green-soft text-status-green",
        amber: "bg-status-amber-soft text-status-amber",
        red: "bg-status-red-soft text-status-red",
        purple: "bg-status-purple-soft text-status-purple",
        accent: "bg-accent-soft text-accent-ink",
        onyx: "bg-onyx text-white",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            variant === "blue" && "bg-status-blue",
            variant === "green" && "bg-status-green",
            variant === "amber" && "bg-status-amber",
            variant === "red" && "bg-status-red",
            variant === "purple" && "bg-status-purple",
            variant === "accent" && "bg-accent",
            (!variant || variant === "neutral") && "bg-ink-mute"
          )}
        />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
