---
title: Keep Database Access Behind Repositories
impact: CRITICAL
impactDescription: Keeps database details out of domain logic and UI
tags: data, repository, supabase, isolation
---

# Keep database access behind repositories

Repositories own database queries and RPC calls. Services own business rules, authorization decisions, and use-case orchestration. Keep these responsibilities separate when adding or changing behavior.

- Inject the database client into the Repository and the Repository into the Service.
- Keep database row types private to the data layer; expose explicit DTOs or records to callers.
- Select columns explicitly, including nested relations.
- Distinguish an absent record from a failed query. Include the operation and identifiers when reporting database errors.
- Keep business validation and domain transformations in Services.

## Current composition

[createPlanService](../../src/features/plan/services/createPlanService.ts) creates the request-scoped Supabase client, constructs repositories, and passes them into Services. Other features are composed in tRPC handlers, such as [appendEventsHandler](../../src/trpc/server/routers/viewer/events/append.handler.ts).

[PlanRepository](../../src/features/plan/repositories/PlanRepository.ts) demonstrates typed client injection, explicit queries, row-to-record mapping, and contextual errors. [PlanService](../../src/features/plan/services/PlanService.ts) handles the corresponding domain operations.

Supabase client creation and authentication also live in infrastructure and auth modules. Domain database access must still go through Repositories.

See [method naming](data-repository-methods.md) and [authorization](architecture-page-level-auth.md).
