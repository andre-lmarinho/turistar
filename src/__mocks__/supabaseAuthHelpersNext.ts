export const createClientComponentClient = () => ({
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

export const createServerComponentClient = () => createClientComponentClient();
export const createServerActionClient = () => createClientComponentClient();
export const createMiddlewareClient = () => ({
  auth: { getSession: () => Promise.resolve({}) },
  from: () => ({}),
});
