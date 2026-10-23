import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "secondary" | "outline";
};

export function Badge({ variant = "default", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium",
        variant === "outline" && "border border-slate-300 text-slate-700",
        variant === "secondary" && "bg-white/90 text-slate-800",
        variant === "default" && "bg-slate-900 text-white",
        className
      )}
      {...props}
    />
  );
}
