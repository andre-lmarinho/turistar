// tests/unit/a11y/home.a11y.test.tsx

import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

// Stub FeaturePreview group to avoid CSS import side-effects
vi.mock('@/features/home/components/feature-preview/FeaturePreview', () => ({
  __esModule: true,
  default: () => <div data-testid="feature-preview" />,
}));

import Home from '@/app/page';

describe('Accessibility — Home page (full)', () => {
  it('has no a11y violations', async () => {
    const { container } = render(<Home />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
