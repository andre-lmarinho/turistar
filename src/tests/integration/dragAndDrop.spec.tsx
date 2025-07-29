// src/tests/integration/dragAndDrop.spec.tsx

import { renderHook, act } from '@testing-library/react';
import type { DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { useDnDPlanner } from '@/hooks/planner/useDnDPlanner';
import type { DayPlan, Activity } from '@/types';

describe('drag and drop integration', () => {
  function setup(initial?: DayPlan[]) {
    const a1: Activity = { id: 'a1', title: 'A1', color: 'red' };
    const a2: Activity = { id: 'a2', title: 'A2', color: 'red' };
    const b1: Activity = { id: 'b1', title: 'B1', color: 'red' };
    const days: DayPlan[] = initial ?? [
      { id: 'day1', label: 'Day 1', activities: [a1, a2] },
      { id: 'day2', label: 'Day 2', activities: [b1] },
    ];
    const { result } = renderHook(() => useDnDPlanner(days));
    return { result };
  }

  it('moves activity across days via drag events', () => {
    const { result } = setup();
    const startEvent = { active: { id: 'a1' } } as unknown as DragStartEvent;
    const overEvent = {
      active: { id: 'a1' },
      over: { id: 'day2' },
    } as Partial<DragOverEvent> as DragOverEvent;

    act(() => {
      result.current.handleDragStart(startEvent);
      result.current.handleDragOver(overEvent);
    });

    expect(result.current.days[0].activities.map((a) => a.id)).toEqual(['a2']);
    expect(result.current.days[1].activities.map((a) => a.id)).toEqual(['b1', 'a1']);
  });
});
