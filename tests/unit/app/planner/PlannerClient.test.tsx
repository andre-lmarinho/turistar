// tests/unit/app/planner/PlannerClient.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import type { DayPlan } from '@/shared/types';
import PlannerClient from '@/app/planner/PlannerClient';

let mockPlanId = 'plan1';

interface MockOpenPanelButtonProps {
  onClick: () => void;
  title?: string;
  days?: DayPlan[];
}

vi.mock('@/features/planner', async () => {
  const actual = await vi.importActual<typeof import('@/features/planner')>('@/features/planner');
  return {
    ...actual,
    usePlanner: () => ({
      planId: mockPlanId,
      dest: 'rome',
      days: [{ id: 'd1', label: 'Day 1', activities: [] }],
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
    usePlanTitle: () => ({ title: 'Trip', setTitle: vi.fn(), saveTitle: vi.fn() }),
    useSelectedActivity: () => ({
      selectedActivity: null,
      setSelectedActivity: vi.fn(),
      changeDay: vi.fn(),
      addBlankAndSelect: vi.fn(),
      closeModal: vi.fn(),
      save: vi.fn(),
      deleteActivity: vi.fn(),
      changeColor: vi.fn(),
    }),
    useActivitiesById: () => ({}),
    DestinationFilterPanel: () => null,
    PlannerControls: () => <div data-testid="planner-controls" />, // though not used
    ActivityModal: () => null,
  };
});

vi.mock('@/features/planner/hooks/usePlanParams', () => ({
  usePlanParams: () => ({ dest: 'rome', destCoords: null }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/app/planner/PlannerBoard', () => ({
  default: () => <div data-testid="board" />,
}));
vi.mock('@/app/planner/BudgetPanel', () => ({
  default: () => <div data-testid="budget" />,
}));
vi.mock('@/features/onboarding', () => ({
  OnboardingModal: () => {
    React.useEffect(() => {
      localStorage.setItem(`planner-onboarding-shown-${mockPlanId}`, 'true');
    }, []);
    return <div>Your planner is ready</div>;
  },
  OnboardingProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/shared/ui', async () => {
  const actual = await vi.importActual<typeof import('@/shared/ui')>('@/shared/ui');
  return {
    ...actual,
    DateRangePickerIcon: () => <div data-testid="date-picker" />,
    OpenPanelButton: ({ onClick }: MockOpenPanelButtonProps) => (
      <button onClick={onClick}>Open</button>
    ),
    OpenPanelIcon: ({ onClick }: { onClick: () => void }) => (
      <button onClick={onClick}>Open</button>
    ),
    ModeToggleButton: () => <div data-testid="mode-toggle" />,
  };
});

beforeEach(() => {
  localStorage.clear();
});

describe('PlannerClient onboarding', () => {
  it('shows onboarding for a new plan id even if another plan was seen', () => {
    localStorage.setItem('planner-onboarding-shown-plan1', 'true');
    mockPlanId = 'plan2';
    render(<PlannerClient title="Trip" />);
    expect(screen.getAllByText('Your planner is ready').length).toBeGreaterThan(0);
    expect(localStorage.getItem('planner-onboarding-shown-plan2')).toBe('true');
  });
});
