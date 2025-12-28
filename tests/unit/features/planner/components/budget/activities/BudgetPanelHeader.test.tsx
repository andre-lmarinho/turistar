import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BudgetPanelHeader } from '@/features/app/planner/components/budget/BudgetPanelHeader';
import { BudgetProvider } from '@/features/app/planner/hooks/BudgetContext';

const mocks = vi.hoisted(() => ({
  getPlanBudget: vi.fn(),
  updatePlanBudget: vi.fn(),
  createBudgetEntry: vi.fn(),
  updateBudgetEntry: vi.fn(),
  deleteBudgetEntry: vi.fn(),
}));

vi.mock('@/app/(webapp)/p/actions/plans/getPlanBudget', () => ({
  getPlanBudget: mocks.getPlanBudget,
}));
vi.mock('@/app/(webapp)/p/actions/plans/updatePlanBudget', () => ({
  updatePlanBudget: mocks.updatePlanBudget,
}));
vi.mock('@/app/(webapp)/p/actions/plans/createBudgetEntry', () => ({
  createBudgetEntry: mocks.createBudgetEntry,
}));
vi.mock('@/app/(webapp)/p/actions/plans/updateBudgetEntry', () => ({
  updateBudgetEntry: mocks.updateBudgetEntry,
}));
vi.mock('@/app/(webapp)/p/actions/plans/deleteBudgetEntry', () => ({
  deleteBudgetEntry: mocks.deleteBudgetEntry,
}));

describe('BudgetPanelHeader', () => {
  beforeEach(() => {
    mocks.getPlanBudget.mockReset();
    mocks.updatePlanBudget.mockReset();
    mocks.createBudgetEntry.mockReset();
    mocks.updateBudgetEntry.mockReset();
    mocks.deleteBudgetEntry.mockReset();
  });

  it('displays stored plan budget on load', async () => {
    mocks.getPlanBudget.mockResolvedValue({ budget: 123, entries: [] });

    render(
      <BudgetProvider planId="p1" activitiesTotal={0}>
        <BudgetPanelHeader />
      </BudgetProvider>
    );

    await waitFor(() => expect(screen.getByPlaceholderText('Budget')).toHaveValue('123'));
  });
});
