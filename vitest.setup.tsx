process.env.TZ = 'UTC';
process.env.NEXT_PUBLIC_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'anon';
process.env.NEXT_PUBLIC_GEOAPIFY_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_KEY ?? 'test-key';
import '@testing-library/jest-dom';
import React from 'react';

function createSupabaseClientMock() {
  const channel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn(() => ({ unsubscribe: vi.fn().mockResolvedValue({ error: null }) })),
  };

  return {
    from: vi.fn(),
    rpc: vi.fn(),
    auth: { getSession: vi.fn(), getUser: vi.fn() },
    channel: vi.fn(() => channel),
  };
}

class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

(globalThis as unknown as { ResizeObserver: typeof ResizeObserverMock }).ResizeObserver =
  ResizeObserverMock;

// Next.js runtime component shims for testing
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: { href?: unknown; children?: React.ReactNode } & Record<string, unknown>) => (
    // Normalize href to string for test DOM
    <a href={typeof href === 'string' ? href : '#'} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('next/image', () => ({
  __esModule: true,
  // Render a plain img for tests
  default: (props: Record<string, unknown>) => {
    const source = ((props || {}) as Record<string, unknown>) ?? {};
    const alt = (source.alt as string) ?? '';
    const rest = { ...source } as Record<string, unknown>;
    // Drop non-standard props for <img>
    delete (rest as { priority?: unknown }).priority;
    delete (rest as { fill?: unknown }).fill;
    return <img alt={alt} {...rest} />;
  },
}));

vi.mock('@vercel/speed-insights/next', () => ({
  SpeedInsights: () => null,
}));

// Prevent Leaflet from loading in tests (depends on browser globals)
vi.mock('react-leaflet', () => ({
  __esModule: true,
  MapContainer: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="map">{children}</div>
  ),
  TileLayer: () => null,
  Marker: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="marker">{children}</div>
  ),
  useMap: () => ({ fitBounds: vi.fn(), setView: vi.fn() }),
}));

vi.mock('leaflet', () => ({
  __esModule: true,
  default: {
    latLngBounds: (...args: unknown[]) => ({ args }),
    divIcon: (options: unknown) => ({ options }),
  },
  latLngBounds: (...args: unknown[]) => ({ args }),
  divIcon: (options: unknown) => ({ options }),
}));

// Canvas isn't implemented in jsdom. Provide a minimal mock so tests using
// measureText can run without installing additional packages.
HTMLCanvasElement.prototype.getContext = vi.fn(
  () =>
    ({
      font: '',
      measureText: vi.fn(() => ({ width: 0 })),
    }) as unknown as CanvasRenderingContext2D
) as unknown as HTMLCanvasElement['getContext'];

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: () => createSupabaseClientMock(),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => createSupabaseClientMock(),
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
  const actual: typeof import('@testing-library/react') =
    await vi.importActual('@testing-library/react');
  const { QueryClient, QueryClientProvider } =
    await vi.importActual<typeof import('@tanstack/react-query')>('@tanstack/react-query');

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
