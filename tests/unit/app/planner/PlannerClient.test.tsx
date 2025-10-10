// tests/unit/app/planner/PlannerClient.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import PlannerClient from '@/features/planner/components/PlannerClient';

let mockPlanId = 'plan1';

type OnboardingContextValue = {
  showOnboarding: boolean;
  setShowOnboarding: React.Dispatch<React.SetStateAction<boolean>>;
};

const onboardingMocks = vi.hoisted(() => {
  const React = require('react') as typeof import('react');

  const OnboardingContext = React.createContext<OnboardingContextValue>({
    showOnboarding: true,
    setShowOnboarding: () => undefined,
  });

  const useOnboardingContext = () => React.useContext(OnboardingContext);

  const OnboardingProvider = ({ children }: { children: React.ReactNode }) => {
    const [showOnboarding, setShowOnboarding] = React.useState(true);
    const value = React.useMemo(
      () => ({
        showOnboarding,
        setShowOnboarding,
      }),
      [showOnboarding, setShowOnboarding]
    );

    return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
  };

  const OnboardingDialog = () => {
    const { showOnboarding } = useOnboardingContext();
    const planId = mockPlanId;

    React.useEffect(() => {
      localStorage.setItem(`planner-onboarding-shown-${planId}`, 'true');
    }, [planId]);

    return showOnboarding ? <div>Your planner is ready</div> : null;
  };

  return { OnboardingProvider, useOnboardingContext, OnboardingDialog };
});

vi.mock('@/features/planner/hooks/PlannerContext', () => ({
  __esModule: true,
  PlannerProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  usePlannerContext: () => ({
    planId: mockPlanId,
    dest: 'rome',
    days: [{ id: 'd1', label: 'Day 1', activities: [] }],
    setDays: vi.fn(),
    currentRange: undefined,
    handleRangeChange: vi.fn(),
    addBlankAndSelect: vi.fn(),
    sensors: [],
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

vi.mock('@/features/planner/components/dialog/ActivityDialog', () => ({
  __esModule: true,
  default: () => null,
}));

vi.mock('@/features/planner/hooks/usePlanTitleSupabase', () => ({
  __esModule: true,
  usePlanTitle: () => ({ title: 'Trip', setTitle: vi.fn(), saveTitle: vi.fn() }),
}));

vi.mock('@/features/planner/hooks/budget/BudgetContext', () => ({
  __esModule: true,
  BudgetProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/features/planner/components/dnd/PlannerBoard', () => ({
  default: () => <div data-testid="board" />,
}));
vi.mock('@/features/planner/components/budget/BudgetBoard', () => ({
  default: () => <div data-testid="budget" />,
}));
vi.mock('@/features/planner/hooks/onboarding/OnboardingContext', () => ({
  __esModule: true,
  OnboardingProvider: onboardingMocks.OnboardingProvider,
  useOnboardingContext: onboardingMocks.useOnboardingContext,
}));

vi.mock('@/features/planner/components/onboarding/OnboardingDialog', () => ({
  __esModule: true,
  default: onboardingMocks.OnboardingDialog,
}));

vi.mock('@/shared/ui/calendar', async () => {
  const actual =
    await vi.importActual<typeof import('@/shared/ui/calendar')>('@/shared/ui/calendar');
  return {
    ...actual,
    DateRangePickerIcon: () => <div data-testid="date-picker" />,
  };
});

vi.mock('@/features/planner/ui/buttons/ModeToggleButton', () => ({
  __esModule: true,
  default: () => <div data-testid="mode-toggle" />,
}));

beforeEach(() => {
  localStorage.clear();
});

describe('PlannerClient onboarding dialog', () => {
  it('shows onboarding dialog for a new plan id even if another plan was seen', () => {
    localStorage.setItem('planner-onboarding-shown-plan1', 'true');
    mockPlanId = 'plan2';
    render(<PlannerClient title="Trip" />);
    expect(screen.getAllByText('Your planner is ready').length).toBeGreaterThan(0);
    expect(localStorage.getItem('planner-onboarding-shown-plan2')).toBe('true');
  });
});
