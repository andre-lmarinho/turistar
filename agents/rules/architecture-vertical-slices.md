---
title: Organize Domain Code in Feature Slices
impact: CRITICAL
impactDescription: Makes domain ownership and dependencies easier to follow
tags: architecture, vertical-slices, organization
---

# Organize domain code in feature slices

Keep domain behavior in `src/features/<feature>/`, with its services, repositories, types, hooks, and components as needed. Avoid creating global service or repository directories that scatter one domain across the application.

The surrounding layers have separate responsibilities:

| Location | Responsibility |
| --- | --- |
| `src/app/` | Routes, Server Components, and HTTP entry points |
| `src/modules/` | Screens that compose features |
| `src/features/` | Domain behavior and feature-specific UI |
| `src/trpc/server/routers/` | tRPC schemas, handlers, and router composition |
| `src/ui/` | Shared UI primitives |
| `src/lib/` | Shared utilities and infrastructure helpers |

Feature tests are usually colocated as `.test.ts` or `.test.tsx`; cross-application browser tests live in `tests/e2e/`. Add only the folders a feature needs. Features can depend on one another through explicit services, types, and helpers; document important dependencies in the feature README.

See the [feature index](../../src/features/README.md) and [architecture guide](../../ARCHITECTURE.md) for the current boundaries.
