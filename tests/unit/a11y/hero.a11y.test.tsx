import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import Hero from '@/features/home/components/Hero';

describe('Accessibility — Hero component', () => {
  it('has no a11y violations', async () => {
    const { container } = render(<Hero />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
