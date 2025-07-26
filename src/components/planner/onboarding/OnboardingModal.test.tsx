// src/components/planner/onboarding/OnboardingModal.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import OnboardingModal from './OnboardingModal';
import { ONBOARDING_STEPS } from '@/constants';
import { vi } from 'vitest';

describe('OnboardingModal', () => {
  it('renders all onboarding steps when open', () => {
    render(<OnboardingModal open onClose={() => {}} />);
    ONBOARDING_STEPS.forEach((step) => {
      expect(screen.getAllByText(step.title).length).toBeGreaterThan(0);
    });
  });

  it('calls onClose when close button clicked', () => {
    const handleClose = vi.fn();
    render(<OnboardingModal open onClose={handleClose} />);
    fireEvent.click(screen.getByLabelText('Close'));
    expect(handleClose).toHaveBeenCalled();
  });
});
