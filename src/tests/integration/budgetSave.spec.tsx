// src/tests/integration/budgetSave.spec.tsx

import { renderHook, act, waitFor } from '@testing-library/react';
import { useBudget } from '@/hooks/useBudget';

beforeEach(() => {
  localStorage.clear();
});

describe('budget persistence integration', () => {
  it('saves budget and entries to localStorage', async () => {
    const { result } = renderHook(() => useBudget('plan1', 0));

    act(() => {
      result.current.setBudget(200);
      result.current.setDesc('Taxi');
      result.current.setAmount(50);
      result.current.handleAdd();
    });

    await waitFor(() =>
      expect(localStorage.getItem('budget-plan1')).toBe(
        JSON.stringify({
          budget: 200,
          entries: [{ description: 'Taxi', category: 'transport', amount: 50 }],
        })
      )
    );
  });
});
