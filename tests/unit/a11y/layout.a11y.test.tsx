// tests/unit/a11y/layout.a11y.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';

// Stub CSS imports used by the layout before importing the component
vi.mock('@/app/globals.css', () => ({}) as unknown as Record<string, never>);
vi.mock('leaflet/dist/leaflet.css', () => ({}) as unknown as Record<string, never>);

import RootLayout from '@/app/layout';

describe('Accessibility — Root layout', () => {
  it('exposes a skip link and has no violations', async () => {
    const { container } = render(
      <RootLayout>
        <main id="main-content">Hello</main>
      </RootLayout>
    );

    // Skip link should be present
    expect(screen.getByText('Skip to content')).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
