import { renderHook, act } from '@testing-library/react';
import { useDnDPlanner } from './useDnDPlanner';
import type { DayPlan, Activity } from '@/types/itinerary';
import type { DragOverEvent } from '@dnd-kit/core';

describe('handleDragOver', () => {
  function setup() {
    const a1: Activity = { id: 'a1', title: 'A1', color: 'red' };
    const a2: Activity = { id: 'a2', title: 'A2', color: 'red' };
    const b1: Activity = { id: 'b1', title: 'B1', color: 'red' };

    const initial: DayPlan[] = [
      { id: 'day1', label: 'Day 1', activities: [a1, a2] },
      { id: 'day2', label: 'Day 2', activities: [b1] },
    ];
    const { result } = renderHook(() => useDnDPlanner(initial));
    return { result };
  }

  it('reorders within the same day', () => {
    const { result } = setup();

    const mockEvent: DragOverEvent = {
      active: { id: 'a1' },
      over: { id: 'a2' },
    } as unknown as DragOverEvent;

    act(() => {
      result.current.handleDragOver(mockEvent);
    });

    expect(result.current.days[0].activities.map((a) => a.id)).toEqual(['a2', 'a1']);
  });

  it('moves activity across days', () => {
    const { result } = setup();

    const mockEvent: DragOverEvent = {
      active: { id: 'a1' },
      over: { id: 'day2' },
    } as unknown as DragOverEvent;

    act(() => {
      result.current.handleDragOver(mockEvent);
    });

    expect(result.current.days[0].activities.map((a) => a.id)).toEqual(['a2']);
    expect(result.current.days[1].activities.map((a) => a.id)).toEqual(['b1', 'a1']);
  });
});
