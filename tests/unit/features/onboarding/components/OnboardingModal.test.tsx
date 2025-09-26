// tests/unit/features/onboarding/components/OnboardingModal.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import OnboardingModal from '@/features/planner/components/onboarding/OnboardingModal';
import { ONBOARDING_STEPS } from '@/features/planner/domain/constants/onboarding';
import { vi } from 'vitest';
import { OnboardingProvider } from '@/features/planner/hooks/onboarding/OnboardingContext';

const mockSetShowOnboarding = vi.fn();
vi.mock('@/features/planner/hooks/onboarding/useOnboardingCheck', () => ({
  useOnboardingCheck: () => ({ showOnboarding: true, setShowOnboarding: mockSetShowOnboarding }),
}));

describe('OnboardingModal', () => {
  beforeEach(() => {
    mockSetShowOnboarding.mockClear();
  });

  it('renders all steps when open', () => {
    render(
      <OnboardingProvider planId="p1">
        <OnboardingModal />
      </OnboardingProvider>
    );
    ONBOARDING_STEPS.forEach((step) => {
      expect(screen.getAllByText(step.title).length).toBeGreaterThan(0);
    });
  });

  it('calls onClose when close button clicked', () => {
    render(
      <OnboardingProvider planId="p1">
        <OnboardingModal />
      </OnboardingProvider>
    );
    fireEvent.click(screen.getByLabelText('Close'));
    expect(mockSetShowOnboarding).toHaveBeenCalled();
  });
});
