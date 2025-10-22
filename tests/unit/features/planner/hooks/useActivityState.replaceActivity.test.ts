import { useState } from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import { useActivityState } from '@/features/planner/hooks/state/dnd/useActivityState';

type ActivityWithMeta = DayPlan['activities'][number] & {
  _optimistic?: boolean;
  _tempId?: string;
};

describe('useActivityState.replaceActivity', () => {
  it('reconciles optimistic activities moved to a different day', () => {
    const initialDays: DayPlan[] = [
      { id: 'day-1', label: 'Day 1', activities: [] },
      { id: 'day-2', label: 'Day 2', activities: [] },
    ];

    const { result } = renderHook(() => {
      const [days, setDays] = useState(initialDays);
      const activityState = useActivityState(setDays);
      return { days, ...activityState };
    });

    act(() => {
      result.current.insertActivityAt('day-1', {
        id: 'temp-1',
        title: 'New activity',
        color: '',
        _optimistic: true,
        _tempId: 'temp-1',
      });
    });

    act(() => {
      result.current.removeActivity('temp-1');
    });

    act(() => {
      result.current.insertActivityAt('day-2', {
        id: 'temp-1',
        title: 'New activity',
        color: '',
        position: '0.5',
        _optimistic: true,
        _tempId: 'temp-1',
      });
    });

    act(() => {
      result.current.replaceActivity('day-1', 'temp-1', {
        id: 'server-1',
        title: 'Museum visit',
        color: '#123456',
        position: 'persisted',
      });
    });

    const [firstDay, secondDay] = result.current.days;

    expect(firstDay.activities).toHaveLength(0);
    expect(secondDay.activities).toHaveLength(1);
    const persisted = secondDay.activities[0] as ActivityWithMeta;

    expect(persisted).toMatchObject({
      id: 'server-1',
      title: 'Museum visit',
      position: 'persisted',
      color: '#123456',
    });
    expect(persisted._optimistic).toBeUndefined();
    expect(persisted._tempId).toBeUndefined();
  });
});
