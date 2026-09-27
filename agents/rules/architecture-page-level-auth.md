---
title: Authorize Protected Entry Points
impact: CRITICAL
impactDescription: Prevents unauthorized access to private data and mutations
tags: security, nextjs, authorization, architecture
---

# Authorize protected entry points

Resolve authentication in the page or Server Component that renders private data. Layouts can persist across navigation without rerunning their checks, so they cannot protect a route or mutation on their own.

- Resolve the session with `getViewer()` in a restricted `page.tsx` or Server Component.
- Keep resource membership and role checks in the owning Service. RLS is the database authorization boundary.
- Redirect before rendering private UI; keep resource policy out of pages and Proxy.
- Authorize every protected Server Action, Route Handler, and tRPC operation independently. UI checks do not protect other entry points.
- Proxy refreshes the Supabase session and adds transport headers; it does not decide access.

## Follow the current flow

The [planner page](../../src/app/(webapp)/p/[planId]/page.tsx) resolves the viewer, asks [PlanService](../../src/features/plan/services/PlanService.ts) for the authorized planner experience, then maps access errors to a redirect or not-found response.

The [authenticated tRPC procedure](../../src/trpc/server/procedures/authedProcedure.ts) requires a viewer before invoking a protected handler. Resource access must still be checked by the operation's Service and database policies.

See [session resolution](../../src/features/auth/lib/session.ts) and the [architecture guide](../../ARCHITECTURE.md) for the supporting code.
