import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { vi } from 'vitest';

// Stub FeaturePreview group to avoid CSS import side-effects
vi.mock('@/features/website/components/FeaturePreview', () => ({
  __esModule: true,
  FeaturePreview: () => <div data-testid="feature-preview" />,
}));

import Home from '@/app/(marketing)/page';

const createMatchMedia = (matches = false): MediaQueryList =>
  ({
    matches,
    media: '(min-width: 1024px)',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }) as unknown as MediaQueryList;

const originalMatchMedia = typeof window !== 'undefined' ? window.matchMedia : undefined;

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => {
      const stub = createMatchMedia(false);
      return { ...stub, media: query };
    }),
  });
});

afterAll(() => {
  if (originalMatchMedia) {
    window.matchMedia = originalMatchMedia;
  } else {
    delete (window as { matchMedia?: typeof window.matchMedia }).matchMedia;
  }
});

describe('Accessibility — Home page (full)', () => {
  it('has no a11y violations', async () => {
    const { container } = render(<Home />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
