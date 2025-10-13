import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { PlanForm } from '@/features/website/components/PlanForm';

describe('Accessibility — PlanForm', () => {
  it('has no a11y violations', async () => {
    const { container } = render(<PlanForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
