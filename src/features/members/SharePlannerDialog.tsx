"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useState } from "react";

import { LinkSection } from "@/features/shareLink/components/LinkSection";
import { Dialog, DialogContent, DialogHeader, DialogTriggerButton } from "@/shared/ui/dialog";
import { Share2 } from "@/shared/ui/icon";

import { InviteForm } from "./components/InviteForm";
import { MembersSection } from "./components/MembersSection";

export function SharePlannerDialog({ planId }: { planId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTriggerButton
        type="button"
        className="text-foreground hover:bg-muted/60 inline-flex size-8 cursor-pointer items-center justify-center rounded-sm px-2 transition-colors"
        aria-label="Share planner">
        <Share2 className="size-4" aria-hidden="true" />
      </DialogTriggerButton>
      <DialogContent>
        <DialogPrimitive.Title className="sr-only">Share planner</DialogPrimitive.Title>
        <DialogHeader title="Share planner" />
        <div className="max-h-[75vh] space-y-4 overflow-y-auto p-4">
          <InviteForm planId={planId} />
          <LinkSection planId={planId} />
          <MembersSection planId={planId} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
