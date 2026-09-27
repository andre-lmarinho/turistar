# Modules

Modules compose the screens rendered by [App Router pages](../app/) using feature logic and [shared UI components](../ui/). See the [architecture overview](../../ARCHITECTURE.md) for the complete request and data flows.

## Areas

| Area | Responsibilities | Start here |
| --- | --- | --- |
| `auth` | Login, signup, password recovery, and language selection | [LoginView](auth/login-view.tsx) |
| `layout` | App navigation, account settings, and sign-out | [AppBar](layout/AppBar.tsx) |
| `marketing` | Public navigation, footer, legal-page layout, and SEO markup | [LegalArticle](marketing/layout/LegalArticle.tsx) |
| `planner` | Board, trip, map, and budget views; activity editing and sharing | [PlanIdView](planner/planid-view.tsx) |
| `user` | Dashboard, travel map, upcoming trip, and plan creation | [DashboardView](user/dashboard-view.tsx) |

## How screens use data

Modules include both server and client components. `DashboardView` and `AppBar` render on the server; interactive forms and planner views use client components.

- Pages load initial data and pass it to screens. The [planner page](../app/(webapp)/p/[planId]/page.tsx) obtains a planner experience from `PlanService` and handles access failures before rendering `PlanIdView`.
- Client components call [tRPC](../trpc/README.md) for operations such as [creating a plan](user/components/PlannerCreationForm.tsx), changing its title, managing members, and updating budgets.
- Activity and day edits go through [usePlannerDocument](planner/hooks/usePlannerDocument.ts), which builds operations for [usePlanCollaboration](../features/events/hooks/usePlanCollaboration.ts). That feature hook owns optimistic updates, persistence, and realtime synchronization. [useDragHandlers](planner/hooks/useDragHandlers.ts) manages the drag preview.
- Auth screens call feature auth handlers. `AppBar` reads the current profile through a repository, and [AvatarMenu](layout/AvatarMenu.tsx) calls Supabase Auth to sign out.

## Making changes

Keep screen composition and interaction state in the relevant module. Put reusable UI in `src/ui`, shared utilities in `src/lib`, and domain behavior in the appropriate [feature](../features/README.md). Pages remain the entry point for route access decisions.

Tests live beside their implementations, including [planner screen tests](planner/planid-view.test.tsx), [drag interaction tests](planner/hooks/useDragHandlers.test.ts), and [auth translation tests](auth/auth-translations.test.tsx). Follow the [contribution checks](../../CONTRIBUTING.md#checks) when changing a screen.
