import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { SignupPage } from '@/features/auth/signup/SignupPage';

describe('Accessibility — PlanForm', () => {
  it('has no a11y violations', async () => {
    const { container } = render(<SignupPage finalizeProfile={async () => 'example-slug'} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
