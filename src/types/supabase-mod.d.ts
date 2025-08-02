declare module '@supabase/auth-helpers-nextjs' {
  export const createBrowserClient: (url: string, key: string, options?: unknown) => unknown;
  export const createServerClient: (url: string, key: string, options?: unknown) => unknown;
  export const createMiddlewareClient: (opts: unknown) => {
    auth: { getSession: () => Promise<unknown> };
    from: (...args: unknown[]) => unknown;
  };
}

declare module '@supabase/auth-helpers-react' {
  import type { ReactNode } from 'react';
  interface ProviderProps {
    supabaseClient: unknown;
    children?: ReactNode;
  }
  export const SessionContextProvider: (props: ProviderProps) => ReactNode;
}
