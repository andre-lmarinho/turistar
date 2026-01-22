"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";

import { X } from "@/shared/ui/icon";
import { cn } from "@/shared/utils/cn";

const Dialog = DialogPrimitive.Root;

type DialogContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>;

const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, DialogContentProps>(
  function DialogContent({ className, children, ...props }, ref) {
    return (
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="bg-background/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=closed]:fade-out fixed inset-0 z-40 backdrop-blur-sm" />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            "bg-background text-foreground fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-xl border shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            className
          )}
          {...props}>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    );
  }
);

DialogContent.displayName = DialogPrimitive.Content.displayName;

type DialogTriggerButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const DialogTriggerButton = React.forwardRef<HTMLButtonElement, DialogTriggerButtonProps>(
  function DialogTriggerButton({ className, type = "button", children, ...props }, ref) {
    return (
      <DialogPrimitive.Trigger asChild>
        <button ref={ref} type={type} className={className} {...props}>
          {children}
        </button>
      </DialogPrimitive.Trigger>
    );
  }
);

type DialogHeaderProps = {
  title: string;
  titleId?: string;
  onClose?: () => void;
  className?: string;
};

function DialogHeader({ title, titleId, onClose, className }: DialogHeaderProps) {
  return (
    <div className={cn("relative flex items-center justify-between border-b px-4 py-3", className)}>
      <DialogPrimitive.Title id={titleId} className="text-lg font-semibold">
        {title}
      </DialogPrimitive.Title>
      <DialogPrimitive.Close
        className="text-muted-foreground hover:bg-muted/60 hover:text-foreground inline-flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors"
        aria-label="Close"
        onClick={onClose}>
        <X className="size-4" aria-hidden="true" />
      </DialogPrimitive.Close>
    </div>
  );
}

export { Dialog, DialogContent, DialogHeader, DialogTriggerButton };
export type { DialogContentProps, DialogTriggerButtonProps, DialogHeaderProps };
