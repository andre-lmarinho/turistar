import { formatDay } from "@/features/activity/lib/dayOperations";
import type { DayPlan } from "@/features/activity/types";
import type { PlanOperation } from "../types";
import { applyEvent } from "./eventReducer";
import { midpoint } from "./gapOrdering";

export interface ActivityDestination {
  toDayId: string;
  beforeActivityId?: string;
}

export function moveActivityOperation(
  days: DayPlan[],
  activityId: string,
  { toDayId, beforeActivityId }: ActivityDestination
): PlanOperation[] {
  const source = days.find((day) => day.activities.some((activity) => activity.id === activityId));
  const destination = days.find((day) => day.id === toDayId);
  if (!source || !destination || beforeActivityId === activityId) return [];
  const remaining = destination.activities.filter((activity) => activity.id !== activityId);
  const beforeIndex = remaining.findIndex((activity) => activity.id === beforeActivityId);
  const index = beforeIndex < 0 ? remaining.length : beforeIndex;
  if (source === destination && destination.activities[index]?.id === activityId) return [];
  return [
    {
      type: "activity.moved",
      payload: {
        activityId,
        fromDayId: source.id,
        toDayId,
        position: midpoint(remaining[index - 1]?.position, remaining[index]?.position),
      },
    },
  ];
}

/** Preserve activities by trip-day when shifting dates, or by calendar date when resizing. */
export function changeDateRangeOperations(days: DayPlan[], dates: Date[]): PlanOperation[] {
  if (!dates.length) return [];
  const targets = dates.map(formatDay);
  const targetIds = new Set(targets.map((day) => day.id));
  const operations: PlanOperation[] = [];
  let projected = days;
  const append = (operation: PlanOperation) => {
    operations.push(operation);
    projected = applyEvent(projected, operation);
  };
  for (const [index, target] of targets.entries()) {
    const position = String((index + 1) * 1024);
    if (!days.some((day) => day.id === target.id)) {
      append({ type: "day.created", payload: { day: { ...target, position, activities: [] } } });
    } else {
      append({ type: "day.updated", payload: { dayId: target.id, patch: { label: target.label } } });
      append({ type: "day.reordered", payload: { dayId: target.id, position } });
    }
  }
  // formatDay uses YYYY-MM-DD IDs, whose lexical order matches calendar order.
  // Capture intentions from the original document; apply them against the evolving projection.
  for (const [index, day] of days.entries()) {
    const target =
      days.length === dates.length
        ? targets[index]
        : (targets.find((candidate) => candidate.id === day.id) ??
          (day.id < targets[0].id ? targets[0] : targets[targets.length - 1]));
    if (target.id === day.id) continue;
    const beforeActivityId =
      day.id < targets[0].id
        ? days.find((candidate) => candidate.id === target.id)?.activities[0]?.id
        : undefined;
    for (const activity of day.activities) {
      for (const operation of moveActivityOperation(projected, activity.id, {
        toDayId: target.id,
        beforeActivityId,
      })) {
        append(operation);
      }
    }
  }
  for (const day of days) {
    if (!targetIds.has(day.id)) append({ type: "day.removed", payload: { dayId: day.id } });
  }
  return operations;
}
