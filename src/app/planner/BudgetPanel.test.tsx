// src/app/planner/BudgetPanel.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BudgetPanel from '@/app/planner/BudgetPanel';
import { PlannerProvider } from '@/contexts';
import { vi } from 'vitest';
import type { DayPlan } from '@/types';

let mockDays: DayPlan[] = [];

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
  it('adds expenses and updates totals', () => {
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
    fireEvent.change(screen.getByPlaceholderText('Description'), {
      target: { value: 'Taxi' },
    });
    fireEvent.change(screen.getByPlaceholderText('Amount'), {
      target: { value: '50' },
    });
    fireEvent.click(screen.getByLabelText('Add expense'));
    expect(screen.getByText(/\$\s*75\.00/)).toBeInTheDocument();
  });
});
