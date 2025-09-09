// tests/unit/a11y/planner-page.a11y.test.tsx

import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

// Stub next/dynamic to avoid importing the full PlannerClient
vi.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => () => <main id="main-content" aria-label="Planner app" />,
}));

import PlannerPage from '@/app/planner/page';

describe('Accessibility — Planner page', () => {
  it('has no a11y violations', async () => {
    const { container } = render(<PlannerPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
