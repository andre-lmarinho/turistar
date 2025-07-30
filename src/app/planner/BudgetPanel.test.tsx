// src/app/planner/BudgetPanel.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BudgetPanel from '@/app/planner/BudgetPanel';
import { vi } from 'vitest';
import type { DayPlan } from '@/types';
let mockCtx: { planId: string; days: DayPlan[]; updateActivity: (id: string, p: any) => void };
vi.mock('@/contexts/PlannerContext', () => ({
  usePlannerContext: () => mockCtx,
}));

describe('BudgetPanel', () => {
  it('renders without crashing', () => {
    const days = [{ id: 'd1', label: 'Day 1', activities: [] }];
    mockCtx = { planId: 'test', days, updateActivity: vi.fn() };
    render(<BudgetPanel />);
    expect(screen.getByText('Traveling Budget')).toBeInTheDocument();
  });
});
