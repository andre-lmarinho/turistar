import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

// Stub next/dynamic to avoid importing the full PlannerClient
vi.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => () => <div data-testid="mocked-dynamic-component" />,
}));

import { PlannerClient } from '@/features/app/planner/components/PlannerClient';

describe('Accessibility — Planner page', () => {
  it('has no a11y violations', async () => {
    const { container } = render(<PlannerClient />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
