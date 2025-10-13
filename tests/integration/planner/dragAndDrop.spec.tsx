import { renderHook, act } from '@testing-library/react';
import type { DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { useDnDPlanner } from '@/features/planner/hooks/state/dnd/useDnDPlanner';
import type { DayPlan, Activity } from '@/features/planner/domain/types/PlannerEntities';

describe('drag and drop integration', () => {
  function setup(initial?: DayPlan[]) {
    const a1: Activity = { id: 'a1', title: 'A1', color: 'bg-[var(--color-1)]' };
    const a2: Activity = { id: 'a2', title: 'A2', color: 'bg-[var(--color-1)]' };
    const b1: Activity = { id: 'b1', title: 'B1', color: 'bg-[var(--color-1)]' };
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

  it('keeps drag metadata in sync after sequential moves', () => {
    const { result } = setup();
    const startEvent = { active: { id: 'a1' } } as unknown as DragStartEvent;

    act(() => {
      result.current.handleDragStart(startEvent);
      result.current.handleDragOver({
        active: { id: 'a1' },
        over: { id: 'day2' },
      } as Partial<DragOverEvent> as DragOverEvent);
    });

    expect(result.current.days[1].activities.map((a) => a.id)).toEqual(['b1', 'a1']);

    act(() => {
      result.current.handleDragStart(startEvent);
      result.current.handleDragOver({
        active: { id: 'a1' },
        over: { id: 'day1' },
      } as Partial<DragOverEvent> as DragOverEvent);
    });

    expect(result.current.days[0].activities.map((a) => a.id)).toEqual(['a2', 'a1']);
    expect(result.current.days[1].activities.map((a) => a.id)).toEqual(['b1']);
  });
});
