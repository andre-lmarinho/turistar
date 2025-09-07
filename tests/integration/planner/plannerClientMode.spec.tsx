// tests/integration/planner/plannerClientMode.spec.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

type Mode = 'planner' | 'map' | 'budget';

vi.mock('@/shared/ui', async () => {
  const actual = await vi.importActual<typeof import('@/shared/ui')>('@/shared/ui');
  return {
    ...actual,
    ModeToggleButton: ({ onChange }: { value: Mode; onChange: (m: Mode) => void }) => (
      <div>
        <button onClick={() => onChange('planner')}>Planner</button>
        <button onClick={() => onChange('map')}>Map</button>
        <button onClick={() => onChange('budget')}>Budget</button>
      </div>
    ),
    DateRangePicker: () => <div />,
    DateRangePickerIcon: () => <div />,
  };
});

vi.mock('@/features/planner', async () => {
  const React = await import('react');
  const { ModeToggleButton } = await import('@/shared/ui');
  return {
    PlannerProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    usePlannerContext: () => ({
      planId: 'p1',
      dest: 'rome',
      days: [],
      currentRange: undefined,
      handleRangeChange: vi.fn(),
      addBlankAndSelect: vi.fn(),
    }),
    usePlanTitle: () => ({ title: 'Trip', setTitle: vi.fn(), saveTitle: vi.fn() }),
    ActivityModal: () => null,
    PlannerControls: ({ mode, onModeChange }: { mode: Mode; onModeChange: (m: Mode) => void }) => (
      <div data-testid="planner-controls">
        <ModeToggleButton value={mode} onChange={onModeChange} />
      </div>
    ),
  };
});

vi.mock('@/features/onboarding', () => ({
  OnboardingModal: () => null,
  OnboardingProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/app/planner/PlannerBoard', () => ({
  default: () => <div data-testid="planner-board" />,
}));
vi.mock('@/app/planner/MapView', () => ({
  default: () => <div data-testid="map-view" />,
}));
vi.mock('@/app/planner/BudgetPanel', () => ({
  default: () => <div data-testid="budget-panel" />,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

import PlannerClient from '@/app/planner/PlannerClient';

describe('planner client mode switching', () => {
  it('shows only the active panel when toggling modes', async () => {
    render(<PlannerClient planId="p1" hideOnboarding />);

    const plannerBtn = screen.getByRole('button', { name: 'Planner' });
    const mapBtn = screen.getByRole('button', { name: 'Map' });
    const budgetBtn = screen.getByRole('button', { name: 'Budget' });

    const board = await screen.findByTestId('planner-board');
    const map = await screen.findByTestId('map-view');
    const budget = await screen.findByTestId('budget-panel');

    expect(board.parentElement).toHaveStyle({ pointerEvents: 'auto' });
    expect(map.parentElement).toHaveStyle({ pointerEvents: 'none' });
    expect(budget.parentElement).toHaveStyle({ pointerEvents: 'none' });

    fireEvent.click(mapBtn);
    expect(board.parentElement).toHaveStyle({ pointerEvents: 'none' });
    expect(map.parentElement).toHaveStyle({ pointerEvents: 'auto' });
    expect(budget.parentElement).toHaveStyle({ pointerEvents: 'none' });

    fireEvent.click(budgetBtn);
    expect(board.parentElement).toHaveStyle({ pointerEvents: 'none' });
    expect(map.parentElement).toHaveStyle({ pointerEvents: 'none' });
    expect(budget.parentElement).toHaveStyle({ pointerEvents: 'auto' });

    fireEvent.click(plannerBtn);
    expect(board.parentElement).toHaveStyle({ pointerEvents: 'auto' });
    expect(map.parentElement).toHaveStyle({ pointerEvents: 'none' });
    expect(budget.parentElement).toHaveStyle({ pointerEvents: 'none' });
  });
});
