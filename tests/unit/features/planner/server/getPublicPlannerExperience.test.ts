import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

vi.mock('@/shared/lib/supabaseServer', () => ({
  supabaseServer: vi.fn(),
}));

import { notFound } from 'next/navigation';
import { supabaseServer } from '@/shared/lib/supabaseServer';
import { getPublicPlannerExperience } from '@/features/app/planner/server/getPublicPlannerExperience';

interface SupabaseResult<T> {
  data: T;
  error: unknown;
}

type PlanRecord = {
  id: string;
  title: string | null;
  plan_destinations: { destinations: { name: string } }[] | null;
  user_id: string | null;
  edit_token: string;
  budget: number | null;
  start_date?: string | null;
  end_date?: string | null;
} | null;

type SnapshotRecord =
  | {
      plan_id: string;
      version: number;
      state: {
        days: {
          id: string;
          label: string;
          position?: string;
          activities: {
            id: string;
            title: string;
            color: string;
            position?: string;
            description?: string | null;
            address?: string | null;
            duration?: number | null;
            startTime?: string | null;
            imageUrl?: string | null;
            budget?: number | null;
            category?: string | null;
            latitude?: number | null;
            longitude?: number | null;
          }[];
        }[];
      };
      updated_at: string;
    }
  | null;
type EntryRecord =
  | {
      id: string;
      description: string | null;
      category: string | null;
      amount: number | null;
    }[]
  | null;

interface PlanQueryChain {
  select: ReturnType<typeof vi.fn<(columns: string) => PlanQueryChain>>;
  eq: ReturnType<typeof vi.fn<(column: string, value: unknown) => PlanQueryChain>>;
  single: ReturnType<typeof vi.fn<() => Promise<SupabaseResult<PlanRecord>>>>;
}

interface SnapshotQueryChain {
  select: ReturnType<typeof vi.fn<(columns: string) => SnapshotQueryChain>>;
  eq: ReturnType<typeof vi.fn<(column: string, value: unknown) => SnapshotQueryChain>>;
  maybeSingle: ReturnType<typeof vi.fn<() => Promise<SupabaseResult<SnapshotRecord>>>>;
}

interface EntryQueryChain {
  select: ReturnType<typeof vi.fn<(columns: string) => EntryQueryChain>>;
  eq: ReturnType<
    typeof vi.fn<(column: string, value: unknown) => Promise<SupabaseResult<EntryRecord>>>
  >;
}

function createPlanQuery(result: SupabaseResult<PlanRecord>) {
  const chain = {
    select: vi.fn<(columns: string) => PlanQueryChain>(),
    eq: vi.fn<(column: string, value: unknown) => PlanQueryChain>(),
    single: vi.fn<() => Promise<SupabaseResult<PlanRecord>>>(),
  } as unknown as PlanQueryChain;

  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.single.mockResolvedValue(result);

  return chain;
}

function createSnapshotQuery(result: SupabaseResult<SnapshotRecord>) {
  const chain = {
    select: vi.fn<(columns: string) => SnapshotQueryChain>(),
    eq: vi.fn<(column: string, value: unknown) => SnapshotQueryChain>(),
    maybeSingle: vi.fn<() => Promise<SupabaseResult<SnapshotRecord>>>(),
  } as unknown as SnapshotQueryChain;

  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.maybeSingle.mockResolvedValue(result);

  return chain;
}

function createEntryQuery(result: SupabaseResult<EntryRecord>) {
  const chain = {
    select: vi.fn<(columns: string) => EntryQueryChain>(),
    eq: vi.fn<(column: string, value: unknown) => Promise<SupabaseResult<EntryRecord>>>(),
  } as unknown as EntryQueryChain;

  chain.select.mockReturnValue(chain);
  chain.eq.mockResolvedValue(result);

  return chain;
}

function mockSupabase(
  planResult: SupabaseResult<PlanRecord>,
  snapshotResult: SupabaseResult<SnapshotRecord>,
  entryResult: SupabaseResult<EntryRecord> = { data: null, error: null }
) {
  const planQuery = createPlanQuery(planResult);
  const snapshotQuery = createSnapshotQuery(snapshotResult);
  const entryQuery = createEntryQuery(entryResult);
  const supabase = {
    from: vi.fn((table: string) => {
      if (table === 'plans') return planQuery;
      if (table === 'plan_snapshots') return snapshotQuery;
      if (table === 'budget_entries') return entryQuery;
      throw new Error(`Unexpected table ${table}`);
    }),
  };
  return supabase;
}

const notFoundError = new Error('NOT_FOUND');

describe('getPublicPlannerExperience', () => {
  beforeEach(() => {
    vi.mocked(notFound).mockImplementation(() => {
      throw notFoundError;
    });
    vi.mocked(supabaseServer).mockReset();
    vi.mocked(notFound).mockClear();
  });

  it('returns the planner experience with mapped days and fallback destination', async () => {
    const planResult: SupabaseResult<PlanRecord> = {
      data: {
        id: 'plan-1',
        title: 'Summer Escape',
        plan_destinations: [
          {
            destinations: {
              name: 'Paris',
            },
          },
        ],
        user_id: 'owner-1',
        edit_token: 'token-123',
        budget: 1500,
      },
      error: null,
    };

    const snapshotResult: SupabaseResult<SnapshotRecord> = {
      data: {
        plan_id: 'plan-1',
        version: 1,
        state: {
          days: [
            {
              id: '2024-01-01',
              label: 'Mon, 01 Jan',
              activities: [
                {
                  id: 'activity-1',
                  title: 'Visit Louvre',
                  color: '#123456',
                  address: 'Paris, France',
                  category: 'Culture',
                  description: 'Explore the museum',
                  startTime: '09:00',
                  duration: 120,
                  latitude: 48.8606,
                  longitude: 2.3376,
                  budget: 50,
                  imageUrl: null,
                },
              ],
            },
          ],
        },
        updated_at: '2024-01-01T00:00:00.000Z',
      },
      error: null,
    };

    const entryResult: SupabaseResult<EntryRecord> = {
      data: [{ id: 'entry-1', description: 'Flight', category: 'travel', amount: 900 }],
      error: null,
    };

    const supabase = mockSupabase(planResult, snapshotResult, entryResult);
    vi.mocked(supabaseServer).mockReturnValueOnce(
      supabase as unknown as ReturnType<typeof supabaseServer>
    );

    const experience = await getPublicPlannerExperience({ slug: 'summer-escape' });

    expect(notFound).not.toHaveBeenCalled();
    expect(experience).toEqual({
      planId: 'plan-1',
      title: 'Summer Escape',
      destination: 'Paris',
      initialDays: [
        {
          id: '2024-01-01',
          label: 'Mon, 01 Jan',
          position: '1024',
          activities: [
            expect.objectContaining({
              id: 'activity-1',
              title: 'Visit Louvre',
              color: '#123456',
              address: 'Paris, France',
              category: 'Culture',
              description: 'Explore the museum',
              startTime: '09:00',
              duration: 120,
              latitude: 48.8606,
              longitude: 2.3376,
              budget: 50,
            }),
          ],
        },
      ],
      initialBudget: 1500,
      initialEntries: [
        {
          id: 'entry-1',
          description: 'Flight',
          category: 'travel',
          amount: 900,
        },
      ],
      canEdit: false,
      editToken: undefined,
      isOwner: false,
      isAdmin: false,
      canManageMembers: false,
    });
  });

  it('calls notFound when the plan is missing or returns an error', async () => {
    const planResult = { data: null, error: new Error('plan missing') };
    const snapshotResult = { data: null, error: null };
    const supabase = mockSupabase(planResult, snapshotResult);
    vi.mocked(supabaseServer).mockReturnValueOnce(
      supabase as unknown as ReturnType<typeof supabaseServer>
    );

    await expect(getPublicPlannerExperience({ slug: 'no-plan' })).rejects.toBe(notFoundError);
    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it('returns a fallback destination when no destination is available', async () => {
    const planResult = {
      data: {
        id: 'plan-2',
        title: 'Untitled',
        plan_destinations: [],
        user_id: null,
        edit_token: 'token-2',
        budget: null,
        start_date: null,
        end_date: null,
      },
      error: null,
    };
    const snapshotResult = { data: null, error: null };
    const supabase = mockSupabase(planResult, snapshotResult);
    vi.mocked(supabaseServer).mockReturnValueOnce(
      supabase as unknown as ReturnType<typeof supabaseServer>
    );

    const experience = await getPublicPlannerExperience({ slug: 'missing-dest' });

    expect(notFound).not.toHaveBeenCalled();
    expect(experience).toEqual({
      planId: 'plan-2',
      title: 'Untitled',
      destination: 'Destination TBD',
      initialDays: undefined,
      initialBudget: undefined,
      initialEntries: undefined,
      canEdit: false,
      editToken: undefined,
      isOwner: false,
      isAdmin: false,
      canManageMembers: false,
    });
  });

  it('returns experience without initial days when the snapshot query fails', async () => {
    const planResult = {
      data: {
        id: 'plan-3',
        title: null,
        plan_destinations: [
          {
            destinations: {
              name: 'Lisbon',
            },
          },
        ],
        user_id: 'owner-3',
        edit_token: 'token-3',
        budget: null,
      },
      error: null,
    };
    const snapshotResult = { data: null, error: new Error('snapshot failure') };
    const supabase = mockSupabase(planResult, snapshotResult);
    vi.mocked(supabaseServer).mockReturnValueOnce(
      supabase as unknown as ReturnType<typeof supabaseServer>
    );

    const experience = await getPublicPlannerExperience({ slug: 'lisbon-plan', dest: 'Lisbon' });

    expect(notFound).not.toHaveBeenCalled();
    expect(experience).toEqual({
      planId: 'plan-3',
      title: undefined,
      destination: 'Lisbon',
      initialDays: undefined,
      initialBudget: undefined,
      initialEntries: undefined,
      canEdit: false,
      editToken: undefined,
      isOwner: false,
      isAdmin: false,
      canManageMembers: false,
    });
  });
});
