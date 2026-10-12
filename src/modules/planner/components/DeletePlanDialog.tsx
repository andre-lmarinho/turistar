"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { trpc } from "@/trpc/react";
import { ConfirmationDialog } from "@/ui/components/dialog/ConfirmationDialog";
import { Trash2 } from "@/ui/components/icon";
import { cn } from "@/ui/utils/cn";

type DeletePlanDialogProps = {
  className?: string;
  isDemo?: boolean;
  planId: string;
  isOwner: boolean;
};

export function DeletePlanDialog({ className, isDemo = false, planId, isOwner }: DeletePlanDialogProps) {
  const t = useTranslations();
  const deleteMutation = trpc.viewer.plan.delete.useMutation();
  const isPending = deleteMutation.isPending;
  const router = useRouter();

  if (!isOwner || isDemo) {
    return null;
  }

  const handleConfirm = async () => {
    if (isPending) {
      return;
    }

    try {
      const redirectTo = await deleteMutation.mutateAsync({ planId });
      router.push(redirectTo);
    } catch (err) {
      console.error("Unable to delete plan", {
        planId,
        message: err instanceof Error ? err.message : "Unknown error",
      });
      throw err;
    }
  };

  return (
    <ConfirmationDialog
      trigger={
        <button
          type="button"
          aria-label={t("deletePlanner")}
          disabled={isPending}
          className={cn(
            "text-foreground hover:bg-muted/60 focus-visible:ring-ring inline-flex size-11 cursor-pointer items-center justify-center rounded-sm px-2 transition-colors focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60 md:size-8",
            className
          )}>
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      }
      title={t("deletePlanner")}
      description={t("deletePlannerDescription")}
      confirmLabel={t("deleteAction")}
      pendingLabel={t("deleting")}
      cancelLabel={t("cancel")}
      closeLabel={t("close")}
      onConfirm={handleConfirm}
      isPending={isPending}
    />
  );
}
