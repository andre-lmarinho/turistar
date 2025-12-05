import { describe, it, expect, beforeEach, vi } from 'vitest';
import { notFound } from 'next/navigation';

import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';
import { mapPlanDaysFromSupabase } from '@/features/app/planner/services/supabase/planDaysMapper';
import { getUserPlannerExperience } from '@/server/queries/plans/getUserPlannerExperience';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

vi.mock('@/shared/lib/supabaseServer', () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock('@/features/app/planner/services/supabase/planDaysMapper', () => ({
  mapPlanDaysFromSupabase: vi.fn(),
}));

type PlanRecord = {
  id: string;
  title: string | null;
  edit_token: string;
  budget: number | null;
  user_id: string | null;
  plan_destinations: { destinations: { name: string | null } }[] | null;
};

type SupabasePlanResult = {
  data: PlanRecord | null;
  error: unknown;
};

type SupabaseDayResult = {
  data: { date: string }[] | null;
  error: unknown;
};

type SupabaseEntryResult = {
  data:
    | {
        id: string;
        description: string | null;
        category: string | null;
        amount: number | null;
      }[]
    | null;
  error: unknown;
};

function createPlanQuery(result: SupabasePlanResult) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  return { select, eq, maybeSingle };
}

function createDayQuery(result: SupabaseDayResult) {
  const order = vi.fn().mockResolvedValue(result);
  const eq = vi.fn().mockReturnValue({ order });
  const select = vi.fn().mockReturnValue({ eq });
  return { select, eq, order };
}

function createEntryQuery(result: SupabaseEntryResult) {
  const eq = vi.fn().mockResolvedValue(result);
  const select = vi.fn().mockReturnValue({ eq });
  return { select, eq };
}

function mockSupabase(
  planResult: SupabasePlanResult,
  dayResult: SupabaseDayResult,
  entryResult: SupabaseEntryResult
) {
  const planQuery = createPlanQuery(planResult);
  const dayQuery = createDayQuery(dayResult);
  const entryQuery = createEntryQuery(entryResult);
  const from = vi.fn((table: string) => {
    if (table === 'plans') return planQuery;
    if (table === 'plan_days') return dayQuery;
    if (table === 'budget_entries') return entryQuery;
    throw new Error(`Unexpected table ${table}`);
  });

  const supabase = { from } as unknown as ReturnType<typeof createSupabaseServerClient>;
  return { supabase, planQuery, dayQuery, entryQuery };
}

const notFoundError = new Error('NOT_FOUND');

describe('getUserPlannerExperience', () => {
  beforeEach(() => {
    vi.mocked(notFound).mockImplementation(() => {
      throw notFoundError;
    });
    vi.mocked(createSupabaseServerClient).mockReset();
    vi.mocked(mapPlanDaysFromSupabase).mockReset();
  });

  it('calls notFound when the plan user id does not match', async () => {
    const planResult: SupabasePlanResult = {
      data: {
        id: 'plan-1',
        title: 'Trip',
        edit_token: 'token',
        budget: 100,
        user_id: 'owner',
        plan_destinations: [{ destinations: { name: 'Berlin' } }],
      },
      error: null,
    };
    const { supabase } = mockSupabase(planResult, { data: null, error: null }, { data: null, error: null });
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

    await expect(getUserPlannerExperience('plan-1', 'user-1')).rejects.toBe(notFoundError);
    expect(notFound).toHaveBeenCalled();
  });

  it('calls notFound when there is no destination', async () => {
    const planResult: SupabasePlanResult = {
      data: {
        id: 'plan-2',
        title: 'Plan',
        edit_token: 'token',
        budget: 50,
        user_id: 'user-2',
        plan_destinations: [{ destinations: { name: null } }],
      },
      error: null,
    };
    const { supabase } = mockSupabase(planResult, { data: null, error: null }, { data: null, error: null });
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

    await expect(getUserPlannerExperience('plan-2', 'user-2')).rejects.toBe(notFoundError);
    expect(notFound).toHaveBeenCalled();
  });

  it('throws when the day query fails', async () => {
    const planResult: SupabasePlanResult = {
      data: {
        id: 'plan-3',
        title: null,
        edit_token: 'token',
        budget: null,
        user_id: 'user-3',
        plan_destinations: [{ destinations: { name: 'Rome' } }],
      },
      error: null,
    };
    const dayErr = new Error('day fail');
    const { supabase } = mockSupabase(planResult, { data: null, error: dayErr }, { data: null, error: null });
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

    await expect(getUserPlannerExperience('plan-3', 'user-3')).rejects.toBe(dayErr);
  });

  it('throws when the entry query fails', async () => {
    const planResult: SupabasePlanResult = {
      data: {
        id: 'plan-4',
        title: 'Road trip',
        edit_token: 'token',
        budget: 200,
        user_id: 'user-4',
        plan_destinations: [{ destinations: { name: 'Lisbon' } }],
      },
      error: null,
    };
    const entryErr = new Error('entry fail');
    const dayResult: SupabaseDayResult = { data: null, error: null };
    const { supabase } = mockSupabase(planResult, dayResult, { data: null, error: entryErr });
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

    await expect(getUserPlannerExperience('plan-4', 'user-4')).rejects.toBe(entryErr);
  });

  it('returns mapped experience with normalized entries', async () => {
    const planResult: SupabasePlanResult = {
      data: {
        id: 'plan-5',
        title: 'Adventure',
        edit_token: 'token',
        budget: 666,
        user_id: 'user-5',
        plan_destinations: [{ destinations: { name: 'Madrid' } }],
      },
      error: null,
    };
    const dayRows = [{ date: '2024-01-01' }];
    const entryRows = [
      { id: 'entry-1', description: null, category: null, amount: null },
      { id: 'entry-2', description: 'Lunch', category: 'food', amount: 20 },
    ];
    const dayResult: SupabaseDayResult = { data: dayRows, error: null };
    const entryResult: SupabaseEntryResult = { data: entryRows, error: null };
    const { supabase } = mockSupabase(planResult, dayResult, entryResult);
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);
    vi.mocked(mapPlanDaysFromSupabase).mockReturnValue([{ id: '2024-01-01', label: 'Day', activities: [] }]);

    const experience = await getUserPlannerExperience('plan-5', 'user-5');

    expect(mapPlanDaysFromSupabase).toHaveBeenCalledWith(dayRows);
    expect(experience).toEqual({
      planId: 'plan-5',
      title: 'Adventure',
      destination: 'Madrid',
      initialDays: [{ id: '2024-01-01', label: 'Day', activities: [] }],
      initialBudget: 666,
      initialEntries: [
        { id: 'entry-1', description: '', category: 'transport', amount: 0 },
        { id: 'entry-2', description: 'Lunch', category: 'food', amount: 20 },
      ],
      editToken: 'token',
    });
  });
});
