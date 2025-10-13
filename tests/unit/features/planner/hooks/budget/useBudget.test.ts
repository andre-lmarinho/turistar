import { renderHook, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useBudget } from '@/features/planner/hooks/budget/useBudget';

const mockFrom = vi.fn();
vi.mock('@/shared/lib/supabaseClient', () => ({
  supabase: { from: (table: string) => mockFrom(table) },
}));

describe('useBudget hook', () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  test('does not persist budget on initial load', async () => {
    const selectBudget = vi.fn().mockResolvedValue({ data: { budget: 100 }, error: null });
    const selectEntries = vi.fn().mockResolvedValue({ data: [], error: null });
    const updateBudget = vi.fn().mockResolvedValue({ error: new Error('fail') });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'plans') {
        return {
          select: () => ({ eq: () => ({ single: () => selectBudget() }) }),
          update: () => ({ eq: () => updateBudget() }),
        } as unknown;
      }
      if (table === 'budget_entries') {
        return {
          select: () => ({ eq: () => selectEntries() }),
        } as unknown;
      }
      return {} as unknown;
    });

    const { result } = renderHook(() => useBudget('p1', 0));
    await waitFor(() => expect(result.current.hasLoaded).toBe(true));
    expect(updateBudget).not.toHaveBeenCalled();
    expect(result.current.persistError).toBeNull();
  });

  test('persists entries via budget_entries table', async () => {
    const selectBudget = vi.fn().mockResolvedValue({ data: { budget: 0 }, error: null });
    const selectEntries = vi.fn().mockResolvedValue({
      data: [{ id: 'e1', description: 'Lunch', category: 'food', amount: 10 }],
      error: null,
    });
    const updateBudget = vi.fn().mockResolvedValue({ error: null });
    const insertEntry = vi.fn().mockResolvedValue({ data: { id: 'e2' }, error: null });
    const updateEntry = vi.fn().mockResolvedValue({ error: null });
    const deleteEntry = vi.fn().mockResolvedValue({ error: null });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'plans') {
        return {
          select: () => ({ eq: () => ({ single: () => selectBudget() }) }),
          update: () => ({ eq: () => updateBudget() }),
        } as unknown;
      }
      if (table === 'budget_entries') {
        return {
          select: () => ({ eq: () => selectEntries() }),
          insert: () => ({ select: () => ({ single: () => insertEntry() }) }),
          update: () => ({ eq: () => updateEntry() }),
          delete: () => ({ eq: () => deleteEntry() }),
        } as unknown;
      }
      return {} as unknown;
    });

    const { result } = renderHook(() => useBudget('p1', 0));
    await waitFor(() => expect(result.current.hasLoaded).toBe(true));
    expect(result.current.entries).toHaveLength(1);

    await act(async () => {
      result.current.setDesc('Coffee');
      result.current.setCat('food');
      result.current.setAmount(5);
    });
    await act(async () => {
      await result.current.handleAdd();
    });
    expect(insertEntry).toHaveBeenCalled();
    expect(result.current.entries).toHaveLength(2);

    await act(async () => {
      const updated = { ...result.current.entries[0], amount: 12 };
      await result.current.handleUpdateEntry(0, updated);
    });
    expect(updateEntry).toHaveBeenCalled();

    await act(async () => {
      await result.current.handleDeleteEntry(0);
    });
    expect(deleteEntry).toHaveBeenCalled();
  });

  test('sets persistError when Supabase insert fails', async () => {
    const selectBudget = vi.fn().mockResolvedValue({ data: { budget: 0 }, error: null });
    const selectEntries = vi.fn().mockResolvedValue({ data: [], error: null });
    const updateBudget = vi.fn().mockResolvedValue({ error: null });
    const insertEntry = vi.fn().mockResolvedValue({ data: null, error: new Error('boom') });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'plans') {
        return {
          select: () => ({ eq: () => ({ single: () => selectBudget() }) }),
          update: () => ({ eq: () => updateBudget() }),
        } as unknown;
      }
      if (table === 'budget_entries') {
        return {
          select: () => ({ eq: () => selectEntries() }),
          insert: () => ({ select: () => ({ single: () => insertEntry() }) }),
          update: () => ({ eq: () => ({}) }),
          delete: () => ({ eq: () => ({}) }),
        } as unknown;
      }
      return {} as unknown;
    });

    const { result } = renderHook(() => useBudget('p1', 0));
    await waitFor(() => expect(result.current.hasLoaded).toBe(true));

    await act(async () => {
      result.current.setDesc('Coffee');
      result.current.setAmount(5);
    });
    await act(async () => {
      await result.current.handleAdd();
    });

    await waitFor(() => expect(result.current.persistError).toBe('Failed to persist budget'));
  });
});
