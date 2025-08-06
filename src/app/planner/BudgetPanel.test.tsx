// src/app/planner/BudgetPanel.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BudgetPanel from '@/app/planner/BudgetPanel';
import { PlannerProvider } from '@/contexts';
import { vi } from 'vitest';
import type { DayPlan } from '@/types';

let mockDays: DayPlan[] = [];

const mockFrom = vi.fn();
vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: (table: string) => mockFrom(table) },
}));

vi.mock('@/hooks', async () => {
  const actual = await vi.importActual<typeof import('@/hooks')>('@/hooks');
  return {
    ...actual,
    usePlanner: () => ({
      planId: 'test',
      dest: 'rome',
      days: mockDays,
      destCoords: null,
      setDays: vi.fn(),
      currentRange: undefined,
      handleRangeChange: vi.fn(),
      activeId: null,
      sensors: [],
      collisionDetection: vi.fn(),
      handleDragStart: vi.fn(),
      handleDragOver: vi.fn(),
      handleDragEnd: vi.fn(),
      addActivity: vi.fn(),
      removeActivity: vi.fn(),
      updateActivity: vi.fn(),
      addBlankActivity: vi.fn(),
    }),
    useSelectedActivity: () => ({
      selectedActivity: null,
      setSelectedActivity: vi.fn(),
      changeDay: vi.fn(),
      changePosition: vi.fn(),
      addBlankAndSelect: vi.fn(),
      closeModal: vi.fn(),
      save: vi.fn(),
      deleteActivity: vi.fn(),
      changeColor: vi.fn(),
    }),
  };
});

describe('BudgetPanel', () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  it('adds expenses and updates totals', async () => {
    const selectBudget = vi.fn().mockResolvedValue({ data: { budget: 0 }, error: null });
    const selectEntries = vi.fn().mockResolvedValue({ data: [], error: null });
    const upsertBudget = vi.fn().mockResolvedValue({ error: new Error('fail') });
    const insertEntry = vi.fn().mockResolvedValue({ data: { id: 'e1' }, error: null });
    const updateEntry = vi.fn().mockResolvedValue({ error: null });
    const deleteEntry = vi.fn().mockResolvedValue({ error: null });

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
          insert: () => ({ select: () => ({ single: () => insertEntry() }) }),
          update: () => ({ eq: () => updateEntry() }),
          delete: () => ({ eq: () => deleteEntry() }),
        } as unknown;
      }
      return {} as unknown;
    });

    mockDays = [
      {
        id: 'd1',
        label: 'Day 1',
        activities: [{ id: 'a1', title: 'Act', color: 'red', budget: 25 }],
      },
    ];
    render(
      <PlannerProvider planId="p1">
        <BudgetPanel />
      </PlannerProvider>
    );
    await waitFor(() => expect(screen.getAllByText(/\$\s*25\.00/).length).toBeGreaterThan(0));
    expect(upsertBudget).not.toHaveBeenCalled();
    expect(screen.queryByText('Failed to persist budget')).not.toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Description'), {
      target: { value: 'Taxi' },
    });
    fireEvent.change(screen.getByPlaceholderText('Amount'), {
      target: { value: '50' },
    });
    fireEvent.click(screen.getByLabelText('Add expense'));
    await waitFor(() => expect(screen.getByText(/\$\s*75\.00/)).toBeInTheDocument());
  });
});
