import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';
import {
  createBudgetEntry,
  deleteBudgetEntry,
  fetchPlanBudgetEntries,
  fetchPlanBudgetRow,
  updateBudgetEntry,
  updatePlanBudget,
} from '@/features/app/planner/server/repositories/BudgetRepository';

vi.mock('@/shared/lib/supabaseServer', () => ({
  createSupabaseServerClient: vi.fn(),
}));

type SupabaseResult<T> = {
  data: T | null;
  error: unknown;
};

type BudgetPlanRow = {
  budget: number | null;
};

type BudgetEntryRow = {
  id: string;
  description: string | null;
  category: string | null;
  amount: number | null;
};

interface SingleQueryChain<T> {
  select: ReturnType<typeof vi.fn<(columns: string) => SingleQueryChain<T>>>;
  eq: ReturnType<typeof vi.fn<(column: string, value: unknown) => SingleQueryChain<T>>>;
  single: ReturnType<typeof vi.fn<() => Promise<SupabaseResult<T>>>>;
}

interface EntryQueryChain<T> {
  select: ReturnType<typeof vi.fn<(columns: string) => EntryQueryChain<T>>>;
  eq: ReturnType<typeof vi.fn<(column: string, value: unknown) => Promise<SupabaseResult<T>>>>;
}

interface UpdateQueryChain<T> {
  update: ReturnType<typeof vi.fn<(payload: unknown) => UpdateQueryChain<T>>>;
  eq: ReturnType<typeof vi.fn<(column: string, value: unknown) => UpdateQueryChain<T>>>;
  select: ReturnType<typeof vi.fn<(columns: string) => UpdateQueryChain<T>>>;
  single: ReturnType<typeof vi.fn<() => Promise<SupabaseResult<T>>>>;
}

interface InsertQueryChain<T> {
  insert: ReturnType<typeof vi.fn<(payload: unknown) => InsertQueryChain<T>>>;
  select: ReturnType<typeof vi.fn<(columns: string) => InsertQueryChain<T>>>;
  single: ReturnType<typeof vi.fn<() => Promise<SupabaseResult<T>>>>;
}

interface UpdateOnlyQueryChain {
  update: ReturnType<typeof vi.fn<(payload: unknown) => UpdateOnlyQueryChain>>;
  eq: ReturnType<typeof vi.fn<(column: string, value: unknown) => Promise<{ error: unknown }>>>;
}

interface DeleteQueryChain {
  delete: ReturnType<typeof vi.fn<() => DeleteQueryChain>>;
  eq: ReturnType<typeof vi.fn<(column: string, value: unknown) => Promise<{ error: unknown }>>>;
}

function buildSingleQuery<T>(result: SupabaseResult<T>) {
  const chain = {
    select: vi.fn<(columns: string) => SingleQueryChain<T>>(),
    eq: vi.fn<(column: string, value: unknown) => SingleQueryChain<T>>(),
    single: vi.fn<() => Promise<SupabaseResult<T>>>(),
  } as unknown as SingleQueryChain<T>;

  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.single.mockResolvedValue(result);

  return chain;
}

function buildEntryQuery<T>(result: SupabaseResult<T>) {
  const eq = vi.fn().mockResolvedValue(result);
  const select = vi.fn().mockReturnValue({ eq });
  return { select, eq } as EntryQueryChain<T>;
}

function buildUpdateQuery<T>(result: SupabaseResult<T>) {
  const chain = {
    update: vi.fn<(payload: unknown) => UpdateQueryChain<T>>(),
    eq: vi.fn<(column: string, value: unknown) => UpdateQueryChain<T>>(),
    select: vi.fn<(columns: string) => UpdateQueryChain<T>>(),
    single: vi.fn<() => Promise<SupabaseResult<T>>>(),
  } as unknown as UpdateQueryChain<T>;

  chain.update.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.select.mockReturnValue(chain);
  chain.single.mockResolvedValue(result);

  return chain;
}

function buildInsertQuery<T>(result: SupabaseResult<T>) {
  const chain = {
    insert: vi.fn<(payload: unknown) => InsertQueryChain<T>>(),
    select: vi.fn<(columns: string) => InsertQueryChain<T>>(),
    single: vi.fn<() => Promise<SupabaseResult<T>>>(),
  } as unknown as InsertQueryChain<T>;

  chain.insert.mockReturnValue(chain);
  chain.select.mockReturnValue(chain);
  chain.single.mockResolvedValue(result);

  return chain;
}

function buildUpdateOnlyQuery(result: { error: unknown }) {
  const eq = vi.fn().mockResolvedValue(result);
  const update = vi.fn().mockReturnValue({ eq });
  return { update, eq } as UpdateOnlyQueryChain;
}

function buildDeleteQuery(result: { error: unknown }) {
  const eq = vi.fn().mockResolvedValue(result);
  const remove = vi.fn().mockReturnValue({ eq });
  return { delete: remove, eq } as DeleteQueryChain;
}

function buildSupabaseFrom<T>(table: string, chain: T) {
  const from = vi.fn((tableName: string) => {
    if (tableName === table) return chain;
    throw new Error(`Unexpected table ${tableName}`);
  });

  const supabase = { from } as unknown as ReturnType<typeof createSupabaseServerClient>;
  return { supabase, from };
}

describe('BudgetRepository', () => {
  beforeEach(() => {
    vi.mocked(createSupabaseServerClient).mockReset();
  });

  describe('fetchPlanBudgetRow', () => {
    it('returns the plan budget row', async () => {
      const planQuery = buildSingleQuery<BudgetPlanRow>({
        data: { budget: 500 },
        error: null,
      });
      const { supabase, from } = buildSupabaseFrom('plans', planQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await fetchPlanBudgetRow('plan-1');

      expect(result).toEqual({ budget: 500 });
      expect(from).toHaveBeenCalledWith('plans');
      expect(planQuery.select).toHaveBeenCalledWith('budget');
      expect(planQuery.eq).toHaveBeenCalledWith('id', 'plan-1');
    });

    it('returns null when no budget row exists', async () => {
      const planQuery = buildSingleQuery<BudgetPlanRow>({ data: null, error: null });
      const { supabase } = buildSupabaseFrom('plans', planQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await fetchPlanBudgetRow('plan-2');

      expect(result).toBeNull();
    });

    it('throws a formatted error when Supabase fails', async () => {
      const failure = new Error('budget failure');
      const planQuery = buildSingleQuery<BudgetPlanRow>({ data: null, error: failure });
      const { supabase } = buildSupabaseFrom('plans', planQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      try {
        await fetchPlanBudgetRow('plan-3');
        throw new Error('Expected fetchPlanBudgetRow to throw');
      } catch (error) {
        if (!(error instanceof Error)) {
          throw new Error('Expected an Error instance');
        }
        expect(error.message).toContain('fetchPlanBudgetRow');
        expect(error.message).toContain('planId=plan-3');
      }
    });
  });

  describe('fetchPlanBudgetEntries', () => {
    it('returns budget entries', async () => {
      const entries: BudgetEntryRow[] = [
        { id: 'entry-1', description: 'Taxi', category: 'transport', amount: 30 },
      ];
      const entryQuery = buildEntryQuery<BudgetEntryRow[]>({ data: entries, error: null });
      const { supabase, from } = buildSupabaseFrom('budget_entries', entryQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await fetchPlanBudgetEntries('plan-4');

      expect(result).toEqual(entries);
      expect(from).toHaveBeenCalledWith('budget_entries');
      expect(entryQuery.select).toHaveBeenCalledWith('id, description, category, amount');
      expect(entryQuery.eq).toHaveBeenCalledWith('plan_id', 'plan-4');
    });

    it('returns an empty list when no entries exist', async () => {
      const entryQuery = buildEntryQuery<BudgetEntryRow[]>({ data: null, error: null });
      const { supabase } = buildSupabaseFrom('budget_entries', entryQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await fetchPlanBudgetEntries('plan-5');

      expect(result).toEqual([]);
    });

    it('throws a formatted error when Supabase fails', async () => {
      const failure = new Error('entry failure');
      const entryQuery = buildEntryQuery<BudgetEntryRow[]>({ data: null, error: failure });
      const { supabase } = buildSupabaseFrom('budget_entries', entryQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      try {
        await fetchPlanBudgetEntries('plan-6');
        throw new Error('Expected fetchPlanBudgetEntries to throw');
      } catch (error) {
        if (!(error instanceof Error)) {
          throw new Error('Expected an Error instance');
        }
        expect(error.message).toContain('fetchPlanBudgetEntries');
        expect(error.message).toContain('planId=plan-6');
      }
    });
  });

  describe('updatePlanBudget', () => {
    it('returns the updated budget row', async () => {
      const updateQuery = buildUpdateQuery<BudgetPlanRow>({
        data: { budget: 900 },
        error: null,
      });
      const { supabase, from } = buildSupabaseFrom('plans', updateQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await updatePlanBudget('plan-7', 900);

      expect(result).toEqual({ budget: 900 });
      expect(from).toHaveBeenCalledWith('plans');
      expect(updateQuery.update).toHaveBeenCalledWith({ budget: 900 });
      expect(updateQuery.eq).toHaveBeenCalledWith('id', 'plan-7');
      expect(updateQuery.select).toHaveBeenCalledWith('budget');
    });

    it('throws a formatted error when Supabase fails', async () => {
      const failure = new Error('update failure');
      const updateQuery = buildUpdateQuery<BudgetPlanRow>({ data: null, error: failure });
      const { supabase } = buildSupabaseFrom('plans', updateQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      try {
        await updatePlanBudget('plan-8', 1000);
        throw new Error('Expected updatePlanBudget to throw');
      } catch (error) {
        if (!(error instanceof Error)) {
          throw new Error('Expected an Error instance');
        }
        expect(error.message).toContain('updatePlanBudget');
        expect(error.message).toContain('planId=plan-8');
      }
    });
  });

  describe('createBudgetEntry', () => {
    it('returns the new entry id', async () => {
      const insertQuery = buildInsertQuery<{ id: string }>({
        data: { id: 'entry-2' },
        error: null,
      });
      const { supabase, from } = buildSupabaseFrom('budget_entries', insertQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await createBudgetEntry(
        'plan-9',
        { description: 'Lunch', category: 'food', amount: 20 }
      );

      expect(result).toEqual({ id: 'entry-2' });
      expect(from).toHaveBeenCalledWith('budget_entries');
      expect(insertQuery.insert).toHaveBeenCalledWith({
        plan_id: 'plan-9',
        description: 'Lunch',
        category: 'food',
        amount: 20,
      });
      expect(insertQuery.select).toHaveBeenCalledWith('id');
    });

    it('throws a formatted error when Supabase fails', async () => {
      const failure = new Error('insert failure');
      const insertQuery = buildInsertQuery<{ id: string }>({ data: null, error: failure });
      const { supabase } = buildSupabaseFrom('budget_entries', insertQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      try {
        await createBudgetEntry(
          'plan-10',
          { description: 'Taxi', category: 'transport', amount: 50 }
        );
        throw new Error('Expected createBudgetEntry to throw');
      } catch (error) {
        if (!(error instanceof Error)) {
          throw new Error('Expected an Error instance');
        }
        expect(error.message).toContain('createBudgetEntry');
        expect(error.message).toContain('planId=plan-10');
      }
    });

    it('throws a formatted error when no row is returned', async () => {
      const insertQuery = buildInsertQuery<{ id: string }>({ data: null, error: null });
      const { supabase } = buildSupabaseFrom('budget_entries', insertQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      try {
        await createBudgetEntry(
          'plan-11',
          { description: 'Hotel', category: 'lodging', amount: 200 }
        );
        throw new Error('Expected createBudgetEntry to throw');
      } catch (error) {
        if (!(error instanceof Error)) {
          throw new Error('Expected an Error instance');
        }
        expect(error.message).toContain('createBudgetEntry:missing-row');
        expect(error.message).toContain('planId=plan-11');
      }
    });
  });

  describe('updateBudgetEntry', () => {
    it('updates the budget entry', async () => {
      const updateQuery = buildUpdateOnlyQuery({ error: null });
      const { supabase, from } = buildSupabaseFrom('budget_entries', updateQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      await updateBudgetEntry('entry-3', {
        description: 'Dinner',
        category: 'food',
        amount: 45,
      });

      expect(from).toHaveBeenCalledWith('budget_entries');
      expect(updateQuery.update).toHaveBeenCalledWith({
        description: 'Dinner',
        category: 'food',
        amount: 45,
      });
      expect(updateQuery.eq).toHaveBeenCalledWith('id', 'entry-3');
    });

    it('throws a formatted error when Supabase fails', async () => {
      const failure = new Error('update entry failure');
      const updateQuery = buildUpdateOnlyQuery({ error: failure });
      const { supabase } = buildSupabaseFrom('budget_entries', updateQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      try {
        await updateBudgetEntry('entry-4', {
          description: 'Train',
          category: 'transport',
          amount: 60,
        });
        throw new Error('Expected updateBudgetEntry to throw');
      } catch (error) {
        if (!(error instanceof Error)) {
          throw new Error('Expected an Error instance');
        }
        expect(error.message).toContain('updateBudgetEntry');
        expect(error.message).toContain('entryId=entry-4');
      }
    });
  });

  describe('deleteBudgetEntry', () => {
    it('deletes the budget entry', async () => {
      const deleteQuery = buildDeleteQuery({ error: null });
      const { supabase, from } = buildSupabaseFrom('budget_entries', deleteQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      await deleteBudgetEntry('entry-5');

      expect(from).toHaveBeenCalledWith('budget_entries');
      expect(deleteQuery.delete).toHaveBeenCalledWith();
      expect(deleteQuery.eq).toHaveBeenCalledWith('id', 'entry-5');
    });

    it('throws a formatted error when Supabase fails', async () => {
      const failure = new Error('delete failure');
      const deleteQuery = buildDeleteQuery({ error: failure });
      const { supabase } = buildSupabaseFrom('budget_entries', deleteQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      try {
        await deleteBudgetEntry('entry-6');
        throw new Error('Expected deleteBudgetEntry to throw');
      } catch (error) {
        if (!(error instanceof Error)) {
          throw new Error('Expected an Error instance');
        }
        expect(error.message).toContain('deleteBudgetEntry');
        expect(error.message).toContain('entryId=entry-6');
      }
    });
  });
});
