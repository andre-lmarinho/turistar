import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { HeroHome } from '@/features/website/components/HeroHome';

describe('Accessibility — Hero component', () => {
  it('has no a11y violations', async () => {
    const { container } = render(<HeroHome />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
