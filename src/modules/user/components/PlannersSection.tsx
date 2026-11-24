"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { DEFAULT_PLAN_COVER_IMAGE } from "@/features/plan/config";
import type { UserPlannerSummary } from "@/features/plan/repositories/PlanRepository";
import type { CreatePlannerPlanResult } from "@/features/plan/services/PlanService";
import { PlannerCreationForm } from "@/modules/user/components/PlannerCreationForm";
import { Dialog, DialogContent, DialogHeader, DialogTriggerButton } from "@/ui/components/dialog";
import { Plane, Plus } from "@/ui/components/icon";

interface PlannersSectionProps {
  plans: UserPlannerSummary[];
}

function CreateTripDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const t = useTranslations();

  function handlePlanCreated(plan: CreatePlannerPlanResult) {
    setOpen(false);
    router.push(`/p/${plan.planId}`);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!creating) setOpen(nextOpen);
      }}>
      <DialogTriggerButton
        data-testid="create-trip-trigger"
        className="group flex min-h-48 w-full cursor-pointer flex-col items-center justify-center border border-dashed border-folio-ink/35 bg-folio-white p-4 text-center text-folio-ink transition-colors hover:border-folio-coral hover:bg-folio-highlight focus-visible:outline-[3px] focus-visible:outline-folio-coral focus-visible:outline-offset-[3px] motion-reduce:transition-none">
        <span className="flex size-10 items-center justify-center border border-folio-line bg-folio-paper text-folio-coral">
          <Plus className="size-5" aria-hidden="true" />
        </span>
        <span className="mt-3 text-sm font-bold">{t("createTrip")}</span>
        <span className="mt-1 text-xs text-folio-ink-soft">{t("startWithDestination")}</span>
      </DialogTriggerButton>
      <DialogTriggerButton
        className="fixed right-5 bottom-[max(1.25rem,env(safe-area-inset-bottom))] inline-flex size-12 cursor-pointer items-center justify-center border border-folio-ink bg-folio-citron text-folio-ink transition-colors hover:bg-folio-citron-hover focus-visible:outline-[3px] focus-visible:outline-folio-coral focus-visible:outline-offset-[3px] motion-reduce:transition-none sm:right-8 sm:bottom-8"
        aria-label={t("createTrip")}>
        <Plus className="size-5" aria-hidden="true" />
      </DialogTriggerButton>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md border-folio-line bg-folio-paper p-0 text-folio-ink focus-visible:ring-folio-coral">
        <DialogHeader
          title={t("createTrip")}
          description={t("createTripDescription")}
          closeDisabled={creating}
        />
        <div className="p-4">
          <PlannerCreationForm onPlanCreated={handlePlanCreated} onPendingChange={setCreating} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PlannersSection({ plans }: PlannersSectionProps) {
  const t = useTranslations();

  return (
    <section aria-labelledby="trips-heading" className="min-w-0 space-y-4">
      <div className="flex items-center gap-3 border-b border-folio-line pb-3">
        <Plane className="size-5 text-folio-coral" aria-hidden="true" />
        <h2 id="trips-heading" className="font-folio-display text-2xl text-folio-ink">
          {t("yourTrips")}
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {plans.map((plan) => {
          const coverImage = plan.coverImage ?? DEFAULT_PLAN_COVER_IMAGE;
          const backgroundImage = `url("${coverImage.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}")`;

          return (
            <Link
              key={plan.id}
              href={`/p/${plan.id}`}
              className="group relative flex min-h-48 min-w-0 w-full overflow-hidden border border-folio-line bg-folio-ink text-folio-white transition-transform hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-[3px] focus-visible:outline-folio-coral focus-visible:outline-offset-[3px] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage }}
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-linear-to-t from-folio-ink/90 via-folio-ink/15 to-transparent"
              />
              <span className="relative mt-auto min-w-0 p-4">
                <span className="block truncate text-base font-semibold text-folio-white">
                  {plan.destination ?? plan.title}
                </span>
                {plan.destination ? (
                  <span className="mt-1 block truncate text-sm text-folio-white/80">{plan.title}</span>
                ) : null}
              </span>
            </Link>
          );
        })}
        <CreateTripDialog />
      </div>
    </section>
  );
}
