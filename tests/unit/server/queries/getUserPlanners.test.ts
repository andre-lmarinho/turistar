import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';
import { getUserPlanners } from '@/features/app/planner/server/queries/plans/getUserPlanners';

vi.mock('@/shared/lib/supabaseServer', () => ({
  createSupabaseServerClient: vi.fn(),
}));

type PlanRow = {
  id: string;
  title: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string | null;
  public_slug: string;
  edit_token: string;
  plan_destinations: { destinations: { name: string | null } }[] | null;
  plan_snapshots: { updated_at: string | null }[] | { updated_at: string | null } | null;
};

type SupabaseResult = {
  data: PlanRow[] | null;
  error: unknown;
};

function buildSupabase(result: SupabaseResult) {
  const limit = vi.fn().mockResolvedValue(result);
  const order = vi.fn().mockReturnValue({ limit });
  const eq = vi.fn().mockReturnValue({ order, limit });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });

  const supabase = { from } as unknown as ReturnType<typeof createSupabaseServerClient>;
  return { supabase, select, eq, order, limit };
}

describe('getUserPlanners', () => {
  beforeEach(() => {
    vi.mocked(createSupabaseServerClient).mockReset();
  });

  it('returns an empty array when Supabase has no rows', async () => {
    const result: SupabaseResult = { data: null, error: null };
    const { supabase } = buildSupabase(result);
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

    const planners = await getUserPlanners('user-1');

    expect(planners).toEqual([]);
  });

  it('maps rows with snapshot normalization and title fallbacks', async () => {
    const result: SupabaseResult = {
      data: [
        {
          id: 'plan-1',
          title: null,
          start_date: '2024-01-01',
          end_date: '2024-01-05',
          created_at: '2023-12-31T00:00:00Z',
          public_slug: 'slug-1',
          edit_token: 'token-1',
          plan_destinations: [{ destinations: { name: 'Lisbon' } }],
          plan_snapshots: { updated_at: '2024-01-03T12:00:00Z' },
        },
        {
          id: 'plan-2',
          title: null,
          start_date: null,
          end_date: null,
          created_at: '2024-02-01T00:00:00Z',
          public_slug: 'slug-2',
          edit_token: 'token-2',
          plan_destinations: [],
          plan_snapshots: null,
        },
      ],
      error: null,
    };

    const { supabase, order, limit } = buildSupabase(result);
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

    const planners = await getUserPlanners('user-1');

    expect(order).toHaveBeenCalledWith('updated_at', {
      ascending: false,
      referencedTable: 'plan_snapshots',
    });
    expect(limit).toHaveBeenCalledWith(50);
    expect(planners).toEqual([
      {
        id: 'plan-1',
        title: 'Lisbon',
        destination: 'Lisbon',
        startDate: '2024-01-01',
        endDate: '2024-01-05',
        updatedAt: '2024-01-03T12:00:00Z',
        publicSlug: 'slug-1',
        editToken: 'token-1',
      },
      {
        id: 'plan-2',
        title: 'Untitled plan',
        destination: null,
        startDate: null,
        endDate: null,
        updatedAt: '2024-02-01T00:00:00Z',
        publicSlug: 'slug-2',
        editToken: 'token-2',
      },
    ]);
  });

  it('throws when Supabase returns an error', async () => {
    const failure = new Error('nope');
    const result: SupabaseResult = { data: null, error: failure };
    const { supabase } = buildSupabase(result);
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

    await expect(getUserPlanners('user-1')).rejects.toBe(failure);
  });

  it('prefers snapshot arrays for updatedAt', async () => {
    const result: SupabaseResult = {
      data: [
        {
          id: 'plan-3',
          title: null,
          start_date: '2024-03-01',
          end_date: '2024-03-05',
          created_at: '2024-02-25T00:00:00Z',
          public_slug: 'slug-3',
          edit_token: 'token-3',
          plan_destinations: [{ destinations: { name: 'Oslo' } }],
          plan_snapshots: [
            { updated_at: '2024-03-10T00:00:00Z' },
            { updated_at: '2024-02-28T00:00:00Z' },
          ],
        },
      ],
      error: null,
    };

    const { supabase } = buildSupabase(result);
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

    const planners = await getUserPlanners('user-1');

    expect(planners[0].updatedAt).toBe('2024-03-10T00:00:00Z');
  });
});
