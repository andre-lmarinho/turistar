// vitest.setup.ts
process.env.TZ = 'UTC';
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'anon';
process.env.GEOAPIFY_KEY = process.env.GEOAPIFY_KEY ?? 'test-key';
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

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: vi.fn(),
    auth: { getSession: vi.fn(), getUser: vi.fn() },
  }),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));


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

