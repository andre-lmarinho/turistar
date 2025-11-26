import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

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
    const { showOnboarding, setShowOnboarding } = useOnboardingContext();

    if (!showOnboarding) {
      return null;
    }

    return (
      <div role="dialog">
        <button onClick={() => setShowOnboarding(false)}>Close</button>
      </div>
    );
  };

  return { OnboardingProvider, useOnboardingContext, OnboardingDialog };
});

vi.mock('@/features/app/planner/hooks/PlannerContext', () => ({
  __esModule: true,
  PlannerProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  usePlannerContext: () => ({
    planId: 'p1',
    dest: 'rome',
    days: [],
    currentRange: undefined,
    handleRangeChange: vi.fn(),
    addBlankAndSelect: vi.fn(),
    setSelectedActivity: vi.fn(),
    changeDay: vi.fn(),
    changePosition: vi.fn(),
    changeColor: vi.fn(),
    insertActivityAt: vi.fn(),
    replaceActivity: vi.fn(),
    removeActivity: vi.fn(),
    updateActivity: vi.fn(),
    sensors: undefined,
    collisionDetection: vi.fn(),
    handleDragStart: vi.fn(),
    handleDragOver: vi.fn(),
    handleDragEnd: vi.fn(),
    selectedActivity: null,
    setDays: vi.fn(),
    canEdit: true,
  }),
}));

vi.mock('@/features/app/planner/components/dialog/ActivityDialog', () => ({
  __esModule: true,
  ActivityDialog: () => null,
}));

vi.mock('@/features/app/planner/hooks/usePlanTitleSupabase', () => ({
  __esModule: true,
  usePlanTitle: () => ({ title: 'Trip', setTitle: vi.fn(), saveTitle: vi.fn() }),
}));

vi.mock('@/features/app/planner/hooks/budget/BudgetContext', () => ({
  __esModule: true,
  BudgetProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/features/app/planner/hooks/onboarding/OnboardingContext', () => ({
  __esModule: true,
  OnboardingProvider: onboardingMocks.OnboardingProvider,
  useOnboardingContext: onboardingMocks.useOnboardingContext,
}));

vi.mock('@/features/app/planner/components/onboarding/OnboardingDialog', () => ({
  __esModule: true,
  OnboardingDialog: onboardingMocks.OnboardingDialog,
}));

vi.mock('@/features/app/planner/components/dnd/PlannerBoard', () => ({
  __esModule: true,
  PlannerBoard: () => <div />,
}));
vi.mock('@/features/app/planner/components/map/MapBoard', () => {
  const MockMapBoard = () => <div />;
  return {
    __esModule: true,
    default: MockMapBoard,
    MapBoard: MockMapBoard,
  };
});
vi.mock('@/features/app/planner/components/budget/BudgetBoard', () => ({
  __esModule: true,
  BudgetBoard: () => <div />,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

import { PlannerClient } from '@/features/app/planner/components/PlannerClient';

describe('onboarding dialog visibility', () => {
  it('shows dialog initially and hides after finish', async () => {
    render(<PlannerClient planId="p1" hideOnboarding={false} />);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
