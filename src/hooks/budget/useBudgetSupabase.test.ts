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

  test('sets persistError when upsert fails', async () => {
    const selectBudget = vi
      .fn()
      .mockResolvedValue({ data: { budget: 0, entries: [] }, error: null });
    const upsertBudget = vi.fn().mockResolvedValue({ error: new Error('boom') });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'budget') {
        return {
          select: () => ({ eq: () => ({ single: () => selectBudget() }) }),
          upsert: () => upsertBudget(),
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
