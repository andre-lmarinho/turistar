import React from 'react';
import { render, screen } from '@testing-library/react';
import TutorialCarousel from './TutorialCarousel';
import { TUTORIAL_STEPS } from '@/constants';

describe('TutorialCarousel', () => {
  it('renders all tutorial steps', () => {
    render(<TutorialCarousel />);
    TUTORIAL_STEPS.forEach((step) => {
      expect(screen.getByText(step.title)).toBeInTheDocument();
    });
  });
});
