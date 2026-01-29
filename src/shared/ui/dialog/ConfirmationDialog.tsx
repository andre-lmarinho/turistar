"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { useState } from "react";

import { Button } from "@/shared/ui/button/Button";
import { X } from "@/shared/ui/icon/lucide-icons";
import { cn } from "@/shared/utils/cn";

type ConfirmationDialogProps = {
  trigger: ReactNode;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  onConfirm: () => Promise<void> | void;
  isPending?: boolean;
  className?: string;
  confirmButtonClassName?: string;
};

export function ConfirmationDialog({
  trigger,
  title,
  description,
  confirmLabel,
  onConfirm,
  isPending = false,
  className,
  confirmButtonClassName,
}: ConfirmationDialogProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    try {
      await onConfirm();
      setOpen(false);
    } catch {
      // Parent handles error display
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="bg-background/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=closed]:fade-out fixed inset-0 z-40 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className={cn(
            "bg-background text-popover-foreground data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-50 w-72 -translate-x-1/2 -translate-y-1/2 rounded-md border shadow-md outline-hidden",
            className
          )}>
          <div className="relative flex items-center justify-end p-2">
            <DialogPrimitive.Title className="absolute inset-0 p-3 text-center text-sm font-medium">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              className="text-muted-foreground hover:bg-muted/60 hover:text-foreground z-10 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md p-2 transition-colors"
              aria-label="Close">
              <X className="size-4" aria-hidden="true" />
            </DialogPrimitive.Close>
          </div>
          <div className="space-y-3 p-3 text-sm">
            <DialogPrimitive.Description asChild>
              <p className="text-foreground">{description}</p>
            </DialogPrimitive.Description>
            <Button
              className={cn(
                "bg-destructive hover:bg-destructive/70 w-full text-background",
                confirmButtonClassName
              )}
              onClick={handleConfirm}
              disabled={isPending}>
              {confirmLabel}
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export type { ConfirmationDialogProps };
