import { describe, expect, it } from 'vitest';

import { applyPlanEvent } from '@/features/planner/domain/events/planEventReducer';
import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import type { PlanEvent } from '@/features/planner/domain/types/PlanEvent';

const baseDay: DayPlan = {
  id: 'day-1',
  label: 'Day 1',
  position: '1024',
  activities: [
    { id: 'a-1', title: 'Breakfast', color: 'bg-red', position: '1024' },
    { id: 'a-3', title: 'Dinner', color: 'bg-blue', position: '3072' },
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
        position: '2048',
        activity: {
          id: 'a-2',
          title: 'Lunch',
          color: 'bg-green',
          position: '2048',
        },
      },
    };

    const result = applyPlanEvent([baseDay], createdEvent);

    expect(result[0]?.activities.map((activity) => activity.id)).toEqual(['a-1', 'a-2', 'a-3']);
  });

  it('inserts created days using numeric ordering', () => {
    const existingDays: DayPlan[] = [
      { id: 'day-early', label: 'Arrival', position: '512', activities: [] },
      { id: 'day-late', label: 'Departure', position: '2048', activities: [] },
    ];

    const createdDayEvent: PlanEvent = {
      id: 'evt-2',
      planId: 'plan-1',
      version: 3,
      type: 'day.created',
      createdAt: new Date().toISOString(),
      payload: {
        day: {
          id: 'day-mid',
          label: 'City tour',
          position: '1024',
          activities: [],
        },
      },
    };

    const result = applyPlanEvent(existingDays, createdDayEvent);

    expect(result.map((day) => day.id)).toEqual(['day-early', 'day-mid', 'day-late']);
  });

  it('reorders days numerically when positions have different digit lengths', () => {
    const existingDays: DayPlan[] = [
      { id: 'day-a', label: 'Arrival', position: '512', activities: [] },
      { id: 'day-b', label: 'Exploration', position: '1024', activities: [] },
      { id: 'day-c', label: 'Departure', position: '2048', activities: [] },
    ];

    const reorderEvent: PlanEvent = {
      id: 'evt-3',
      planId: 'plan-1',
      version: 4,
      type: 'day.reordered',
      createdAt: new Date().toISOString(),
      payload: {
        dayId: 'day-b',
        position: '64',
      },
    };

    const result = applyPlanEvent(existingDays, reorderEvent);

    expect(result.map((day) => day.id)).toEqual(['day-b', 'day-a', 'day-c']);
  });
});
