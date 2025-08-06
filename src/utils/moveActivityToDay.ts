// src/utils/moveActivityToDay.ts

import type { DayPlan } from '@/types';
import { cloneDays } from '@/utils';

export function moveActivityToDay(
  days: DayPlan[],
  activityId: string,
  newDayId: string
): DayPlan[] {
  const copy = cloneDays(days);

  let moved: ReturnType<typeof Array.prototype.splice>[0] | undefined;
  let srcIndex = -1;

  for (let i = 0; i < copy.length; i++) {
    const idx = copy[i].activities.findIndex((a) => a.id === activityId);
    if (idx !== -1) {
      srcIndex = i;
      [moved] = copy[i].activities.splice(idx, 1);
      break;
    }
  }

  if (!moved) {
    return days;
  }

  const dstDay = copy.find((d) => d.id === newDayId);
  if (!dstDay) {
    copy[srcIndex].activities.push(moved);
    return days;
  }

  dstDay.activities.push(moved);
  return copy;
}
