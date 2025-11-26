import { act, renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import type { DayPlan } from '@/features/app/planner/domain/types/PlannerEntities';
import type {
  PlanEvent,
  PlanEventInsert,
  PlanSnapshot,
} from '@/features/app/planner/domain/types/PlanEvent';
import { usePlanCollaboration } from '@/features/app/planner/hooks/data/usePlanCollaboration';

const supabaseMocks = vi.hoisted(() => {
  const fetchSnapshot = vi.fn<() => Promise<PlanSnapshot>>();
  const fetchEvents = vi.fn<(planId: string, version: number) => Promise<PlanEvent[]>>();
  const appendEvents =
    vi.fn<
      (
        planId: string,
        baseVersion: number,
        events: PlanEventInsert[]
      ) => Promise<{ version: number; events: PlanEvent[] }>
    >();
  const subscribeToPlan =
    vi.fn<(planId: string, handler: (event: PlanEvent) => void) => { unsubscribe: () => void }>();
  return { fetchSnapshot, fetchEvents, appendEvents, subscribeToPlan };
});

vi.mock('@/features/app/planner/services/supabase/planEventsQueries', () => ({
  __esModule: true,
  fetchPlanSnapshot: supabaseMocks.fetchSnapshot,
  fetchPlanEvents: supabaseMocks.fetchEvents,
  appendPlanEvents: supabaseMocks.appendEvents,
}));

vi.mock('@/features/app/planner/services/supabase/planEventsRealtime', () => ({
  __esModule: true,
  subscribeToPlanEvents: supabaseMocks.subscribeToPlan,
}));

const { fetchSnapshot, fetchEvents, appendEvents, subscribeToPlan } = supabaseMocks;

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
        })) as PlanEvent[],
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

  test('resyncs when append response skips intermediate versions', async () => {
    const initialSnapshot: PlanSnapshot = {
      version: 1,
      days: [baseDay],
      updatedAt: new Date().toISOString(),
    };
    const resyncedSnapshot: PlanSnapshot = {
      version: 4,
      days: [
        {
          ...baseDay,
          activities: [
            {
              ...baseDay.activities[0],
              title: 'Breakfast at hotel',
            },
            {
              id: 'a-remote',
              title: 'Lunch',
              color: 'bg-[var(--color-3)]',
              position: '2048',
            },
          ],
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    fetchSnapshot.mockResolvedValueOnce(initialSnapshot);
    fetchSnapshot.mockResolvedValueOnce(resyncedSnapshot);
    fetchEvents.mockResolvedValue([]);
    appendEvents.mockImplementation(
      async (_planId: string, _base: number, events: PlanEventInsert[]) => ({
        version: 4,
        events: events.map((event) => ({
          ...event,
          version: 4,
          createdAt: new Date().toISOString(),
        })) as PlanEvent[],
      })
    );

    const { result } = renderHook(() => usePlanCollaboration('plan-resync'));
    await waitFor(() => expect(result.current.data).toBeTruthy());

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
      await result.current.persistDays.mutateAsync(updatedDays);
    });

    await waitFor(() => {
      expect(fetchSnapshot).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(result.current.data?.[0].activities).toHaveLength(2);
      expect(result.current.version).toBe(4);
    });
  });
});
