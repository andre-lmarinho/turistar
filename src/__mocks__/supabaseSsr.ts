const createMockClient = () => ({
  from: () => ({
    select: () => ({
      eq: () => ({
        order: () => Promise.resolve({ data: [], error: null }),
        single: () => Promise.resolve({ data: null, error: null }),
      }),
    }),
    upsert: () => ({
      select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }),
    }),
  }),
  auth: { getSession: () => Promise.resolve({}), getUser: () => Promise.resolve({}) },
});

export const createBrowserClient = () => createMockClient();
export const createServerClient = () => createMockClient();
export const createMiddlewareClient = () => ({
  auth: { getSession: () => Promise.resolve({}) },
  from: () => ({}),
});
