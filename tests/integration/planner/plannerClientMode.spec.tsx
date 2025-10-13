import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

type Mode = 'planner' | 'map' | 'budget';

vi.mock('@/features/planner/ui/buttons/ModeToggleButton', () => ({
  __esModule: true,
  ModeToggleButton: ({ onChange }: { value: Mode; onChange: (m: Mode) => void }) => (
    <div>
      <button onClick={() => onChange('planner')}>Planner</button>
      <button onClick={() => onChange('map')}>Map</button>
      <button onClick={() => onChange('budget')}>Budget</button>
    </div>
  ),
}));

vi.mock('@/shared/ui/calendar', () => ({
  __esModule: true,
  DateRangePicker: () => <div />, // not used
  DateRangePickerIcon: () => <div />, // not used
}));

vi.mock('@/features/planner/components/dialog/ActivityDialog', () => ({
  __esModule: true,
  ActivityDialog: () => null,
}));

vi.mock('@/features/planner/hooks/PlannerContext', () => ({
  __esModule: true,
  PlannerProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  usePlannerContext: () => ({
    planId: 'p1',
    dest: 'rome',
    days: [],
    currentRange: undefined,
    handleRangeChange: vi.fn(),
    addBlankAndSelect: vi.fn(),
    sensors: undefined,
    collisionDetection: vi.fn(),
    handleDragStart: vi.fn(),
    handleDragOver: vi.fn(),
    handleDragEnd: vi.fn(),
    setSelectedActivity: vi.fn(),
    changeDay: vi.fn(),
    changePosition: vi.fn(),
    changeColor: vi.fn(),
    removeActivity: vi.fn(),
    updateActivity: vi.fn(),
    selectedActivity: null,
  }),
}));

vi.mock('@/features/planner/hooks/usePlanTitleSupabase', () => ({
  __esModule: true,
  usePlanTitle: () => ({ title: 'Trip', setTitle: vi.fn(), saveTitle: vi.fn() }),
}));

vi.mock('@/features/planner/components/onboarding/OnboardingDialog', () => ({
  __esModule: true,
  OnboardingDialog: () => null,
}));

vi.mock('@/features/planner/hooks/onboarding/OnboardingContext', () => ({
  __esModule: true,
  OnboardingProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useOnboardingContext: () => ({ showOnboarding: false, setShowOnboarding: vi.fn() }),
}));

vi.mock('@/features/planner/components/dnd/PlannerBoard', () => ({
  __esModule: true,
  PlannerBoard: () => <div data-testid="planner-board" />,
}));
vi.mock('@/features/planner/components/map/MapBoard', () => ({
  __esModule: true,
  MapBoard: () => <div data-testid="map-view" />,
}));
vi.mock('@/features/planner/components/budget/BudgetBoard', () => ({
  __esModule: true,
  BudgetBoard: () => <div data-testid="budget-panel" />,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

import { PlannerClient } from '@/features/planner/components/PlannerClient';

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
