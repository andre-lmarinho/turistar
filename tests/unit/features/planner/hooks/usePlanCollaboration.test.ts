// tests/unit/features/planner/hooks/usePlanCollaboration.test.ts

import { act, renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import type { PlanEvent, PlanEventInsert } from '@/features/planner/domain/types/PlanEvent';
import { usePlanCollaboration } from '@/features/planner/hooks/usePlanCollaboration';

const fetchSnapshot = vi.fn();
const fetchEvents = vi.fn();
const appendEvents = vi.fn();
const subscribeToPlan = vi.fn();

vi.mock('@/features/planner/services/supabase/planEventsRepository', () => ({
  PlanEventsRepository: vi.fn().mockImplementation(() => ({
    fetchSnapshot,
    fetchEvents,
    appendEvents,
    subscribeToPlan,
  })),
}));

describe('usePlanCollaboration', () => {
  const baseDay: DayPlan = {
    id: '2023-01-01',
    label: 'Day 1',
    position: '1024',
    activities: [
      {
        id: 'a1',
        title: 'Breakfast',
        color: 'bg-[var(--color-1)]',
        position: '1024',
      },
    ],
  };

  beforeEach(() => {
    fetchSnapshot.mockReset();
    fetchEvents.mockReset();
    appendEvents.mockReset();
    subscribeToPlan.mockReset();
    subscribeToPlan.mockReturnValue({ unsubscribe: vi.fn() });
  });

  test('loads snapshot and realtime events', async () => {
    fetchSnapshot.mockResolvedValue({
      version: 1,
      days: [baseDay],
      updatedAt: new Date().toISOString(),
    });
    const incomingEvent: PlanEvent = {
      id: 'evt-1',
      planId: 'p1',
      version: 2,
      type: 'activity.created',
      createdAt: new Date().toISOString(),
      payload: {
        dayId: baseDay.id,
        position: '2048',
        activity: {
          id: 'a2',
          title: 'Museum',
          color: 'bg-[var(--color-2)]',
          position: '2048',
        },
      },
    };
    fetchEvents.mockResolvedValue([]);
    const listeners: Array<(event: PlanEvent) => void> = [];
    subscribeToPlan.mockImplementation((_planId: string, handler: (event: PlanEvent) => void) => {
      listeners.push(handler);
      return { unsubscribe: vi.fn() };
    });

    const { result } = renderHook(() => usePlanCollaboration('p1'));

    await waitFor(() => {
      expect(result.current.data).toHaveLength(1);
    });

    act(() => {
      listeners.forEach((handler) => handler(incomingEvent));
    });

    await waitFor(() => {
      expect(result.current.data?.[0].activities).toHaveLength(2);
    });
  });

  test('diffs updates and appends events with optimistic state', async () => {
    fetchSnapshot.mockResolvedValue({
      version: 1,
      days: [baseDay],
      updatedAt: new Date().toISOString(),
    });
    fetchEvents.mockResolvedValue([]);
    appendEvents.mockImplementation(
      async (_planId: string, _base: number, events: PlanEventInsert[]) => ({
        version: 2,
        events: events.map((event) => ({
          ...event,
          version: 2,
          createdAt: new Date().toISOString(),
        })),
      })
    );
    const wrapper = renderHook(() => usePlanCollaboration('p1'));
    await waitFor(() => expect(wrapper.result.current.data).toBeTruthy());

    const updatedDays: DayPlan[] = [
      {
        ...baseDay,
        activities: [
          {
            ...baseDay.activities[0],
            title: 'Breakfast at hotel',
          },
        ],
      },
    ];

    await act(async () => {
      await wrapper.result.current.persistDays.mutateAsync(updatedDays);
    });

    expect(appendEvents).toHaveBeenCalled();
    const eventsArg = appendEvents.mock.calls[0][2] as PlanEventInsert[];
    expect(eventsArg[0].type).toBe('activity.updated');
    expect(eventsArg[0].payload).toMatchObject({ activityId: 'a1' });
  });
});
