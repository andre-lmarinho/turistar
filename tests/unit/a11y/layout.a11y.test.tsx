import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { silenceConsole } from '../../utils/silenceConsole';

// Stub CSS imports used by the layout before importing the component
vi.mock('@/shared/utils/theme.css', () => ({}) as unknown as Record<string, never>);
vi.mock('leaflet/dist/leaflet.css', () => ({}) as unknown as Record<string, never>);

import RootLayout from '@/app/layout';

describe('Accessibility — Root layout', () => {
  it('exposes a skip link and has no violations', async () => {
    const restore = silenceConsole([/<html> cannot be a child of <div>/], ['error']);

    const { container } = render(
      <RootLayout>
        <main id="main-content">Hello</main>
      </RootLayout>
    );

    // Skip link should be present
    expect(screen.getByText('Skip to content')).toBeInTheDocument();

    try {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    } finally {
      restore();
    }
  });
});
