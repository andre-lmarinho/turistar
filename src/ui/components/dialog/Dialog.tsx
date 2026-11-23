"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { useTranslations } from "next-intl";
import type * as React from "react";

import { X } from "@/ui/components/icon";
import { cn } from "@/ui/utils/cn";

const Dialog = DialogPrimitive.Root;

type DialogHeaderProps = {
  title: string;
  description: string;
  visuallyHidden?: boolean;
  closeLabel?: string;
  closeDisabled?: boolean;
  className?: string;
  titleClassName?: string;
  closeButtonClassName?: string;
  descriptionClassName?: string;
  descriptionVisuallyHidden?: boolean;
};

function DialogHeader({
  title,
  description,
  visuallyHidden = false,
  closeLabel,
  closeDisabled = false,
  className,
  titleClassName,
  closeButtonClassName,
  descriptionClassName,
  descriptionVisuallyHidden = true,
}: DialogHeaderProps) {
  const t = useTranslations();
  return (
    <>
      {visuallyHidden ? (
        <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
      ) : (
        <div className={cn("relative flex items-center justify-between border-b px-4 py-3", className)}>
          <div className="min-w-0">
            <DialogPrimitive.Title className={cn("text-lg font-semibold", titleClassName)}>
              {title}
            </DialogPrimitive.Title>
            {!descriptionVisuallyHidden ? (
              <DialogPrimitive.Description className={cn("mt-1 text-sm", descriptionClassName)}>
                {description}
              </DialogPrimitive.Description>
            ) : null}
          </div>
          <DialogPrimitive.Close
            disabled={closeDisabled}
            className={cn(
              "text-muted-foreground hover:bg-interactive-hover hover:text-foreground inline-flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60",
              closeButtonClassName
            )}
            aria-label={closeLabel ?? t("close")}>
            <X className="size-4" aria-hidden="true" />
          </DialogPrimitive.Close>
        </div>
      )}
      {descriptionVisuallyHidden ? (
        <DialogPrimitive.Description className="sr-only">{description}</DialogPrimitive.Description>
      ) : null}
    </>
  );
}

type DialogContentProps = React.HTMLAttributes<HTMLDivElement> & {
  backdropClassName?: string;
};

function DialogContent({ className, backdropClassName, children, ...props }: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop
        className={cn(
          "bg-foreground/80 data-open:animate-in data-closed:animate-out data-open:fade-in data-closed:fade-out fixed inset-0 z-40 backdrop-blur-sm motion-reduce:animate-none",
          backdropClassName
        )}
      />
      <DialogPrimitive.Popup
        className={cn(
          "bg-background text-foreground fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        {...props}>
        {children}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  );
}

type DialogTriggerButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

function DialogTriggerButton({ type = "button", ...props }: DialogTriggerButtonProps) {
  return <DialogPrimitive.Trigger type={type} {...props} />;
}

export { Dialog, DialogContent, DialogHeader, DialogTriggerButton };
