// tests/integration/onboarding/onboardingModal.spec.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('@/features/planner', async () => {
  const React = await import('react');
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
    PlannerControls: () => <div />,
  };
});

vi.mock('@/features/onboarding', () => {
  const React = require('react');
  const Ctx = React.createContext({ showOnboarding: true, setShowOnboarding: () => {} });
  const OnboardingProvider = ({ children }: { children: React.ReactNode }) => {
    const [showOnboarding, setShowOnboarding] = React.useState(true);
    return <Ctx.Provider value={{ showOnboarding, setShowOnboarding }}>{children}</Ctx.Provider>;
  };
  const OnboardingModal = () => {
    const { showOnboarding, setShowOnboarding } = React.useContext(Ctx);
    if (!showOnboarding) return null;
    return (
      <div role="dialog">
        <button onClick={() => setShowOnboarding(false)}>Close</button>
      </div>
    );
  };
  return { OnboardingModal, OnboardingProvider };
});

vi.mock('@/app/planner/PlannerBoard', () => ({
  default: () => <div />,
}));
vi.mock('@/app/planner/MapView', () => ({
  default: () => <div />,
}));
vi.mock('@/app/planner/BudgetPanel', () => ({
  default: () => <div />,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

import PlannerClient from '@/app/planner/PlannerClient';

describe('onboarding modal visibility', () => {
  it('shows modal initially and hides after finish', async () => {
    render(<PlannerClient planId="p1" hideOnboarding={false} />);

    const modal = await screen.findByRole('dialog');
    expect(modal).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
