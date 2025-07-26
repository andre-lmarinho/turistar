// src/hooks/usePlanDaysStorage.test.ts

import { renderHook, act, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { usePlanDaysStorage } from './usePlanDaysStorage';
import type { DayPlan } from '@/types';

function useWrapper(initial: DayPlan[]) {
  const [days, setDays] = useState<DayPlan[]>(initial);
  usePlanDaysStorage('plan1', days, setDays);
  return { days, setDays };
}

beforeEach(() => {
  localStorage.clear();
});

describe('usePlanDaysStorage', () => {
  test('loads days from storage on mount', async () => {
    const stored = JSON.stringify([{ id: 'd1', label: 'Day 1', activities: [] }]);
    localStorage.setItem('days-plan1', stored);
    const { result } = renderHook(() => useWrapper([]));
    await waitFor(() => expect(result.current.days).toHaveLength(1));
  });

  test('saves days on change', async () => {
    const { result } = renderHook(() => useWrapper([]));
    act(() => {
      result.current.setDays([{ id: 'd1', label: 'Day 1', activities: [] }]);
    });
    await waitFor(() =>
      expect(localStorage.getItem('days-plan1')).toBe(
        JSON.stringify([{ id: 'd1', label: 'Day 1', activities: [] }])
      )
    );
  });
});
