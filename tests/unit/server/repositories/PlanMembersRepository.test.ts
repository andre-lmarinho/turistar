import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';
import {
  addPlanMemberByEmail,
  fetchPlanIdentityById,
  fetchPlanIdentityBySlug,
  fetchPlanMembersWithProfiles,
  fetchProfileById,
  leavePlan,
  removePlanMember,
  updatePlanMemberTier,
} from '@/features/app/planner/server/repositories/PlanMembersRepository';

vi.mock('@/shared/lib/supabaseServer', () => ({
  createSupabaseServerClient: vi.fn(),
}));

type SupabaseResult<T> = {
  data: T | null;
  error: unknown;
};

type PlanRow = {
  id: string;
  user_id: string | null;
};

type ProfileRow = {
  id: string;
  slug: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

type PlanMemberRow = {
  user_id: string;
  tier: 'admin' | 'member';
  profiles: ProfileRow | null;
};

interface MaybeSingleQueryChain<T> {
  select: ReturnType<typeof vi.fn<(columns: string) => MaybeSingleQueryChain<T>>>;
  eq: ReturnType<typeof vi.fn<(column: string, value: unknown) => MaybeSingleQueryChain<T>>>;
  maybeSingle: ReturnType<typeof vi.fn<() => Promise<SupabaseResult<T>>>>;
}

interface OrderQueryChain<T> {
  select: ReturnType<typeof vi.fn<(columns: string) => OrderQueryChain<T>>>;
  eq: ReturnType<typeof vi.fn<(column: string, value: unknown) => OrderQueryChain<T>>>;
  order: ReturnType<typeof vi.fn<(column: string) => Promise<SupabaseResult<T>>>>;
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

function buildOrderQuery<T>(result: SupabaseResult<T>) {
  const chain = {
    select: vi.fn<(columns: string) => OrderQueryChain<T>>(),
    eq: vi.fn<(column: string, value: unknown) => OrderQueryChain<T>>(),
    order: vi.fn<(column: string) => Promise<SupabaseResult<T>>>(),
  } as unknown as OrderQueryChain<T>;

  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
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

describe('PlanMembersRepository', () => {
  beforeEach(() => {
    vi.mocked(createSupabaseServerClient).mockReset();
  });

  describe('fetchPlanIdentityById', () => {
    it('returns the plan identity', async () => {
      const planQuery = buildMaybeSingleQuery<PlanRow>({
        data: { id: 'plan-1', user_id: 'owner-1' },
        error: null,
      });
      const { supabase, from } = buildSupabaseFrom('plans', planQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await fetchPlanIdentityById('plan-1');

      expect(result).toEqual({ id: 'plan-1', ownerId: 'owner-1' });
      expect(from).toHaveBeenCalledWith('plans');
      expect(planQuery.select).toHaveBeenCalledWith('id, user_id');
      expect(planQuery.eq).toHaveBeenCalledWith('id', 'plan-1');
    });

    it('returns null when no plan exists', async () => {
      const planQuery = buildMaybeSingleQuery<PlanRow>({ data: null, error: null });
      const { supabase } = buildSupabaseFrom('plans', planQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await fetchPlanIdentityById('plan-2');

      expect(result).toBeNull();
    });

    it('throws a formatted error when Supabase fails', async () => {
      const failure = new Error('plan failure');
      const planQuery = buildMaybeSingleQuery<PlanRow>({ data: null, error: failure });
      const { supabase } = buildSupabaseFrom('plans', planQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      try {
        await fetchPlanIdentityById('plan-3');
        throw new Error('Expected fetchPlanIdentityById to throw');
      } catch (error) {
        if (!(error instanceof Error)) {
          throw new Error('Expected an Error instance');
        }
        expect(error.message).toContain('fetchPlanIdentityById');
        expect(error.message).toContain('planId=plan-3');
      }
    });
  });

  describe('fetchPlanIdentityBySlug', () => {
    it('returns the plan identity', async () => {
      const planQuery = buildMaybeSingleQuery<PlanRow>({
        data: { id: 'plan-10', user_id: null },
        error: null,
      });
      const { supabase, from } = buildSupabaseFrom('plans', planQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await fetchPlanIdentityBySlug('public-slug');

      expect(result).toEqual({ id: 'plan-10', ownerId: null });
      expect(from).toHaveBeenCalledWith('plans');
      expect(planQuery.select).toHaveBeenCalledWith('id, user_id');
      expect(planQuery.eq).toHaveBeenCalledWith('public_slug', 'public-slug');
    });

    it('throws a formatted error when Supabase fails', async () => {
      const failure = new Error('slug failure');
      const planQuery = buildMaybeSingleQuery<PlanRow>({ data: null, error: failure });
      const { supabase } = buildSupabaseFrom('plans', planQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      try {
        await fetchPlanIdentityBySlug('bad-slug');
        throw new Error('Expected fetchPlanIdentityBySlug to throw');
      } catch (error) {
        if (!(error instanceof Error)) {
          throw new Error('Expected an Error instance');
        }
        expect(error.message).toContain('fetchPlanIdentityBySlug');
        expect(error.message).toContain('slug=bad-slug');
      }
    });
  });

  describe('fetchPlanMembersWithProfiles', () => {
    it('maps members with profiles', async () => {
      const data: PlanMemberRow[] = [
        {
          user_id: 'user-1',
          tier: 'admin',
          profiles: {
            id: 'user-1',
            slug: 'owner',
            display_name: 'Owner',
            avatar_url: 'avatar.png',
          },
        },
        { user_id: 'user-2', tier: 'member', profiles: null },
      ];
      const planMemberQuery = buildOrderQuery<PlanMemberRow[]>({ data, error: null });
      const { supabase, from } = buildSupabaseFrom('plan_members', planMemberQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await fetchPlanMembersWithProfiles('plan-20');

      expect(result).toEqual([
        {
          userId: 'user-1',
          tier: 'admin',
          profile: {
            userId: 'user-1',
            slug: 'owner',
            displayName: 'Owner',
            avatarUrl: 'avatar.png',
          },
        },
        {
          userId: 'user-2',
          tier: 'member',
          profile: null,
        },
      ]);
      expect(from).toHaveBeenCalledWith('plan_members');
      expect(planMemberQuery.select).toHaveBeenCalledWith(
        expect.stringContaining('profiles:profiles!plan_members_user_id_fkey')
      );
      expect(planMemberQuery.eq).toHaveBeenCalledWith('plan_id', 'plan-20');
      expect(planMemberQuery.order).toHaveBeenCalledWith('created_at');
    });

    it('returns an empty list when no members exist', async () => {
      const planMemberQuery = buildOrderQuery<PlanMemberRow[]>({ data: null, error: null });
      const { supabase } = buildSupabaseFrom('plan_members', planMemberQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await fetchPlanMembersWithProfiles('plan-21');

      expect(result).toEqual([]);
    });

    it('throws a formatted error when Supabase fails', async () => {
      const failure = new Error('members failure');
      const planMemberQuery = buildOrderQuery<PlanMemberRow[]>({ data: null, error: failure });
      const { supabase } = buildSupabaseFrom('plan_members', planMemberQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      try {
        await fetchPlanMembersWithProfiles('plan-22');
        throw new Error('Expected fetchPlanMembersWithProfiles to throw');
      } catch (error) {
        if (!(error instanceof Error)) {
          throw new Error('Expected an Error instance');
        }
        expect(error.message).toContain('fetchPlanMembersWithProfiles');
        expect(error.message).toContain('planId=plan-22');
      }
    });
  });

  describe('fetchProfileById', () => {
    it('maps a profile row', async () => {
      const profileQuery = buildMaybeSingleQuery<ProfileRow>({
        data: {
          id: 'user-30',
          slug: 'user-30',
          display_name: 'User 30',
          avatar_url: null,
        },
        error: null,
      });
      const { supabase, from } = buildSupabaseFrom('profiles', profileQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await fetchProfileById('user-30');

      expect(result).toEqual({
        userId: 'user-30',
        slug: 'user-30',
        displayName: 'User 30',
        avatarUrl: null,
      });
      expect(from).toHaveBeenCalledWith('profiles');
      expect(profileQuery.select).toHaveBeenCalledWith('id, slug, display_name, avatar_url');
      expect(profileQuery.eq).toHaveBeenCalledWith('id', 'user-30');
    });

    it('returns null when no profile exists', async () => {
      const profileQuery = buildMaybeSingleQuery<ProfileRow>({ data: null, error: null });
      const { supabase } = buildSupabaseFrom('profiles', profileQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await fetchProfileById('user-31');

      expect(result).toBeNull();
    });

    it('throws a formatted error when Supabase fails', async () => {
      const failure = new Error('profile failure');
      const profileQuery = buildMaybeSingleQuery<ProfileRow>({ data: null, error: failure });
      const { supabase } = buildSupabaseFrom('profiles', profileQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      try {
        await fetchProfileById('user-32');
        throw new Error('Expected fetchProfileById to throw');
      } catch (error) {
        if (!(error instanceof Error)) {
          throw new Error('Expected an Error instance');
        }
        expect(error.message).toContain('fetchProfileById');
        expect(error.message).toContain('userId=user-32');
      }
    });
  });

  describe('rpc wrappers', () => {
    it('adds a plan member by email', async () => {
      const response = {
        data: [{ user_id: 'user-40', tier: 'member' }],
        error: null,
      };
      const { supabase, rpc } = buildSupabaseRpc(response);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await addPlanMemberByEmail('plan-40', 'user-40@email.com', 'member');

      expect(result).toEqual(response);
      expect(rpc).toHaveBeenCalledWith('add_plan_member_by_email', {
        _plan_id: 'plan-40',
        _email: 'user-40@email.com',
        _tier: 'member',
      });
    });

    it('updates a plan member tier', async () => {
      const response = { data: null, error: null };
      const { supabase, rpc } = buildSupabaseRpc(response);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await updatePlanMemberTier('plan-41', 'user-41', 'admin');

      expect(result).toEqual(response);
      expect(rpc).toHaveBeenCalledWith('update_plan_member_tier', {
        _plan_id: 'plan-41',
        _user_id: 'user-41',
        _tier: 'admin',
      });
    });

    it('removes a plan member', async () => {
      const response = { data: null, error: null };
      const { supabase, rpc } = buildSupabaseRpc(response);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await removePlanMember('plan-42', 'user-42');

      expect(result).toEqual(response);
      expect(rpc).toHaveBeenCalledWith('remove_plan_member', {
        _plan_id: 'plan-42',
        _user_id: 'user-42',
      });
    });

    it('leaves a plan', async () => {
      const response = { data: null, error: null };
      const { supabase, rpc } = buildSupabaseRpc(response);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await leavePlan('plan-43');

      expect(result).toEqual(response);
      expect(rpc).toHaveBeenCalledWith('leave_plan', { _plan_id: 'plan-43' });
    });
  });
});
