// tests/unit/features/planner/services/applyPlannerReorder.test.ts

import { describe, expect, it } from 'vitest';

import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import {
  applyPlannerReorder,
  type PlannerReorderInput,
} from '@/features/planner/services/applyPlannerReorder';

function buildFixture(): DayPlan[] {
  return [
    {
      id: 'day-1',
      label: 'Day 1',
      activities: [
        { id: 'a-1', title: 'One', color: '#fff', position: '1024' },
        { id: 'a-2', title: 'Two', color: '#fff', position: '2048' },
        { id: 'a-3', title: 'Three', color: '#fff', position: '3072' },
      ],
    },
    {
      id: 'day-2',
      label: 'Day 2',
      activities: [
        { id: 'b-1', title: 'Four', color: '#fff', position: '1024' },
      ],
    },
  ];
}

describe('applyPlannerReorder', () => {
  it('moves an activity within the same day and keeps other activities intact', () => {
    const days = buildFixture();

    const result = applyPlannerReorder(days, {
      itemId: 'a-1',
      fromDayId: 'day-1',
      toDayId: 'day-1',
      toIndex: 2,
    });

    expect(result).not.toBeNull();
    const reordered = result!.days[0].activities;
    expect(reordered.map((a) => a.id)).toEqual(['a-2', 'a-3', 'a-1']);
    expect(result!.days[1].activities.map((a) => a.id)).toEqual(['b-1']);
    expect(result!.newPosition).toBeDefined();
  });

  it('moves an activity across days and updates the destination order', () => {
    const days = buildFixture();

    const input: PlannerReorderInput = {
      itemId: 'a-3',
      fromDayId: 'day-1',
      toDayId: 'day-2',
      toIndex: 1,
    };

    const result = applyPlannerReorder(days, input);
    expect(result).not.toBeNull();

    const [dayOne, dayTwo] = result!.days;
    expect(dayOne.activities.map((a) => a.id)).toEqual(['a-1', 'a-2']);
    expect(dayTwo.activities.map((a) => a.id)).toEqual(['b-1', 'a-3']);
    expect(dayTwo.activities[1].position).toBe(result!.newPosition);
  });

  it('returns null when the input references missing entities', () => {
    const days = buildFixture();
    const invalid = applyPlannerReorder(days, {
      itemId: 'missing',
      fromDayId: 'day-1',
      toDayId: 'day-2',
      toIndex: 0,
    });

    expect(invalid).toBeNull();
  });
});

