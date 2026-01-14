"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";

import { Share2, X } from "@/shared/ui/icon";

import { ShareInviteForm } from "./ShareInviteForm";
import { ShareLinkSection } from "./ShareLinkSection";
import { ShareMembersSection } from "./ShareMembersSection";

export function SharePlannerDialog({ planId }: { planId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="text-foreground hover:bg-muted/60 inline-flex size-8 cursor-pointer items-center justify-center rounded-sm px-2 transition-colors"
          aria-label="Share planner">
          <Share2 className="size-4" aria-hidden="true" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          data-radix-dialog-overlay=""
          className="bg-background/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=closed]:fade-out fixed inset-0 z-40 backdrop-blur-sm"
        />
        <Dialog.Content className="bg-background text-foreground fixed top-1/2 left-1/2 z-50 w-[96vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border shadow-xl focus:outline-none">
          <div className="border-border flex items-center justify-between border-b px-4 py-3">
            <Dialog.Title className="text-base font-semibold">Share planner</Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="text-muted-foreground hover:bg-muted/60 hover:text-foreground inline-flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors"
                aria-label="Close">
                <X className="size-4" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>
          <div className="max-h-[75vh] space-y-4 overflow-y-auto p-4">
            <ShareInviteForm planId={planId} />
            <ShareLinkSection planId={planId} />
            <ShareMembersSection planId={planId} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
