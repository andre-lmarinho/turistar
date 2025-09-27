// tests/unit/features/planner/services/diffPlanEvents.test.ts

import { describe, expect, it } from 'vitest';

import { diffPlanEvents } from '@/features/planner/services/diffPlanEvents';

describe('diffPlanEvents', () => {
  it('emits a single move when dragging an activity past neighbours with stale positions', () => {
    const previousDays = [
      {
        id: 'day-1',
        label: 'Day 1',
        position: '1000',
        activities: [
          { id: 'activity-a', title: 'A', color: 'red', position: '1000' },
          { id: 'activity-b', title: 'B', color: 'red', position: '2000' },
          { id: 'activity-c', title: 'C', color: 'red', position: '3000' },
        ],
      },
    ];

    const nextDays = [
      {
        id: 'day-1',
        label: 'Day 1',
        position: '1000',
        activities: [
          { id: 'activity-b', title: 'B', color: 'red', position: '2000' },
          { id: 'activity-c', title: 'C', color: 'red', position: '3000' },
          { id: 'activity-a', title: 'A', color: 'red', position: '1000' },
        ],
      },
    ];

    const events = diffPlanEvents('plan-1', previousDays, nextDays);

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      type: 'activity.moved',
      payload: {
        activityId: 'activity-a',
        fromDayId: 'day-1',
        toDayId: 'day-1',
      },
    });
  });
});
