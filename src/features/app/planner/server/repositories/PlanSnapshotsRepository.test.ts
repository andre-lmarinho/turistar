import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';
import { fetchPlanSnapshot } from './PlanSnapshotsRepository';

vi.mock('@/shared/lib/supabaseServer', () => ({
  createSupabaseServerClient: vi.fn(),
}));

type SupabaseResult<T> = {
  data: T | null;
  error: unknown;
};

type PlanSnapshotRow = {
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

function buildSupabaseFrom<T>(table: string, chain: T) {
  const from = vi.fn((tableName: string) => {
    if (tableName === table) return chain;
    throw new Error(`Unexpected table ${tableName}`);
  });

  const supabase = { from } as unknown as ReturnType<typeof createSupabaseServerClient>;
  return { supabase, from };
}

describe('PlanSnapshotsRepository', () => {
  beforeEach(() => {
    vi.mocked(createSupabaseServerClient).mockReset();
  });

  it('returns the snapshot row', async () => {
    const row: PlanSnapshotRow = {
      plan_id: 'plan-1',
      version: 2,
      state: { days: [] },
      updated_at: '2024-01-01T00:00:00.000Z',
    };
    const snapshotQuery = buildMaybeSingleQuery<PlanSnapshotRow>({ data: row, error: null });
    const { supabase, from } = buildSupabaseFrom('plan_snapshots', snapshotQuery);
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

    const result = await fetchPlanSnapshot('plan-1');

    expect(result).toEqual(row);
    expect(from).toHaveBeenCalledWith('plan_snapshots');
    expect(snapshotQuery.select).toHaveBeenCalledWith('plan_id, version, state, updated_at');
    expect(snapshotQuery.eq).toHaveBeenCalledWith('plan_id', 'plan-1');
  });

  it('returns null when no snapshot exists', async () => {
    const snapshotQuery = buildMaybeSingleQuery<PlanSnapshotRow>({ data: null, error: null });
    const { supabase } = buildSupabaseFrom('plan_snapshots', snapshotQuery);
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

    const result = await fetchPlanSnapshot('plan-2');

    expect(result).toBeNull();
  });

  it('throws a formatted error when Supabase fails', async () => {
    const failure = new Error('snapshot failure');
    const snapshotQuery = buildMaybeSingleQuery<PlanSnapshotRow>({ data: null, error: failure });
    const { supabase } = buildSupabaseFrom('plan_snapshots', snapshotQuery);
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

    try {
      await fetchPlanSnapshot('plan-3');
      throw new Error('Expected fetchPlanSnapshot to throw');
    } catch (error) {
      if (!(error instanceof Error)) {
        throw new Error('Expected an Error instance');
      }
      expect(error.message).toContain('fetchPlanSnapshot');
      expect(error.message).toContain('planId=plan-3');
    }
  });
});
