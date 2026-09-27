import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/ui/utils/cn";

// Decorative only: the animation is aria-hidden, and the loading status is
// announced by the caller (aria-busy on the control, or a sibling live region).
export function Spinner({ className, ...props }: ComponentPropsWithoutRef<"span">) {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={cn(
        "border-primary motion-reduce:animate-none inline-block size-5 animate-spin rounded-full border-2 border-t-transparent",
        className
      )}
    />
  );
}
