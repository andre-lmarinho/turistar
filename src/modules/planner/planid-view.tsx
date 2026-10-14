"use client";

import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { FocusEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createBlankActivity } from "@/features/activity/lib/placeholders";
import type { Activity, DayPlan } from "@/features/activity/types";
import type { Entry } from "@/features/budget/types";
import type { PlannerExperience } from "@/features/plan/services/PlanService";
import { ActivityDialog } from "@/modules/planner/components/ActivityDialog";
import { DeletePlanDialog } from "@/modules/planner/components/DeletePlanDialog";
import { SharePlannerDialog } from "@/modules/planner/components/SharePlannerDialog";
import { BoardView } from "@/modules/planner/views/BoardView";
import { BudgetView } from "@/modules/planner/views/BudgetView";
import { trpc } from "@/trpc/react";
import { Button } from "@/ui/components/button/Button";
import { DateRangePicker } from "@/ui/components/calendar";
import { Spinner } from "@/ui/components/loading/Spinner";

import type { PlannerMode } from "./components/ModeToggleButton";
import { ModeToggleButton } from "./components/ModeToggleButton";
import { usePlannerDocument } from "./hooks/usePlannerDocument";
import { TripView } from "./views/TripView";

const MapView = dynamic(() => import("@/modules/planner/views/MapView"), {
  ssr: false,
  loading: () => <MapLoading />,
});

function MapLoading() {
  const t = useTranslations();
  return (
    <div className="bg-muted/30 flex h-full items-center justify-center gap-2 rounded-xl" role="status">
      <Spinner className="size-4" />
      <span className="text-muted-foreground text-sm">{t("loadingMap")}</span>
    </div>
  );
}

function PlannerContent({
  title: initialTitle,
  isDemo,
  initialEntries,
  planId,
  initialDays,
  destination,
  viewerUserId,
  isOwner,
  canManageMembers,
}: {
  title: string;
  isDemo: boolean;
  initialEntries?: Entry[];
  planId: string;
  initialDays?: DayPlan[];
  destination?: string;
  viewerUserId: string | null;
  isOwner: boolean;
  canManageMembers: boolean;
}) {
  const [mode, setMode] = useState<PlannerMode>("overview");
  const t = useTranslations();
  const {
    planId: documentPlanId,
    days,
    createActivity,
    updateActivity,
    deleteActivity: removeActivity,
    moveActivity,
    error: syncError,
    retryPending,
    discardPending,
    hasPendingChanges,
    isPending,
    isLoading,
    currentRange,
    handleRangeChange,
    destCoords,
  } = usePlannerDocument({ initialDays, planId, dest: destination, viewerUserId });
  const [selection, setSelection] = useState<{ id: string } | { draft: Activity; dayId: string } | null>(
    null
  );
  const selectedDay =
    selection && "id" in selection
      ? days.find((day) => day.activities.some((activity) => activity.id === selection.id))
      : undefined;
  const selected =
    selection && "id" in selection
      ? selectedDay?.activities.find((activity) => activity.id === selection.id)
      : selection?.draft;
  const selectedDayId = selectedDay?.id ?? (selection && "dayId" in selection ? selection.dayId : "");
  const selectedActivity = useMemo(
    () => (selected ? { ...selected, dayId: selectedDayId } : null),
    [selected, selectedDayId]
  );
  const [hoveredDayId, setHoveredDayId] = useState<string | null>(null);
  const [hoveredActivityId, setHoveredActivityId] = useState<string | null>(null);
  const highlightDay = useCallback((dayId: string | null) => {
    setHoveredDayId(dayId);
    setHoveredActivityId(null);
  }, []);
  const highlightActivity = useCallback((activityId: string | null) => {
    setHoveredActivityId(activityId);
    setHoveredDayId(null);
  }, []);
  const selectActivity = useCallback((activity: Activity) => {
    setSelection({ id: activity.id });
  }, []);
  const save = useCallback(
    (updates: Partial<Activity>) => {
      if (!selectedActivity || !selection) return false;
      if ("draft" in selection) {
        const activity = { ...selection.draft, ...updates };
        if (!activity.title.trim() || !createActivity(selection.dayId, activity)) {
          setSelection({ ...selection, draft: activity });
          return false;
        }
        setSelection({ id: activity.id });
      } else {
        updateActivity(selection.id, updates);
      }
      return true;
    },
    [selectedActivity, selection, createActivity, updateActivity]
  );
  const changeDay = useCallback(
    (toDayId: string) => {
      if (!selection) return;
      if ("draft" in selection) setSelection({ ...selection, dayId: toDayId });
      else moveActivity(selection.id, { toDayId });
    },
    [selection, moveActivity]
  );
  const changePosition = useCallback(
    (index: number) => {
      if (!selectedActivity || !selectedDay) return;
      const remaining = selectedDay.activities.filter((activity) => activity.id !== selectedActivity.id);
      moveActivity(selectedActivity.id, { toDayId: selectedDay.id, beforeActivityId: remaining[index]?.id });
    },
    [selectedActivity, selectedDay, moveActivity]
  );
  const deleteActivity = useCallback(() => {
    if (selection && "id" in selection) removeActivity(selection.id);
    setSelection(null);
  }, [selection, removeActivity]);
  const closeDialog = useCallback(() => setSelection(null), []);
  const [title, setTitle] = useState(initialTitle);
  const savedTitle = useRef(initialTitle);
  const titleRequestPending = useRef(false);
  const [titleSaving, setTitleSaving] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const updateTitleMutation = trpc.viewer.plan.updateTitle.useMutation();

  const handleFallbackAdd = useCallback((dayId: string) => {
    const activity = createBlankActivity();
    setSelection({ draft: activity, dayId });
  }, []);

  useEffect(() => {
    document.title = `${title}${t("turistarAppSuffix")}`;
  }, [title, t]);

  const handleTitleBlur = async () => {
    if (titleRequestPending.current) return;
    const nextTitle = title.trim();
    if (!nextTitle) {
      setTitle(savedTitle.current);
      setTitleError(false);
      return;
    }
    setTitle(nextTitle);
    if (nextTitle === savedTitle.current) return;
    titleRequestPending.current = true;
    setTitleSaving(true);
    setTitleError(false);
    try {
      await updateTitleMutation.mutateAsync({ planId: documentPlanId, title: nextTitle });
      savedTitle.current = nextTitle;
    } catch {
      setTitleError(true);
    } finally {
      titleRequestPending.current = false;
      setTitleSaving(false);
    }
  };

  return (
    <main
      id="main-content"
      className="bg-card relative flex flex-1 flex-col overflow-hidden p-4 md:px-6 md:pb-8 xl:px-8">
      <div className="flex w-full min-w-0 flex-wrap justify-between gap-x-4 gap-y-2 pb-4 md:items-center">
        <h1 className="bg-card relative inline-block min-w-[1ch] max-w-full cursor-pointer rounded-md py-2 text-xl font-semibold whitespace-nowrap hover:bg-interactive-hover">
          <span
            aria-hidden="true"
            className="invisible block truncate whitespace-pre rounded-md border-2 border-transparent px-2 py-1">
            {title}
          </span>
          <input
            id="planner-title"
            name="title"
            aria-label={t("plannerTitleLabel")}
            type="text"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setTitleError(false);
            }}
            onBlur={() => void handleTitleBlur()}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.nativeEvent.isComposing) void handleTitleBlur();
              if (event.key === "Escape") {
                event.preventDefault();
                setTitle(savedTitle.current);
                setTitleError(false);
              }
            }}
            readOnly={titleSaving}
            aria-busy={titleSaving}
            aria-invalid={titleError || undefined}
            aria-describedby={titleError ? "planner-title-error" : undefined}
            onFocus={(event: FocusEvent<HTMLInputElement>) => event.target.select()}
            className="focus-visible:border-border focus-visible:bg-background focus-visible:ring-ring absolute inset-0 min-w-0 cursor-pointer rounded-md border-2 border-transparent bg-transparent px-2 py-1 transition-colors outline-none focus:cursor-text focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
          />
        </h1>
        <div className="ml-auto flex flex-none items-center gap-1 self-end">
          <DateRangePicker iconOnly value={currentRange} onChange={handleRangeChange} />
          <DeletePlanDialog planId={documentPlanId} isOwner={isOwner} isDemo={isDemo} />
          {!isDemo ? (
            <SharePlannerDialog
              planId={documentPlanId}
              canManageMembers={canManageMembers}
              viewerUserId={viewerUserId}
            />
          ) : null}
          <div className="hidden pl-2 xl:inline">
            <ModeToggleButton
              value={mode === "map" ? "overview" : mode}
              onChange={setMode}
              modes={["overview", "kanban", "budget"]}
            />
          </div>
        </div>
      </div>

      {titleSaving ? <output className="sr-only">{t("savingChanges")}</output> : null}
      {titleError ? (
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
          <p id="planner-title-error" role="alert" className="text-destructive-text">
            {t("plannerTitleSaveFailed")}
          </p>
          <Button variant="ghost" onClick={() => void handleTitleBlur()}>
            {t("retry")}
          </Button>
        </div>
      ) : null}

      {syncError ? (
        <div role="alert" className="mb-3 flex flex-wrap items-center gap-3 text-sm">
          <span>{hasPendingChanges ? t("unsyncedChanges") : t("syncFailed")}</span>
          <Button
            type="button"
            variant="ghost"
            disabled={isPending || isLoading}
            aria-busy={isPending || isLoading}
            onClick={() => void retryPending()}
            className="gap-2">
            {isPending || isLoading ? <Spinner className="size-4" /> : null}
            {t("retry")}
          </Button>
          {hasPendingChanges ? (
            <Button
              type="button"
              variant="ghost"
              disabled={isPending || isLoading}
              onClick={() => {
                if (window.confirm(t("discardConfirm"))) {
                  discardPending();
                  setSelection(null);
                }
              }}
              className="underline">
              {t("discardUnsynced")}
            </Button>
          ) : null}
        </div>
      ) : null}
      {!syncError && isPending ? <output className="sr-only">{t("savingChanges")}</output> : null}
      <div className="relative w-full flex-1 overflow-visible">
        {mode === "overview" || mode === "map" ? (
          <div className={`absolute inset-0 z-0 ${mode === "overview" ? "invisible xl:visible" : ""}`}>
            <MapView
              days={days}
              destCoords={destCoords}
              onActivitySelect={selectActivity}
              highlightedDayId={hoveredDayId}
              highlightedActivityId={hoveredActivityId}
              onDayHover={highlightDay}
              className="h-full"
            />
          </div>
        ) : null}
        {mode === "overview" || mode === "map" ? (
          <>
            <div className={`absolute inset-0 z-10 xl:hidden ${mode === "map" ? "hidden" : ""}`}>
              <BoardView
                days={days}
                onActivitySelect={selectActivity}
                onActivityMove={moveActivity}
                onFallbackAdd={handleFallbackAdd}
              />
            </div>
            <div className="pointer-events-none absolute inset-0 z-10 hidden xl:block">
              <TripView
                days={days}
                onActivitySelect={selectActivity}
                onActivityMove={moveActivity}
                onFallbackAdd={handleFallbackAdd}
                onDayHover={highlightDay}
                onActivityHover={highlightActivity}
              />
            </div>
          </>
        ) : mode === "kanban" ? (
          <div className="absolute inset-0">
            <BoardView
              days={days}
              onActivitySelect={selectActivity}
              onActivityMove={moveActivity}
              onFallbackAdd={handleFallbackAdd}
            />
          </div>
        ) : (
          <div className="absolute inset-0">
            <BudgetView planId={documentPlanId} days={days} initialEntries={initialEntries} />
          </div>
        )}
      </div>

      <ActivityDialog
        key={selectedActivity?.id}
        activity={selectedActivity}
        days={days}
        onSave={save}
        onDelete={deleteActivity}
        onClose={closeDialog}
        onDayChange={changeDay}
        onPositionChange={changePosition}
        destCoords={destCoords}
        isDemo={isDemo}
      />

      <div className="flex flex-none items-center gap-2 self-center p-6 xl:hidden">
        <ModeToggleButton
          value={mode === "overview" ? "kanban" : mode}
          onChange={setMode}
          modes={["kanban", "map", "budget"]}
        />
      </div>
    </main>
  );
}

export function PlanIdView({ experience }: { experience: PlannerExperience }) {
  const router = useRouter();
  const search = useSearchParams();
  const title =
    experience.title?.trim() && experience.title.trim() !== experience.slug?.trim()
      ? experience.title
      : experience.destination;

  useEffect(() => {
    if (experience.slug && search.toString()) {
      router.replace(`/p/${experience.slug}`, { scroll: false });
    }
  }, [search, router, experience.slug]);

  return (
    <PlannerContent
      key={experience.planId}
      title={title}
      isDemo={experience.isDemo}
      initialEntries={experience.initialEntries}
      planId={experience.planId}
      initialDays={experience.initialDays}
      destination={experience.destination}
      viewerUserId={experience.viewerUserId}
      isOwner={experience.isOwner}
      canManageMembers={experience.canManageMembers}
    />
  );
}
