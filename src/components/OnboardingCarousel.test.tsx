import React from 'react';
import { render, screen } from '@testing-library/react';
import OnboardingCarousel from './OnboardingCarousel';
import { ONBOARDING_STEPS } from '@/constants';

describe('OnboardingCarousel', () => {
  it('renders all onboarding steps', () => {
    render(<OnboardingCarousel />);
    ONBOARDING_STEPS.forEach((step) => {
      expect(screen.getByText(step.title)).toBeInTheDocument();
    });
  });
});
