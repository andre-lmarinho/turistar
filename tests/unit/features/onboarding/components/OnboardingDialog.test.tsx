import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingDialog } from '@/features/planner/modules/onboarding/components/OnboardingDialog';
import { ONBOARDING_STEPS } from '@/features/planner/modules/onboarding/steps';
import { vi } from 'vitest';
import { OnboardingProvider } from '@/features/planner/modules/onboarding/hooks/OnboardingContext';

const mockSetShowOnboarding = vi.fn();
vi.mock('@/features/planner/onboarding/useOnboardingCheck', () => ({
  useOnboardingCheck: () => ({ showOnboarding: true, setShowOnboarding: mockSetShowOnboarding }),
}));

describe('OnboardingDialog', () => {
  beforeEach(() => {
    mockSetShowOnboarding.mockClear();
  });

  it('renders all steps when open', () => {
    render(
      <OnboardingProvider planId="p1">
        <OnboardingDialog />
      </OnboardingProvider>
    );
    ONBOARDING_STEPS.forEach((step) => {
      expect(screen.getAllByText(step.title).length).toBeGreaterThan(0);
    });
  });

  it('calls onClose when close button clicked', () => {
    render(
      <OnboardingProvider planId="p1">
        <OnboardingDialog />
      </OnboardingProvider>
    );
    fireEvent.click(screen.getByLabelText('Close'));
    expect(mockSetShowOnboarding).toHaveBeenCalled();
  });
});
