import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';
import type { PlanEventInsert } from '@/features/app/planner/domain/types/PlanEvent';
import {
  appendPlanEvents,
  fetchPlanEvents,
} from './PlanEventsRepository';

vi.mock('@/shared/lib/supabaseServer', () => ({
  createSupabaseServerClient: vi.fn(),
}));

type SupabaseResult<T> = {
  data: T | null;
  error: unknown;
};

type PlanEventRow = {
  event_id: string;
  plan_id: string;
  version: number;
  event_type: string;
  payload: unknown;
  created_at: string;
  actor_id: string | null;
};

interface EventsQueryChain<T> {
  select: ReturnType<typeof vi.fn<(columns: string) => EventsQueryChain<T>>>;
  eq: ReturnType<typeof vi.fn<(column: string, value: unknown) => EventsQueryChain<T>>>;
  gt: ReturnType<typeof vi.fn<(column: string, value: number) => EventsQueryChain<T>>>;
  order: ReturnType<
    typeof vi.fn<(column: string, options: { ascending: boolean }) => Promise<SupabaseResult<T>>>
  >;
}

function buildEventsQuery<T>(result: SupabaseResult<T>) {
  const chain = {
    select: vi.fn<(columns: string) => EventsQueryChain<T>>(),
    eq: vi.fn<(column: string, value: unknown) => EventsQueryChain<T>>(),
    gt: vi.fn<(column: string, value: number) => EventsQueryChain<T>>(),
    order: vi.fn<
      (column: string, options: { ascending: boolean }) => Promise<SupabaseResult<T>>
    >(),
  } as unknown as EventsQueryChain<T>;

  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.gt.mockReturnValue(chain);
  chain.order.mockResolvedValue(result);

  return chain;
}

function buildSupabaseFrom<T>(table: string, chain: T) {
  const from = vi.fn((tableName: string) => {
    if (tableName === table) return chain;
    throw new Error(`Unexpected table ${tableName}`);
  });

  const supabase = { from } as unknown as ReturnType<typeof createSupabaseServerClient>;
  return { supabase, from };
}

function buildSupabaseRpc<T>(result: SupabaseResult<T>) {
  const rpc = vi.fn().mockResolvedValue(result);
  const supabase = { rpc } as unknown as ReturnType<typeof createSupabaseServerClient>;
  return { supabase, rpc };
}

describe('PlanEventsRepository', () => {
  beforeEach(() => {
    vi.mocked(createSupabaseServerClient).mockReset();
  });

  describe('fetchPlanEvents', () => {
    it('returns event rows', async () => {
      const data: PlanEventRow[] = [
        {
          event_id: 'event-1',
          plan_id: 'plan-1',
          version: 2,
          event_type: 'day.created',
          payload: { dayId: 'day-1' },
          created_at: '2024-01-01T00:00:00.000Z',
          actor_id: 'user-1',
        },
      ];
      const eventsQuery = buildEventsQuery<PlanEventRow[]>({ data, error: null });
      const { supabase, from } = buildSupabaseFrom('plan_events', eventsQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await fetchPlanEvents('plan-1', 1);

      expect(result).toEqual(data);
      expect(from).toHaveBeenCalledWith('plan_events');
      expect(eventsQuery.select).toHaveBeenCalledWith(
        'event_id, plan_id, version, event_type, payload, created_at, actor_id'
      );
      expect(eventsQuery.eq).toHaveBeenCalledWith('plan_id', 'plan-1');
      expect(eventsQuery.gt).toHaveBeenCalledWith('version', 1);
      expect(eventsQuery.order).toHaveBeenCalledWith('version', { ascending: true });
    });

    it('returns an empty list when no events exist', async () => {
      const eventsQuery = buildEventsQuery<PlanEventRow[]>({ data: null, error: null });
      const { supabase } = buildSupabaseFrom('plan_events', eventsQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await fetchPlanEvents('plan-2', 5);

      expect(result).toEqual([]);
    });

    it('throws a formatted error when Supabase fails', async () => {
      const failure = new Error('events failure');
      const eventsQuery = buildEventsQuery<PlanEventRow[]>({ data: null, error: failure });
      const { supabase } = buildSupabaseFrom('plan_events', eventsQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      try {
        await fetchPlanEvents('plan-3', 2);
        throw new Error('Expected fetchPlanEvents to throw');
      } catch (error) {
        if (!(error instanceof Error)) {
          throw new Error('Expected an Error instance');
        }
        expect(error.message).toContain('fetchPlanEvents');
        expect(error.message).toContain('planId=plan-3');
        expect(error.message).toContain('sinceVersion=2');
      }
    });
  });

  describe('appendPlanEvents', () => {
    const events: PlanEventInsert[] = [
      {
        id: 'event-10',
        planId: 'plan-10',
        type: 'day.created',
        payload: {
          day: {
            id: 'day-10',
            label: 'Day 10',
            position: '10',
            activities: [],
          },
        },
        actorId: 'user-10',
      },
    ];

    it('returns the rpc response', async () => {
      const response = {
        data: {
          version: 4,
          inserted_events: [
            {
              event_id: 'event-10',
              plan_id: 'plan-10',
              version: 4,
              event_type: 'day.created',
              payload: { dayId: 'day-10' },
              created_at: '2024-02-01T00:00:00.000Z',
              actor_id: 'user-10',
            },
          ],
        },
        error: null,
      };
      const { supabase, rpc } = buildSupabaseRpc(response);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await appendPlanEvents('plan-10', 3, events);

      expect(result).toEqual(response.data);
      expect(rpc).toHaveBeenCalledWith('append_plan_events', {
        plan_id: 'plan-10',
        base_version: 3,
        events,
      });
    });

    it('returns null when Supabase returns no data', async () => {
      const response = { data: null, error: null };
      const { supabase } = buildSupabaseRpc(response);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await appendPlanEvents('plan-11', 2, events);

      expect(result).toBeNull();
    });

    it('throws a formatted error when Supabase fails', async () => {
      const failure = new Error('append failure');
      const { supabase } = buildSupabaseRpc({ data: null, error: failure });
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      try {
        await appendPlanEvents('plan-12', 1, events);
        throw new Error('Expected appendPlanEvents to throw');
      } catch (error) {
        if (!(error instanceof Error)) {
          throw new Error('Expected an Error instance');
        }
        expect(error.message).toContain('appendPlanEvents');
        expect(error.message).toContain('planId=plan-12');
        expect(error.message).toContain('baseVersion=1');
        expect(error.message).toContain('eventCount=1');
      }
    });
  });
});
