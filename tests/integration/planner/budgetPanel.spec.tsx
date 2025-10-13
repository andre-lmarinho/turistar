import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';

let mockDays: DayPlan[] = [];

const mockFrom = vi.fn();
vi.mock('@/shared/lib/supabaseClient', () => ({
  supabase: { from: (table: string) => mockFrom(table) },
}));

vi.mock('@/features/planner/hooks/PlannerContext', async () => {
  const actual = await vi.importActual<typeof import('@/features/planner/hooks/PlannerContext')>(
    '@/features/planner/hooks/PlannerContext'
  );
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
    }),
  };
});

import { PlannerProvider } from '@/features/planner/hooks/PlannerContext';
import { BudgetBoard } from '@/features/planner/components/budget/BudgetBoard';

describe('budget panel', () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  it('adds expenses and updates totals', async () => {
    const selectBudget = vi.fn().mockResolvedValue({ data: { budget: 0 }, error: null });
    const selectEntries = vi.fn().mockResolvedValue({ data: [], error: null });
    const updateBudget = vi.fn().mockResolvedValue({ error: null });
    const insertEntry = vi.fn().mockResolvedValue({ data: { id: 'e1' }, error: null });

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
        } as unknown;
      }
      return {} as unknown;
    });

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
    expect(updateBudget).not.toHaveBeenCalled();
    expect(screen.queryByText('Failed to persist budget')).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Description'), {
      target: { value: 'Taxi' },
    });
    fireEvent.change(screen.getByPlaceholderText('Amount'), {
      target: { value: '50' },
    });
    fireEvent.click(screen.getByLabelText('Add expense'));

    await waitFor(() => expect(insertEntry).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByLabelText('Total spent: $75.00')).toBeInTheDocument());
  });
});
