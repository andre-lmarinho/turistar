import { describe, expect, it } from 'vitest';

import { applyPlanEvent } from '@/features/planner/domain/events/planEventReducer';
import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import type { PlanEvent } from '@/features/planner/domain/types/PlanEvent';

const baseDay: DayPlan = {
  id: 'day-1',
  label: 'Day 1',
  position: 'a0',
  activities: [
    { id: 'a-1', title: 'Breakfast', color: 'bg-red', position: 'a0' },
    { id: 'a-3', title: 'Dinner', color: 'bg-blue', position: 'a2' },
  ],
};

describe('planEventReducer', () => {
  it('inserts created activities at the correct ordered position', () => {
    const createdEvent: PlanEvent = {
      id: 'evt-1',
      planId: 'plan-1',
      version: 2,
      type: 'activity.created',
      createdAt: new Date().toISOString(),
      payload: {
        dayId: 'day-1',
        position: 'a1',
        activity: {
          id: 'a-2',
          title: 'Lunch',
          color: 'bg-green',
          position: 'a1',
        },
      },
    };

    const result = applyPlanEvent([baseDay], createdEvent);

    expect(result[0]?.activities.map((activity) => activity.id)).toEqual(['a-1', 'a-2', 'a-3']);
  });
});
