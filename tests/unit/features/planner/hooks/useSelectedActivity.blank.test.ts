// tests/unit/features/planner/hooks/useSelectedActivity.blank.test.ts

import { useState } from 'react';
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Activity, DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import { useActivityState } from '@/features/planner/hooks/useActivityState';
import { useSelectedActivity } from '@/features/planner/hooks/useSelectedActivity';
import { usePersistedPlannerDays } from '@/features/planner/hooks/usePersistedPlannerDays';
import * as placeholders from '@/features/planner/domain/utils/activityPlaceholders';

function usePlannerHarness(initialDays: DayPlan[], mutateAsync: ReturnType<typeof vi.fn>) {
  const [days, setDays] = useState<DayPlan[]>(initialDays);
  const activityState = useActivityState(setDays);
  const selected = useSelectedActivity(days, setDays, activityState);

  usePersistedPlannerDays({
    planner: { days, setDays },
    persistDays: { mutateAsync, isPending: false },
    storedDays: initialDays,
  });

  return {
    days,
    setDays,
    addBlankAndSelect: selected.addBlankAndSelect,
    closeModal: selected.closeModal,
    setSelectedActivity: selected.setSelectedActivity,
    save: selected.save,
  };
}

describe('useSelectedActivity blank placeholders', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('removes blank placeholders and skips persistence when closing an untouched modal', async () => {
    vi.useFakeTimers();
    const persistSpy = vi.fn().mockResolvedValue(undefined);
    const initialDays: DayPlan[] = [{ id: 'day-1', label: 'Day 1', activities: [] }];

    const { result } = renderHook(() => usePlannerHarness(initialDays, persistSpy));

    await act(async () => {
      result.current.addBlankAndSelect('day-1');
    });

    expect(result.current.days[0].activities).toHaveLength(1);
    expect(result.current.days[0].activities[0].title).toBe('');

    await act(async () => {
      result.current.closeModal();
    });

    expect(result.current.days[0].activities).toHaveLength(0);

    await act(async () => {
      vi.advanceTimersByTime(600);
      await Promise.resolve();
    });

    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('removes placeholders that received a server-assigned id before closing', async () => {
    const persistSpy = vi.fn().mockResolvedValue(undefined);
    const initialDays: DayPlan[] = [{ id: 'day-1', label: 'Day 1', activities: [] }];

    const { result } = renderHook(() => usePlannerHarness(initialDays, persistSpy));

    const serverActivity: Activity = {
      id: 'server-activity-1',
      title: '',
      description: '',
      duration: 0,
      color: '#ffffff',
      budget: 0,
      category: '',
    };

    await act(async () => {
      result.current.setDays([{ id: 'day-1', label: 'Day 1', activities: [serverActivity] }]);
      result.current.setSelectedActivity({ ...serverActivity, dayId: 'day-1' });
    });

    await act(async () => {
      result.current.closeModal();
    });

    expect(result.current.days[0].activities).toHaveLength(0);
  });

  it('replaces a blank placeholder with a persisted activity on save', async () => {
    const idSpy = vi
      .spyOn(placeholders, 'generateClientActivityId')
      .mockReturnValue('generated-id');
    const persistSpy = vi.fn().mockResolvedValue(undefined);
    const initialDays: DayPlan[] = [{ id: 'day-1', label: 'Day 1', activities: [] }];

    const { result } = renderHook(() => usePlannerHarness(initialDays, persistSpy));

    await act(async () => {
      result.current.addBlankAndSelect('day-1');
    });

    expect(result.current.days[0].activities).toHaveLength(1);
    expect(result.current.days[0].activities[0].id).toMatch(/^blank-/);

    await act(async () => {
      result.current.save({ title: 'City tour' });
    });

    expect(result.current.days[0].activities).toHaveLength(1);
    const activity = result.current.days[0].activities[0];
    expect(activity.id).toBe('generated-id');
    expect(activity.title).toBe('City tour');

    idSpy.mockRestore();
  });
});
