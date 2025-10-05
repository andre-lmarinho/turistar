// tests/unit/features/planner/services/diffPlanEvents.test.ts

import { describe, expect, it } from 'vitest';

import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import { diffPlanEvents } from '@/features/planner/services/diffPlanEvents';

const baseDay = {
  label: 'Day',
};

describe('diffPlanEvents', () => {
  it('emits a single move when dragging an activity past neighbours with stale positions', () => {
    const previousDays = [
      {
        id: 'day-1',
        ...baseDay,
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
        ...baseDay,
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

  it('emits only a move when transferring an activity between days', () => {
    const previousDays = [
      {
        id: 'day-1',
        ...baseDay,
        position: '1000',
        activities: [{ id: 'activity-a', title: 'A', color: 'red', position: '1000' }],
      },
      {
        id: 'day-2',
        ...baseDay,
        position: '2000',
        activities: [{ id: 'activity-b', title: 'B', color: 'red', position: '2000' }],
      },
    ];

    const nextDays = [
      {
        id: 'day-1',
        ...baseDay,
        position: '1000',
        activities: [],
      },
      {
        id: 'day-2',
        ...baseDay,
        position: '2000',
        activities: [
          { id: 'activity-b', title: 'B', color: 'red' },
          { id: 'activity-a', title: 'A', color: 'red' },
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
        toDayId: 'day-2',
      },
    });
  });

  it('ignores placeholder activities that leak into the next state', () => {
    const previousDays: DayPlan[] = [{ id: 'day-1', ...baseDay, position: '1000', activities: [] }];
    const nextDays: DayPlan[] = [
      {
        id: 'day-1',
        ...baseDay,
        position: '1000',
        activities: [{ id: 'blank-123', title: '', color: 'red', position: undefined }],
      },
    ];

    const events = diffPlanEvents('plan-1', previousDays, nextDays);

    expect(events).toHaveLength(0);
  });

  it('omits non-finite coordinates from emitted activities', () => {
    const previousDays: DayPlan[] = [];
    const nextDays: DayPlan[] = [
      {
        id: 'day-1',
        ...baseDay,
        position: '1000',
        activities: [
          {
            id: 'activity-a',
            title: 'A',
            color: 'red',
            latitude: Number.POSITIVE_INFINITY,
            longitude: Number.NEGATIVE_INFINITY,
          },
        ],
      },
    ];

    const events = diffPlanEvents('plan-1', previousDays, nextDays);

    const createdDay = events.find((event) => event.type === 'day.created');
    expect(createdDay).toBeDefined();
    const activityFromDay = createdDay?.payload.day.activities[0];
    expect(activityFromDay).toBeDefined();
    expect(activityFromDay).not.toHaveProperty('latitude');
    expect(activityFromDay).not.toHaveProperty('longitude');

    const activityCreated = events.find((event) => event.type === 'activity.created');
    expect(activityCreated).toBeDefined();
    expect(activityCreated?.payload.activity).not.toHaveProperty('latitude');
    expect(activityCreated?.payload.activity).not.toHaveProperty('longitude');
  });

  it('drops non-finite coordinates from update patches', () => {
    const previousDays: DayPlan[] = [
      {
        id: 'day-1',
        ...baseDay,
        position: '1000',
        activities: [
          {
            id: 'activity-a',
            title: 'A',
            color: 'red',
            position: '1000',
            latitude: 10,
            longitude: 10,
          },
        ],
      },
    ];

    const nextDays: DayPlan[] = [
      {
        id: 'day-1',
        ...baseDay,
        position: '1000',
        activities: [
          {
            id: 'activity-a',
            title: 'A',
            color: 'red',
            position: '1000',
            latitude: Number.NaN,
            longitude: Number.POSITIVE_INFINITY,
          },
        ],
      },
    ];

    const events = diffPlanEvents('plan-1', previousDays, nextDays);

    const updateEvent = events.find((event) => event.type === 'activity.updated');
    expect(updateEvent).toBeDefined();
    expect(updateEvent?.payload.patch).not.toHaveProperty('latitude');
    expect(updateEvent?.payload.patch).not.toHaveProperty('longitude');
  });
});
