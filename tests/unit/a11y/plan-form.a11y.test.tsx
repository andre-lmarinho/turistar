import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { SignupPage } from '@/features/planner/components/signup/SignupPage';

describe('Accessibility — PlanForm', () => {
  it('has no a11y violations', async () => {
    const { container } = render(<SignupPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
