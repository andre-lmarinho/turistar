"use client";

import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/shared/utils/cn";

type SpinnerProps = ComponentPropsWithoutRef<"output">;

export function Spinner({
  className,
  "aria-label": ariaLabel = "Loading",
  "aria-live": ariaLive = "polite",
  ...props
}: SpinnerProps) {
  return (
    <output
      {...props}
      className={cn(
        "border-primary inline-block size-5 animate-spin rounded-full border-2 border-t-transparent",
        className
      )}
      aria-label={ariaLabel}
      aria-live={ariaLive}
    />
  );
}
