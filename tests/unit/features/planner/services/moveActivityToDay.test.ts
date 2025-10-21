import { moveActivityToDay } from '@/features/planner/services/activities/moveActivityToDay';
import type { DayPlan, Activity } from '@/features/planner/domain/types/PlannerEntities';

function buildActivity(id: string): Activity {
  return { id, title: id.toUpperCase(), color: 'bg-[var(--color-1)]' };
}

describe('moveActivityToDay', () => {
  it('moves activity to another day without mutating input', () => {
    const a1 = buildActivity('a1');
    const b1 = buildActivity('b1');
    const days: DayPlan[] = [
      { id: 'd1', label: 'Day 1', activities: [a1] },
      { id: 'd2', label: 'Day 2', activities: [b1] },
    ];
    const snapshot = JSON.parse(JSON.stringify(days));

    const result = moveActivityToDay(days, 'a1', 'd2');

    expect(days).toEqual(snapshot);
    expect(result[0].activities).toHaveLength(0);
    expect(result[1].activities.map((a) => a.id)).toEqual(['b1', 'a1']);
  });
});
