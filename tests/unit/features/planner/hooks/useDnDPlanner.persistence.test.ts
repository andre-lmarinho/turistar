import { renderHook, act } from '@testing-library/react';
import type { DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { describe, expect, it, vi } from 'vitest';

import type { DayPlan, Activity } from '@/features/app/planner/domain/types/PlannerEntities';
import { useDnDPlanner } from '@/features/app/planner/hooks/state/dnd/useDnDPlanner';
import { usePersistedPlannerDays } from '@/features/app/planner/hooks/state/planner/usePersistedPlannerDays';

describe('useDnDPlanner with persistence', () => {
  const a1: Activity = { id: 'a1', title: 'A1', color: 'bg-[var(--color-1)]' };
  const b1: Activity = { id: 'b1', title: 'B1', color: 'bg-[var(--color-1)]' };
  const initial: DayPlan[] = [
    { id: 'day1', label: 'Day 1', activities: [a1] },
    { id: 'day2', label: 'Day 2', activities: [b1] },
  ];

  function setup() {
    const persistSpy = vi.fn().mockResolvedValue(undefined);
    const wrapper = renderHook(() => {
      const planner = useDnDPlanner(initial);
      usePersistedPlannerDays({
        planner,
        persistDays: { mutateAsync: persistSpy, isPending: false },
        persist: false,
      });
      return planner;
    });
    return { persistSpy, ...wrapper };
  }

  it('keeps days length after dragging across columns', () => {
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

    expect(result.current.days).toHaveLength(2);
    expect(result.current.days[0].activities.map((a) => a.id)).toEqual([]);
    expect(result.current.days[1].activities.map((a) => a.id)).toEqual(['b1', 'a1']);
  });

  it('does not clear existing days when stored snapshot is empty', () => {
    const persistSpy = vi.fn().mockResolvedValue(undefined);
    const { result, rerender } = renderHook(
      ({ stored }: { stored: DayPlan[] | undefined }) => {
        const planner = useDnDPlanner(initial);
        usePersistedPlannerDays({
          planner,
          persistDays: { mutateAsync: persistSpy, isPending: false },
          persist: false,
          storedDays: stored,
        });
        return planner.days;
      },
      { initialProps: { stored: undefined as DayPlan[] | undefined } }
    );

    expect(result.current).toHaveLength(2);

    rerender({ stored: [] });

    expect(result.current).toHaveLength(2);
    expect(result.current[0].activities.map((a) => a.id)).toEqual(['a1']);
    expect(result.current[1].activities.map((a) => a.id)).toEqual(['b1']);
  });
});
