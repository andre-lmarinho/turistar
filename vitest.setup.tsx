// vitest.setup.ts
process.env.TZ = 'UTC';
import '@testing-library/jest-dom';
import React from 'react';

vi.mock('focus-trap-react', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Canvas isn't implemented in jsdom. Provide a minimal mock so tests using
// measureText can run without installing additional packages.
HTMLCanvasElement.prototype.getContext = vi
  .fn(
    () =>
      ({
        font: '',
        measureText: vi.fn(() => ({ width: 0 })),
      }) as unknown as CanvasRenderingContext2D,
  ) as unknown as HTMLCanvasElement['getContext'];
