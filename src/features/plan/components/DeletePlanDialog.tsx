"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConfirmationDialog } from "@/shared/ui/dialog/ConfirmationDialog";
import { Trash2 } from "@/shared/ui/icon/lucide-icons";
import { cn } from "@/shared/utils/cn";

import { usePlannerContext } from "../hooks/PlannerContext";
import { deletePlan } from "../lib/deletePlan";

type DeletePlanDialogProps = {
  className?: string;
};

export function DeletePlanDialog({ className }: DeletePlanDialogProps) {
  const { planId, isOwner } = usePlannerContext();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!isOwner) {
    return null;
  }

  const handleConfirm = async () => {
    if (isPending) {
      return;
    }

    setIsPending(true);
    setError(null);
    try {
      const { redirectTo } = await deletePlan(planId);
      router.push(redirectTo);
    } catch (err) {
      console.error(`Unable to delete plan: planId=${planId}`, err);
      setError("Failed to delete planner. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <ConfirmationDialog
      trigger={
        <button
          type="button"
          aria-label="Delete planner"
          disabled={isPending}
          className={cn(
            "text-foreground hover:bg-muted/60 inline-flex size-8 cursor-pointer items-center justify-center rounded-sm px-2 transition-colors disabled:cursor-not-allowed disabled:opacity-60",
            className
          )}>
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      }
      title="Delete planner"
      description="This will permanently delete this planner and all of its data."
      confirmLabel={isPending ? "Deleting..." : "Delete"}
      onConfirm={handleConfirm}
      isPending={isPending}
      error={error}
    />
  );
}
