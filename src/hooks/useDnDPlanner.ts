import {
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { DayPlan } from "@/types/itinerary";
import { useState } from "react";

export function useDnDPlanner(initial: DayPlan[] = []) {
  const [days, setDays] = useState<DayPlan[]>(initial);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function moveCard(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const src = days.find((d) => d.activities.some((a) => a.id === active.id))!;
    const dst =
      days.find((d) => d.id === over.id) ||
      days.find((d) => d.activities.some((a) => a.id === over.id))!;

    const [moved] = src.activities.splice(
      src.activities.findIndex((a) => a.id === active.id),
      1
    );
    const overIdx = dst.activities.findIndex((a) => a.id === over.id);
    overIdx === -1
      ? dst.activities.push(moved)
      : dst.activities.splice(overIdx, 0, moved);

    setDays([...days]);
  }

  return { days, setDays, sensors, moveCard };
}
