// tests/unit/features/onboarding/components/OnboardingCarousel.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import OnboardingCarousel from '@/features/onboarding/components/OnboardingCarousel';
import { ONBOARDING_STEPS } from '@/shared/constants';

describe('OnboardingCarousel', () => {
  it('renders all onboarding steps', () => {
    render(<OnboardingCarousel />);
    ONBOARDING_STEPS.forEach((step) => {
      expect(screen.getByText(step.title)).toBeInTheDocument();
    });
  });

  it('hides the previous button on the first step', () => {
    render(<OnboardingCarousel />);
    expect(screen.queryByLabelText('Previous step')).toBeNull();
  });
});
