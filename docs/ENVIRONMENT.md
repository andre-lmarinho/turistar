# Environment Variables

Turistar reads environment variables through [`src/shared/lib/env.ts`](../src/shared/lib/env.ts) on the server and [`src/shared/lib/clientEnv.ts`](../src/shared/lib/clientEnv.ts) on the client. These modules use Zod to validate required values at runtime and throw when they are missing.

## Required Variables

- `NEXT_PUBLIC_SUPABASE_URL` – URL of your Supabase project.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – public anon key for client access.
- `NEXT_PUBLIC_GEOAPIFY_KEY` – API key for Geoapify requests.
- `NODE_ENV` – environment name (defaults to `development`).

These values configure:

- Supabase clients in [`supabaseClient.ts`](../src/shared/lib/supabaseClient.ts) and [`supabaseServer.ts`](../src/shared/lib/supabaseServer.ts).
- Geoapify helpers in [`geoapify.ts`](../src/shared/lib/geoapify.ts).

## Authentication Flow

Supabase manages user sessions with cookies.

- Browser components use the client returned by `supabaseClient.ts`.
- Server actions call `supabaseServer` or `supabaseServerAction`, which read and set cookies via Next.js headers.
- This keeps Supabase session tokens synchronized across requests and allows server actions to act on behalf of the logged-in user.

Understanding these variables and the session flow is crucial for integrating with Supabase and the Geoapify catalog.
