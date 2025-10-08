import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

type OnboardingContextValue = {
  showOnboarding: boolean;
  setShowOnboarding: React.Dispatch<React.SetStateAction<boolean>>;
};

const onboardingMocks = vi.hoisted(() => {
  const React = require('react') as typeof import('react');
  const Button = (props: React.ComponentProps<'button'>) => <button {...props} />;

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

  const OnboardingModal = () => {
    const { showOnboarding, setShowOnboarding } = useOnboardingContext();

    if (!showOnboarding) {
      return null;
    }

    return (
      <div role="dialog">
        <Button type="button" onClick={() => setShowOnboarding(false)}>
          Close
        </Button>
      </div>
    );
  };

  return { OnboardingProvider, useOnboardingContext, OnboardingModal };
});

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
    setSelectedActivity: vi.fn(),
    changeDay: vi.fn(),
    changePosition: vi.fn(),
    changeColor: vi.fn(),
    removeActivity: vi.fn(),
    updateActivity: vi.fn(),
    sensors: undefined,
    collisionDetection: vi.fn(),
    handleDragStart: vi.fn(),
    handleDragOver: vi.fn(),
    handleDragEnd: vi.fn(),
    selectedActivity: null,
    setDays: vi.fn(),
  }),
}));

vi.mock('@/features/planner/components/modal/ActivityModal', () => ({
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

vi.mock('@/features/planner/hooks/onboarding/OnboardingContext', () => ({
  __esModule: true,
  OnboardingProvider: onboardingMocks.OnboardingProvider,
  useOnboardingContext: onboardingMocks.useOnboardingContext,
}));

vi.mock('@/features/planner/components/onboarding/OnboardingModal', () => ({
  __esModule: true,
  default: onboardingMocks.OnboardingModal,
}));

vi.mock('@/features/planner/components/dnd/PlannerBoard', () => ({
  default: () => <div />,
}));
vi.mock('@/features/planner/components/map/MapBoard', () => ({
  default: () => <div />,
}));
vi.mock('@/features/planner/components/budget/BudgetBoard', () => ({
  default: () => <div />,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

import PlannerClient from '@/features/planner/components/PlannerClient';

describe('onboarding modal visibility', () => {
  it('shows modal initially and hides after finish', async () => {
    render(<PlannerClient planId="p1" hideOnboarding={false} />);

    const modal = await screen.findByRole('dialog');
    expect(modal).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
