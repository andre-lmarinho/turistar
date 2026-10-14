"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { useTranslations } from "next-intl";
import type { ReactElement } from "react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/ui/components/button/Button";
import { X } from "@/ui/components/icon/lucide-icons";
import { Spinner } from "@/ui/components/loading/Spinner";

type ConfirmationDialogProps = {
  trigger?: ReactElement;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => Promise<void> | void;
  isPending?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  cancelLabel?: string;
  closeLabel?: string;
  pendingLabel?: string;
  errorMessage?: string;
};

function ConfirmationDialog({
  trigger,
  title,
  description,
  confirmLabel,
  onConfirm,
  isPending = false,
  open: controlledOpen,
  onOpenChange,
  cancelLabel,
  closeLabel,
  pendingLabel,
  errorMessage,
}: ConfirmationDialogProps) {
  const t = useTranslations();
  const [internalOpen, setInternalOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const pendingRef = useRef(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const open = controlledOpen ?? internalOpen;
  const busy = isPending || pending;

  useEffect(() => {
    if (open) setFailed(false);
  }, [open]);

  const setOpen = (value: boolean) => {
    setInternalOpen(value);
    onOpenChange?.(value);
    if (value) setFailed(false);
  };
  const handleConfirm = async () => {
    if (pendingRef.current || isPending) return;
    pendingRef.current = true;
    setPending(true);
    setFailed(false);
    try {
      await onConfirm();
      setOpen(false);
    } catch {
      setFailed(true);
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  };

  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(value) => {
        if (!pendingRef.current && !isPending) setOpen(value);
      }}>
      {trigger ? <AlertDialog.Trigger render={trigger} /> : null}
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="bg-background/80 data-open:animate-in data-closed:animate-out data-open:fade-in data-closed:fade-out fixed inset-0 z-40 backdrop-blur-sm motion-reduce:animate-none" />
        <AlertDialog.Popup
          initialFocus={cancelRef}
          className="bg-background text-popover-foreground data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 fixed top-1/2 left-1/2 z-50 w-72 max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-md border p-4 shadow-md outline-hidden motion-reduce:animate-none">
          <div className="flex items-start justify-between gap-3">
            <AlertDialog.Title className="text-sm font-medium">{title}</AlertDialog.Title>
            <AlertDialog.Close
              disabled={busy}
              className="text-muted-foreground hover:bg-interactive-hover hover:text-foreground focus-visible:ring-ring inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={closeLabel ?? t("close")}>
              <X className="size-4" aria-hidden="true" />
            </AlertDialog.Close>
          </div>
          <AlertDialog.Description className="mt-3 text-sm">{description}</AlertDialog.Description>
          {failed ? (
            <p role="alert" className="text-destructive-text mt-3 text-sm">
              {errorMessage ?? t("unexpectedError")}
            </p>
          ) : null}
          <div className="mt-4 flex justify-end gap-2">
            <AlertDialog.Close render={<Button variant="ghost" />} ref={cancelRef} disabled={busy}>
              {cancelLabel ?? t("cancel")}
            </AlertDialog.Close>
            <Button
              className="bg-destructive text-destructive-foreground hover:bg-destructive-hover"
              onClick={handleConfirm}
              aria-disabled={busy}
              aria-busy={busy}>
              {busy ? <Spinner className="size-4" /> : null}
              {confirmLabel}
            </Button>
          </div>
          <p role="status" aria-live="polite" className="sr-only">
            {busy ? (pendingLabel ?? t("working")) : ""}
          </p>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

export { ConfirmationDialog };
