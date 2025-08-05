// src/hooks/budget/useBudgetSupabase.test.ts

import { renderHook, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useBudget } from './useBudgetSupabase';

const mockFrom = vi.fn();
vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: (table: string) => mockFrom(table) },
}));

describe('useBudgetSupabase', () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  test('sets persistError when Supabase fails', async () => {
    const selectBudget = vi.fn().mockResolvedValue({ data: { budget: 0 }, error: null });
    const selectEntries = vi.fn().mockResolvedValue({ data: [], error: null });
    const upsertBudget = vi.fn().mockResolvedValue({ error: new Error('boom') });
    const deleteEntries = vi.fn().mockResolvedValue({ error: null });
    const insertEntries = vi.fn().mockResolvedValue({ error: null });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'budget') {
        return {
          select: () => ({ eq: () => ({ single: () => selectBudget() }) }),
          upsert: () => upsertBudget(),
        } as unknown;
      }
      if (table === 'budget_entries') {
        return {
          select: () => ({ eq: () => selectEntries() }),
          delete: () => ({ eq: () => deleteEntries() }),
          insert: () => insertEntries(),
        } as unknown;
      }
      return {} as unknown;
    });

    const { result } = renderHook(() => useBudget('p1', 0));
    await waitFor(() => expect(result.current.hasLoaded).toBe(true));

    act(() => {
      result.current.setDesc('Coffee');
      result.current.setAmount(5);
      result.current.handleAdd();
    });

    await waitFor(() => expect(result.current.persistError).toBe('Failed to persist budget'));
  });
});
