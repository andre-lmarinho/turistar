// src/components/planner/onboarding/OnboardingModal.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import OnboardingModal from './OnboardingModal';
import { ONBOARDING_STEPS } from '@/constants';
import { vi } from 'vitest';
import { OnboardingContext } from '@/contexts/OnboardingContext';

describe('OnboardingModal', () => {
  it('renders all onboarding steps when open', () => {
    render(
      <OnboardingContext.Provider value={{ showOnboarding: true, setShowOnboarding: vi.fn() }}>
        <OnboardingModal />
      </OnboardingContext.Provider>
    );
    ONBOARDING_STEPS.forEach((step) => {
      expect(screen.getAllByText(step.title).length).toBeGreaterThan(0);
    });
  });

  it('calls onClose when close button clicked', () => {
    const handleClose = vi.fn();
    render(
      <OnboardingContext.Provider value={{ showOnboarding: true, setShowOnboarding: handleClose }}>
        <OnboardingModal />
      </OnboardingContext.Provider>
    );
    fireEvent.click(screen.getByLabelText('Close'));
    expect(handleClose).toHaveBeenCalled();
  });
});
