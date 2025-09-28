// tests/unit/features/planner/hooks/useDnDPlanner.test.ts

import { renderHook, act } from '@testing-library/react';
import type { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import { useDnDPlanner } from '@/features/planner/hooks/useDnDPlanner';
import type { DayPlan, Activity } from '@/features/planner/domain/types/PlannerEntities';

describe('useDnDPlanner', () => {
  function setup(initial?: DayPlan[]) {
    const a1: Activity = { id: 'a1', title: 'A1', color: 'bg-[var(--color-1)]' };
    const a2: Activity = { id: 'a2', title: 'A2', color: 'bg-[var(--color-1)]' };
    const b1: Activity = { id: 'b1', title: 'B1', color: 'bg-[var(--color-1)]' };
    const initialDays: DayPlan[] = initial ?? [
      { id: 'day1', label: 'Day 1', activities: [a1, a2] },
      { id: 'day2', label: 'Day 2', activities: [b1] },
    ];
    const { result } = renderHook(() => useDnDPlanner(initialDays));
    return { result };
  }

  test('handleDragStart sets activeId', () => {
    const { result } = setup();
    const startEvent = { active: { id: 'a1' } } as unknown as DragStartEvent;

    act(() => {
      result.current.handleDragStart(startEvent);
    });

    expect(result.current.activeId).toBe('a1');
  });

  test('handleDragOver reorders within the same day', () => {
    const { result } = setup();
    const overEvent = {
      active: { id: 'a1' },
      over: { id: 'a2' },
    } as unknown as DragOverEvent;

    act(() => {
      result.current.handleDragOver(overEvent);
    });

    expect(result.current.days[0].activities.map((a) => a.id)).toEqual(['a2', 'a1']);
  });

  test('handleDragOver drops to the end of the same day when moving downward', () => {
    const { result } = setup();
    const overEvent = {
      active: { id: 'a1' },
      over: {
        id: 'day1',
        data: {
          current: {
            sortable: {
              containerId: 'day1',
              index: 3,
            },
          },
        },
      },
    } as unknown as DragOverEvent;

    act(() => {
      result.current.handleDragOver(overEvent);
    });

    expect(result.current.days[0].activities.map((a) => a.id)).toEqual(['a2', 'a1']);
    expect(result.current.days[1].activities.map((a) => a.id)).toEqual(['b1']);
  });

  test('handleDragOver moves activity across days', () => {
    const { result } = setup();
    const overEvent = {
      active: { id: 'a1' },
      over: { id: 'day2' },
    } as unknown as DragOverEvent;

    act(() => {
      result.current.handleDragOver(overEvent);
    });

    expect(result.current.days[0].activities.map((a) => a.id)).toEqual(['a2']);
    expect(result.current.days[1].activities.map((a) => a.id)).toEqual(['b1', 'a1']);
  });

  test('handleDragEnd clears activeId', () => {
    const { result } = setup();
    const startEvent = { active: { id: 'a1' } } as unknown as DragStartEvent;
    const endEvent = { active: { id: 'a1' }, over: null } as unknown as DragEndEvent;

    act(() => {
      result.current.handleDragStart(startEvent);
      result.current.handleDragEnd(endEvent);
    });

    expect(result.current.activeId).toBeNull();
  });

  test('handleDragEnd applies the final drop target', () => {
    const { result } = setup();
    const startEvent = { active: { id: 'a1' } } as unknown as DragStartEvent;
    const endEvent = {
      active: { id: 'a1' },
      over: { id: 'day2' },
    } as unknown as DragEndEvent;

    let updated: DayPlan[] | undefined;
    act(() => {
      result.current.handleDragStart(startEvent);
      updated = result.current.handleDragEnd(endEvent);
    });

    expect(updated?.[0].activities.map((a) => a.id)).toEqual(['a2']);
    expect(updated?.[1].activities.map((a) => a.id)).toEqual(['b1', 'a1']);
    expect(result.current.days[0].activities.map((a) => a.id)).toEqual(['a2']);
    expect(result.current.days[1].activities.map((a) => a.id)).toEqual(['b1', 'a1']);
  });

  test('handleDragEnd keeps indices aligned when dropping lower in the same column', () => {
    const { result } = setup();
    const startEvent = { active: { id: 'a1' } } as unknown as DragStartEvent;
    const endEvent = {
      active: { id: 'a1' },
      over: {
        id: 'day1',
        data: {
          current: {
            sortable: {
              containerId: 'day1',
              index: 3,
            },
          },
        },
      },
    } as unknown as DragEndEvent;

    let updated: DayPlan[] | undefined;
    act(() => {
      result.current.handleDragStart(startEvent);
      updated = result.current.handleDragEnd(endEvent);
    });

    expect(updated?.[0].activities.map((a) => a.id)).toEqual(['a2', 'a1']);
    expect(result.current.days[0].activities.map((a) => a.id)).toEqual(['a2', 'a1']);
    expect(result.current.days[1].activities.map((a) => a.id)).toEqual(['b1']);
  });

  test('handleDragEnd falls back to the last hovered column when over is null', () => {
    const { result } = setup();
    const startEvent = { active: { id: 'a1' } } as unknown as DragStartEvent;
    const overEvent = {
      active: { id: 'a1' },
      over: { id: 'day2' },
    } as unknown as DragOverEvent;
    const endEvent = { active: { id: 'a1' }, over: null } as unknown as DragEndEvent;

    let updated: DayPlan[] | undefined;
    act(() => {
      result.current.handleDragStart(startEvent);
      result.current.handleDragOver(overEvent);
      updated = result.current.handleDragEnd(endEvent);
    });

    expect(updated?.[0].activities.map((a) => a.id)).toEqual(['a2']);
    expect(updated?.[1].activities.map((a) => a.id)).toEqual(['b1', 'a1']);
    expect(result.current.days[0].activities.map((a) => a.id)).toEqual(['a2']);
    expect(result.current.days[1].activities.map((a) => a.id)).toEqual(['b1', 'a1']);
  });

  test('updates days when initialDays changes', () => {
    const first: DayPlan[] = [{ id: 'd1', label: 'Day 1', activities: [] }];
    const second: DayPlan[] = [
      { id: 'd1', label: 'Day 1', activities: [] },
      { id: 'd2', label: 'Day 2', activities: [] },
    ];
    const { result, rerender } = renderHook(({ init }) => useDnDPlanner(init), {
      initialProps: { init: first },
    });

    expect(result.current.days).toEqual(first);
    rerender({ init: second });
    expect(result.current.days).toEqual(second);
  });

  test('ignores empty initialDays updates', () => {
    const first: DayPlan[] = [
      { id: 'd1', label: 'Day 1', activities: [] },
      { id: 'd2', label: 'Day 2', activities: [] },
    ];
    const { result, rerender } = renderHook(({ init }) => useDnDPlanner(init), {
      initialProps: { init: first },
    });

    rerender({ init: [] });
    expect(result.current.days).toEqual(first);
  });
});
