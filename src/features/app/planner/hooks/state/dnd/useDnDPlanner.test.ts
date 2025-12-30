import { renderHook, act } from '@testing-library/react';

import { useDnDPlanner } from './useDnDPlanner';

import type { DayPlan, Activity } from '@/features/app/planner/domain/types/PlannerEntities';
import type { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';

describe('useDnDPlanner', () => {
  function setup(initial?: DayPlan[]) {
    const a1: Activity = { id: 'a1', title: 'A1', color: 'bg-[var(--color-1)]' };
    const a2: Activity = { id: 'a2', title: 'A2', color: 'bg-[var(--color-1)]' };
    const b1: Activity = { id: 'b1', title: 'B1', color: 'bg-[var(--color-1)]' };

    const initialDays: DayPlan[] = initial ?? [
      { id: 'day1', label: 'Day 1', activities: [a1, a2] },
      { id: 'day2', label: 'Day 2', activities: [b1] },
    ];

    return renderHook(() => useDnDPlanner(initialDays));
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
    } as Partial<DragOverEvent> as DragOverEvent;

    act(() => {
      result.current.handleDragOver(overEvent);
    });

    expect(result.current.days[0].activities.map((a) => a.id)).toEqual(['a2', 'a1']);
  });

  test('handleDragOver moves activity across days', () => {
    const { result } = setup();
    const overEvent = {
      active: { id: 'a1' },
      over: { id: 'day2' },
    } as Partial<DragOverEvent> as DragOverEvent;

    act(() => {
      result.current.handleDragOver(overEvent);
    });

    expect(result.current.days[0].activities.map((a) => a.id)).toEqual(['a2']);
    expect(result.current.days[1].activities.map((a) => a.id)).toEqual(['b1', 'a1']);
  });

  test('moves activity across days via handleDragStart + handleDragOver', () => {
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

  test('keeps drag metadata in sync after sequential moves', () => {
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

  test('handleDragEnd clears activeId', () => {
    const { result } = setup();
    const startEvent = { active: { id: 'a1' } } as unknown as DragStartEvent;

    act(() => {
      result.current.handleDragStart(startEvent);
      result.current.handleDragEnd();
    });

    expect(result.current.activeId).toBeNull();
  });

  test('handleDragEnd reorders when dropping over another activity', () => {
    const { result } = setup();
    const endEvent = {
      active: { id: 'a1' },
      over: { id: 'a2' },
    } as Partial<DragEndEvent> as DragEndEvent;

    act(() => {
      result.current.handleDragEnd(endEvent);
    });

    expect(result.current.days[0].activities.map((a) => a.id)).toEqual(['a2', 'a1']);
  });

  test('handleDragEnd moves activity across days on drop', () => {
    const { result } = setup();
    const endEvent = {
      active: { id: 'a1' },
      over: { id: 'day2' },
    } as Partial<DragEndEvent> as DragEndEvent;

    act(() => {
      result.current.handleDragEnd(endEvent);
    });

    expect(result.current.days[0].activities.map((a) => a.id)).toEqual(['a2']);
    expect(result.current.days[1].activities.map((a) => a.id)).toEqual(['b1', 'a1']);
  });

  test('handleDragEnd falls back to last known target when drop lacks over data', () => {
    const { result } = setup();
    const overEvent = {
      active: { id: 'a1' },
      over: { id: 'day2' },
    } as Partial<DragOverEvent> as DragOverEvent;

    const endEvent = {
      active: { id: 'a1' },
      over: null,
    } as Partial<DragEndEvent> as DragEndEvent;

    act(() => {
      result.current.handleDragOver(overEvent);
      result.current.handleDragEnd(endEvent);
    });

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
