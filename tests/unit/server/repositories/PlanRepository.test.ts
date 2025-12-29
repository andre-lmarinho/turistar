import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';
import {
  fetchPlanByIdWithMembers,
  fetchLatestPlanSnapshot,
  fetchPlanMemberTier,
  fetchPublicPlanBySlug,
} from '@/features/app/planner/server/repositories/PlanRepository';

vi.mock('@/shared/lib/supabaseServer', () => ({
  createSupabaseServerClient: vi.fn(),
}));

type SupabaseResult<T> = {
  data: T | null;
  error: unknown;
};

type PlanDestinationRow = {
  destinations: { name: string | null } | null;
};

type PlanMemberRow = {
  user_id: string;
  tier: string;
};

type PlanRow = {
  id: string;
  title: string | null;
  user_id: string | null;
  edit_token: string;
  budget: number | null;
  start_date: string | null;
  end_date: string | null;
  plan_destinations: PlanDestinationRow[] | null;
};

type PlanWithMembersRow = PlanRow & {
  plan_members: PlanMemberRow[] | null;
};

type SnapshotRow = {
  plan_id: string;
  version: number;
  state: { days: unknown[] };
  updated_at: string;
};

interface MaybeSingleQueryChain<T> {
  select: ReturnType<typeof vi.fn<(columns: string) => MaybeSingleQueryChain<T>>>;
  eq: ReturnType<typeof vi.fn<(column: string, value: unknown) => MaybeSingleQueryChain<T>>>;
  maybeSingle: ReturnType<typeof vi.fn<() => Promise<SupabaseResult<T>>>>;
}

interface SnapshotQueryChain<T> {
  select: ReturnType<typeof vi.fn<(columns: string) => SnapshotQueryChain<T>>>;
  eq: ReturnType<typeof vi.fn<(column: string, value: unknown) => SnapshotQueryChain<T>>>;
  order: ReturnType<
    typeof vi.fn<(column: string, options: { ascending: boolean }) => SnapshotQueryChain<T>>
  >;
  limit: ReturnType<typeof vi.fn<(rowCount: number) => SnapshotQueryChain<T>>>;
  maybeSingle: ReturnType<typeof vi.fn<() => Promise<SupabaseResult<T>>>>;
}


function buildMaybeSingleQuery<T>(result: SupabaseResult<T>) {
  const chain = {
    select: vi.fn<(columns: string) => MaybeSingleQueryChain<T>>(),
    eq: vi.fn<(column: string, value: unknown) => MaybeSingleQueryChain<T>>(),
    maybeSingle: vi.fn<() => Promise<SupabaseResult<T>>>(),
  } as unknown as MaybeSingleQueryChain<T>;

  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.maybeSingle.mockResolvedValue(result);

  return chain;
}

function buildSnapshotQuery<T>(result: SupabaseResult<T>) {
  const chain = {
    select: vi.fn<(columns: string) => SnapshotQueryChain<T>>(),
    eq: vi.fn<(column: string, value: unknown) => SnapshotQueryChain<T>>(),
    order: vi.fn<(column: string, options: { ascending: boolean }) => SnapshotQueryChain<T>>(),
    limit: vi.fn<(rowCount: number) => SnapshotQueryChain<T>>(),
    maybeSingle: vi.fn<() => Promise<SupabaseResult<T>>>(),
  } as unknown as SnapshotQueryChain<T>;

  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);
  chain.limit.mockReturnValue(chain);
  chain.maybeSingle.mockResolvedValue(result);

  return chain;
}


function buildSupabase<T>(table: string, chain: T) {
  const from = vi.fn((tableName: string) => {
    if (tableName === table) return chain;
    throw new Error(`Unexpected table ${tableName}`);
  });

  const supabase = { from } as unknown as ReturnType<typeof createSupabaseServerClient>;
  return { supabase, from };
}

describe('PlanRepository', () => {
  beforeEach(() => {
    vi.mocked(createSupabaseServerClient).mockReset();
  });

  describe('fetchPlanByIdWithMembers', () => {
    it('maps plan and members', async () => {
      const data: PlanWithMembersRow = {
        id: 'plan-1',
        title: 'Trip',
        user_id: 'owner-1',
        edit_token: 'token-1',
        budget: 100,
        start_date: '2024-01-01',
        end_date: '2024-01-05',
        plan_destinations: [{ destinations: { name: 'Berlin' } }],
        plan_members: [{ user_id: 'member-1', tier: 'admin' }],
      };
      const planQuery = buildMaybeSingleQuery<PlanWithMembersRow>({ data, error: null });
      const { supabase, from } = buildSupabase('plans', planQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await fetchPlanByIdWithMembers('plan-1');

      expect(result).toEqual({
        id: 'plan-1',
        title: 'Trip',
        ownerId: 'owner-1',
        editToken: 'token-1',
        budget: 100,
        startDate: '2024-01-01',
        endDate: '2024-01-05',
        destinations: [{ name: 'Berlin' }],
        members: [{ userId: 'member-1', tier: 'admin' }],
      });
      expect(from).toHaveBeenCalledWith('plans');
      expect(planQuery.select).toHaveBeenCalledWith(
        expect.stringContaining('plan_members!left')
      );
      expect(planQuery.eq).toHaveBeenCalledWith('id', 'plan-1');
    });

    it('returns null when no plan exists', async () => {
      const planQuery = buildMaybeSingleQuery<PlanWithMembersRow>({ data: null, error: null });
      const { supabase } = buildSupabase('plans', planQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await fetchPlanByIdWithMembers('plan-2');

      expect(result).toBeNull();
    });

    it('throws a formatted error when Supabase fails', async () => {
      const failure = new Error('plan failure');
      const planQuery = buildMaybeSingleQuery<PlanWithMembersRow>({ data: null, error: failure });
      const { supabase } = buildSupabase('plans', planQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      try {
        await fetchPlanByIdWithMembers('plan-3');
        throw new Error('Expected fetchPlanByIdWithMembers to throw');
      } catch (error) {
        if (!(error instanceof Error)) {
          throw new Error('Expected an Error instance');
        }
        expect(error.message).toContain('fetchPlanByIdWithMembers');
        expect(error.message).toContain('planId=plan-3');
      }
    });
  });

  describe('fetchPublicPlanBySlug', () => {
    it('maps a public plan row', async () => {
      const data: PlanRow = {
        id: 'plan-10',
        title: 'Public trip',
        user_id: 'owner-10',
        edit_token: 'token-10',
        budget: 250,
        start_date: '2024-02-01',
        end_date: '2024-02-03',
        plan_destinations: [{ destinations: { name: 'Oslo' } }],
      };
      const planQuery = buildMaybeSingleQuery<PlanRow>({ data, error: null });
      const { supabase, from } = buildSupabase('plans', planQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await fetchPublicPlanBySlug('public-slug');

      expect(result).toEqual({
        id: 'plan-10',
        title: 'Public trip',
        ownerId: 'owner-10',
        editToken: 'token-10',
        budget: 250,
        startDate: '2024-02-01',
        endDate: '2024-02-03',
        destinations: [{ name: 'Oslo' }],
      });
      expect(from).toHaveBeenCalledWith('plans');
      expect(planQuery.select).toHaveBeenCalledWith(
        expect.stringContaining('plan_destinations')
      );
      expect(planQuery.eq).toHaveBeenNthCalledWith(1, 'public_slug', 'public-slug');
      expect(planQuery.eq).toHaveBeenNthCalledWith(2, 'is_public', true);
    });
  });

  describe('fetchPlanMemberTier', () => {
    it('returns the member tier', async () => {
      const planMemberQuery = buildMaybeSingleQuery<{ tier: string }>({
        data: { tier: 'admin' },
        error: null,
      });
      const { supabase, from } = buildSupabase('plan_members', planMemberQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await fetchPlanMemberTier('plan-20', 'user-20');

      expect(result).toBe('admin');
      expect(from).toHaveBeenCalledWith('plan_members');
      expect(planMemberQuery.select).toHaveBeenCalledWith('tier');
      expect(planMemberQuery.eq).toHaveBeenNthCalledWith(1, 'plan_id', 'plan-20');
      expect(planMemberQuery.eq).toHaveBeenNthCalledWith(2, 'user_id', 'user-20');
    });

    it('throws a formatted error when Supabase fails', async () => {
      const failure = new Error('member failure');
      const planMemberQuery = buildMaybeSingleQuery<{ tier: string }>({
        data: null,
        error: failure,
      });
      const { supabase } = buildSupabase('plan_members', planMemberQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      try {
        await fetchPlanMemberTier('plan-21', 'user-21');
        throw new Error('Expected fetchPlanMemberTier to throw');
      } catch (error) {
        if (!(error instanceof Error)) {
          throw new Error('Expected an Error instance');
        }
        expect(error.message).toContain('fetchPlanMemberTier');
        expect(error.message).toContain('planId=plan-21');
        expect(error.message).toContain('userId=user-21');
      }
    });
  });

  describe('fetchLatestPlanSnapshot', () => {
    it('returns the latest snapshot row', async () => {
      const snapshot: SnapshotRow = {
        plan_id: 'plan-30',
        version: 2,
        state: { days: [] },
        updated_at: '2024-03-01T00:00:00.000Z',
      };
      const snapshotQuery = buildSnapshotQuery<SnapshotRow>({ data: snapshot, error: null });
      const { supabase, from } = buildSupabase('plan_snapshots', snapshotQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await fetchLatestPlanSnapshot('plan-30');

      expect(result).toEqual(snapshot);
      expect(from).toHaveBeenCalledWith('plan_snapshots');
      expect(snapshotQuery.select).toHaveBeenCalledWith('plan_id, version, state, updated_at');
      expect(snapshotQuery.eq).toHaveBeenCalledWith('plan_id', 'plan-30');
      expect(snapshotQuery.order).toHaveBeenNthCalledWith(1, 'version', { ascending: false });
      expect(snapshotQuery.order).toHaveBeenNthCalledWith(2, 'updated_at', { ascending: false });
      expect(snapshotQuery.limit).toHaveBeenCalledWith(1);
    });
  });

});
