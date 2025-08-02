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


vi.mock('@testing-library/react', async () => {
  const actual: typeof import('@testing-library/react') = await vi.importActual(
    '@testing-library/react'
  );
  const { QueryClient, QueryClientProvider } = await vi.importActual<
    typeof import('@tanstack/react-query')
  >('@tanstack/react-query');

  function WithClient({ children }: { children: React.ReactNode }) {
    const client = new QueryClient();
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }

  return {
    ...actual,
    render: (ui: React.ReactElement, options?: Parameters<typeof actual.render>[1]) =>
      actual.render(ui, { wrapper: WithClient, ...options }),
    renderHook: <T,>(fn: () => T, options?: Parameters<typeof actual.renderHook>[1]) =>
      actual.renderHook(fn, { wrapper: WithClient, ...options }),
  };
});

