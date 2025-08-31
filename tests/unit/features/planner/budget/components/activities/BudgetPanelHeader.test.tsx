// tests/unit/features/planner/budget/components/activities/BudgetPanelHeader.test.tsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import BudgetPanelHeader from '@/features/planner/components/budget/BudgetPanelHeader';
import { BudgetProvider } from '@/features/planner/hooks';

const mockFrom = vi.fn();
vi.mock('@/shared/lib/supabaseClient', () => ({
  supabase: { from: (table: string) => mockFrom(table) },
}));

describe('BudgetPanelHeader', () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  it('displays stored plan budget on load', async () => {
    const selectBudget = vi.fn().mockResolvedValue({ data: { budget: 123 }, error: null });
    const selectEntries = vi.fn().mockResolvedValue({ data: [], error: null });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'plans') {
        return {
          select: () => ({ eq: () => ({ single: () => selectBudget() }) }),
          update: () => ({ eq: () => ({ error: null }) }),
        } as unknown;
      }
      if (table === 'budget_entries') {
        return {
          select: () => ({ eq: () => selectEntries() }),
          insert: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        } as unknown;
      }
      return {} as unknown;
    });

    render(
      <BudgetProvider planId="p1" activitiesTotal={0}>
        <BudgetPanelHeader />
      </BudgetProvider>
    );

    await waitFor(() => expect(screen.getByPlaceholderText('Budget')).toHaveValue('123'));
  });
});
