"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import type { FocusEvent } from "react";
import { useEffect, useState } from "react";

import { BudgetBoard } from "@/features/app/planner/components/budget/BudgetBoard";
import { ActivityDialog } from "@/features/app/planner/components/dialog/ActivityDialog";
import { PlannerBoard } from "@/features/app/planner/components/dnd/PlannerBoard";
import { SharePlannerDialog } from "@/features/app/planner/components/share/SharePlannerDialog";
import { ModeToggleButton } from "@/features/app/planner/components/ui/ModeToggleButton";
import type { DayPlan } from "@/features/app/planner/domain/types/PlannerEntities";
import { PlannerProvider, usePlannerContext } from "@/features/app/planner/hooks/PlannerContext";
import { updatePlanTitle } from "@/features/app/planner/server/actions/plans/updatePlanTitle";
import type { Entry } from "@/features/app/planner/types/budget";
import { DateRangePickerIcon } from "@/shared/ui/calendar";

const MapBoard = dynamic(() => import("@/features/app/planner/components/map/MapBoard"), {
  ssr: false,
});

const modeOrder = ["planner", "map", "budget"] as const;
type PlannerMode = (typeof modeOrder)[number];

const offsetMap = [0, 6, 10];
const scaleMap = [1, 0.92, 0.87];
const opacityMap = [1, 0.92, 0.8];

export interface PlannerWorkspaceProps {
  initialDays?: DayPlan[];
  planId: string;
  title: string;
  dest?: string;
  persist?: boolean;
  canEdit?: boolean;
  viewerUserId?: string | null;
  isOwner?: boolean;
  isAdmin?: boolean;
  canManageMembers?: boolean;
  editToken?: string;
  initialBudget?: number;
  initialEntries?: Entry[];
}

type PlannerWorkspaceContentProps = {
  persist: boolean;
  title: string;
  canEdit: boolean;
  editToken?: string;
  initialBudget?: number;
  initialEntries?: Entry[];
};

/**
 * Render the planner workspace UI with switchable "planner", "map", and "budget" modes.
 *
 * Updates the browser tab title to "<title> | Turistar App", allows inline editing of the plan title
 * (and persists the change when `persist`, `canEdit`, and `editToken` are provided), and presents
 * animated stacked panels for each mode with responsive mode toggles.
 *
 * @param persist - If true, title edits are persisted to the server when conditions allow
 * @param title - Initial workspace title shown and edited in the header
 * @param canEdit - Controls whether the title and other editable controls are enabled
 * @param editToken - Token required to authorize persisting title changes
 * @param initialBudget - Initial budget value passed to the BudgetBoard
 * @param initialEntries - Initial budget entries passed to the BudgetBoard
 * @returns The workspace UI element containing header, mode panels, dialogs, and controls
 */
function PlannerWorkspaceContent({
  persist,
  title: initialTitle,
  canEdit,
  editToken,
  initialBudget,
  initialEntries,
}: PlannerWorkspaceContentProps) {
  const [mode, setMode] = useState<PlannerMode>("planner");
  const { planId, currentRange, handleRangeChange, viewerUserId } = usePlannerContext();

  const [title, setTitle] = useState(initialTitle);

  useEffect(() => {
    document.title = `${title} | Turistar App`;
  }, [title]);

  const handleTitleBlur = async () => {
    if (!title.trim()) {
      setTitle(initialTitle);
      return;
    }

    if (persist && canEdit && editToken) {
      await updatePlanTitle(planId, editToken, title.trim());
    }
  };

  const activeIdx = modeOrder.indexOf(mode);

  return (
    <main className="bg-card relative flex flex-1 flex-col overflow-hidden p-4 md:pb-12 lg:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-row justify-between gap-4 pb-4 md:items-center">
        <h1 className="bg-card py-2 relative inline-block min-w-[1ch] flex-none cursor-pointer rounded-md text-3xl font-semibold whitespace-nowrap capitalize hover:bg-[color-mix(in_oklch,var(--card)_75%,var(--card-foreground)_5%)]">
          <span
            aria-hidden="true"
            className="invisible whitespace-pre rounded-md border-2 border-transparent px-2 py-1">
            {title}
          </span>
          <input
            id="planner-title"
            name="title"
            aria-label="Planner title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={handleTitleBlur}
            onFocus={(event: FocusEvent<HTMLInputElement>) => event.target.select()}
            readOnly={!canEdit}
            disabled={!canEdit}
            className="focus:border-border focus:bg-background absolute inset-0 cursor-pointer rounded-md border-2 border-transparent bg-transparent px-2 py-1 transition-colors outline-none focus:cursor-text"
          />
        </h1>
        <div className="flex flex-none items-center gap-1 self-end md:self-end">
          <DateRangePickerIcon value={currentRange} onChange={handleRangeChange} disabled={!canEdit} />
          {viewerUserId ? <SharePlannerDialog planId={planId} /> : null}
          <div className="hidden pl-2 md:inline">
            <ModeToggleButton value={mode} onChange={setMode} />
          </div>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-7xl flex-1 overflow-visible">
        {modeOrder.map((currentMode, idx) => {
          const relativeIndex = idx - activeIdx;
          const distance = Math.abs(relativeIndex);
          const zIndex = modeOrder.length - distance;
          const offset = (offsetMap[distance] ?? 0) * Math.sign(relativeIndex);
          const scale = scaleMap[distance] ?? 0.7;
          const opacity = opacityMap[distance] ?? 0.6;
          const rotateZ = relativeIndex * 2;
          const isActive = relativeIndex === 0;

          const content =
            currentMode === "planner" ? (
              <PlannerBoard />
            ) : currentMode === "budget" ? (
              <BudgetBoard
                initialBudget={initialBudget}
                initialEntries={initialEntries}
                persist={persist}
                canEdit={canEdit}
              />
            ) : (
              <MapBoard />
            );

          return (
            <motion.div
              key={currentMode}
              data-testid={`mode-card-${currentMode}`}
              className={`absolute inset-0 ${!isActive ? "cursor-pointer" : ""}`}
              style={{ zIndex }}
              initial={false}
              animate={{ x: `${offset}%`, scale, opacity, rotateZ }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              onClick={() => !isActive && setMode(currentMode)}>
              <div style={{ pointerEvents: isActive ? "auto" : "none" }} className="h-full">
                {content}
              </div>
            </motion.div>
          );
        })}
      </div>

      <ActivityDialog />

      <div className="flex flex-none items-center gap-2 self-center p-6 md:hidden">
        <ModeToggleButton value={mode} onChange={setMode} />
      </div>
    </main>
  );
}

/**
 * Render the planner workspace wrapped with PlannerProvider and initialized from the given props.
 *
 * The provider supplies planner context (days, range, permissions, etc.) and PlannerWorkspaceContent
 * is mounted with title, editability, and optional budget/entries.
 *
 * @param persist - If true, enables server-side persistence for editable changes (e.g., title updates)
 * @param canEdit - If false, disables in-place editing of the workspace by the current viewer
 * @param viewerUserId - ID of the current viewer; when `null` certain share UI is hidden
 * @param editToken - Optional token required for authenticated edit operations
 * @param initialBudget - Optional initial budget value passed to the budget view
 * @param initialEntries - Optional initial budget entries passed to the budget view
 * @returns The planner workspace React element wrapped in its context provider
 */
export function PlannerWorkspace({
  initialDays,
  planId,
  title,
  dest,
  persist = true,
  canEdit = true,
  viewerUserId = null,
  isOwner = false,
  isAdmin = false,
  canManageMembers = false,
  editToken,
  initialBudget,
  initialEntries,
}: PlannerWorkspaceProps) {
  return (
    <PlannerProvider
      initialDays={initialDays}
      planId={planId}
      dest={dest}
      persist={persist}
      canEdit={canEdit}
      viewerUserId={viewerUserId}
      isOwner={isOwner}
      isAdmin={isAdmin}
      canManageMembers={canManageMembers}>
      <PlannerWorkspaceContent
        persist={persist}
        title={title}
        canEdit={canEdit}
        editToken={editToken}
        initialBudget={initialBudget}
        initialEntries={initialEntries}
      />
    </PlannerProvider>
  );
}