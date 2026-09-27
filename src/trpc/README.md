# tRPC

The browser calls domain operations through `/api/trpc`. Routers validate inputs, handlers connect feature services and repositories, and a request context carries the viewer and Supabase client for that request.

See the [architecture overview](../../ARCHITECTURE.md) for how tRPC fits with pages, Supabase Auth, realtime events, and external API proxies.

## Request flow

1. [TRPCProvider](../app/_trpc/trpc-provider.tsx) supplies the React Query client and [batched HTTP client](../app/_trpc/trpc-client.ts). Components use the typed hooks exported by [react/index.ts](react/index.ts).
2. The [route handler](../app/api/trpc/[trpc]/route.ts) passes requests to [appRouter](server/routers/_app.ts) with [createTRPCContext](server/createContext.ts).
3. A procedure validates input against its schema and invokes its handler. Authenticated handlers pass `ctx.supabase` into repositories, preserving the caller's identity for database row-level security (RLS).
4. Feature services apply domain behavior; repositories access tables and database functions. Shared middleware [maps application errors](server/lib/mapApplicationError.ts), and the [error formatter](server/errorFormatter.ts) exposes validation details.

## Router boundaries

| Router | Access | Operations |
| --- | --- | --- |
| [viewer](server/routers/viewer/_router.ts) | [authedProcedure](server/procedures/authedProcedure.ts) requires a viewer | Plans, budgets, members, profiles, events, and snapshots |
| [public.profile](server/routers/public/profile/_router.ts) | No sign-in required | Username availability |

Username availability is an existing exception to service composition: its [handler](server/routers/public/profile/availability.handler.ts) calls [isUsernameAvailable](../features/auth/lib/isUsernameAvailable.ts), which uses a server-only service-role client and `ProfileRepository`. It returns only an availability boolean.

Authentication at the procedure boundary does not replace resource authorization in services and RLS. [Auth handlers](../features/auth/README.md) use the Supabase Auth client, with profile finalization also handled by page-level Server Actions. [Place-search proxies](../app/api/places/) use HTTP route handlers.

## Adding an operation

Follow an existing operation such as [plan creation](server/routers/viewer/plan/_router.ts):

- Define input validation in a `*.schema.ts` file.
- Implement a `*.handler.ts` that delegates domain behavior to a feature service and reuses `ctx.supabase` for authenticated database access.
- Register the query or mutation in its feature router, using the appropriate public or authenticated procedure.
- Import `AppRouter` as a type when wiring clients; keep server implementations out of browser imports.

[Router tests](server/routers/viewer/_router.test.ts) and [context tests](server/createContext.test.ts) provide examples of testing this boundary. Use the [contribution checks](../../CONTRIBUTING.md#checks) for validation commands and the [database workflow](../../CONTRIBUTING.md#database-workflow) when an operation needs database changes.
