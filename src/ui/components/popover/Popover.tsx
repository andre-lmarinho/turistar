"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { useTranslations } from "next-intl";
import * as React from "react";

import { X } from "@/ui/components/icon";
import { cn } from "@/ui/utils/cn";

const Popover = PopoverPrimitive.Root;

type PopoverContentProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
};

function PopoverContent({
  className,
  title,
  children,
  align = "center",
  side = "bottom",
  sideOffset = 4,
  ...props
}: PopoverContentProps) {
  const t = useTranslations();
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        side={side}
        sideOffset={sideOffset}
        positionMethod="fixed"
        collisionPadding={16}
        className="z-60">
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            "bg-background text-popover-foreground data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--available-height) max-w-(--available-width) origin-(--transform-origin) overflow-y-auto rounded-md border shadow-md outline-hidden motion-reduce:animate-none",
            className
          )}
          {...props}>
          {title ? (
            <div className="relative flex items-center justify-end p-2">
              <h2 className="absolute inset-0 p-3 text-center text-sm font-medium">{title}</h2>
              <PopoverPrimitive.Close
                className="text-muted-foreground hover:bg-muted/60 hover:text-foreground z-10 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md p-2 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={t("close")}>
                <X className="size-4" aria-hidden="true" />
              </PopoverPrimitive.Close>
            </div>
          ) : null}
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

type PopoverTriggerButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const PopoverTriggerButton = React.forwardRef<HTMLButtonElement, PopoverTriggerButtonProps>(
  function PopoverTriggerButton({ type = "button", ...props }, ref) {
    return <PopoverPrimitive.Trigger ref={ref} type={type} {...props} />;
  }
);

export { Popover, PopoverContent, PopoverTriggerButton };
