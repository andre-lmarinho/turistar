import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import PlanForm from '@/features/home/components/PlanForm';

describe('Accessibility — PlanForm', () => {
  it('has no a11y violations', async () => {
    const { container } = render(
      <PlanForm trigger={<button type="button">Open</button>} dialogTitleId="plan-form-a11y" defaultOpen />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
