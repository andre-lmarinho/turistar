import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import type { DayPlan } from '@/features/app/planner/domain/types/PlannerEntities';

let mockDays: DayPlan[] = [];

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

vi.mock('@/features/app/planner/hooks/PlannerContext', async () => {
  const actual = await vi.importActual<
    typeof import('@/features/app/planner/hooks/PlannerContext')
  >('@/features/app/planner/hooks/PlannerContext');
  return {
    ...actual,
    PlannerProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    usePlannerContext: () => ({
      planId: 'p1',
      days: mockDays,
      updateActivity: vi.fn(),
      setSelectedActivity: vi.fn(),
      changeDay: vi.fn(),
      changePosition: vi.fn(),
      changeColor: vi.fn(),
      insertActivityAt: vi.fn(),
      replaceActivity: vi.fn(),
      removeActivity: vi.fn(),
      addBlankAndSelect: vi.fn(),
      sensors: undefined,
      collisionDetection: vi.fn(),
      handleDragStart: vi.fn(),
      handleDragOver: vi.fn(),
      handleDragEnd: vi.fn(),
      selectedActivity: null,
      setDays: vi.fn(),
      currentRange: undefined,
      handleRangeChange: vi.fn(),
      canEdit: true,
    }),
  };
});

import { PlannerProvider } from '@/features/app/planner/hooks/PlannerContext';
import { BudgetBoard } from '@/features/app/planner/components/budget/BudgetBoard';

describe('budget panel', () => {
  beforeEach(() => {
    mocks.getPlanBudget.mockReset();
    mocks.updatePlanBudget.mockReset();
    mocks.createBudgetEntry.mockReset();
    mocks.updateBudgetEntry.mockReset();
    mocks.deleteBudgetEntry.mockReset();
  });

  it('adds expenses and updates totals', async () => {
    mocks.getPlanBudget.mockResolvedValue({ budget: 0, entries: [] });
    mocks.updatePlanBudget.mockResolvedValue(0);
    mocks.createBudgetEntry.mockResolvedValue('e1');

    mockDays = [
      {
        id: 'd1',
        label: 'Day 1',
        activities: [{ id: 'a1', title: 'Act', color: 'bg-[var(--color-1)]', budget: 25 }],
      },
    ];

    render(
      <PlannerProvider planId="p1">
        <BudgetBoard />
      </PlannerProvider>
    );

    await waitFor(() => expect(screen.getByLabelText('Total spent: $25.00')).toBeInTheDocument());
    expect(mocks.updatePlanBudget).not.toHaveBeenCalled();
    expect(screen.queryByText('Failed to persist budget')).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Description'), {
      target: { value: 'Taxi' },
    });
    fireEvent.change(screen.getByPlaceholderText('Amount'), {
      target: { value: '50' },
    });
    fireEvent.click(screen.getByLabelText('Add expense'));

    await waitFor(() => expect(mocks.createBudgetEntry).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByLabelText('Total spent: $75.00')).toBeInTheDocument());
  });
});
