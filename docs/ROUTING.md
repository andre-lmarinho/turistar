# Routing and Layout

The `src/app` directory provides Next.js routing and shared page layout. It keeps UI logic in feature modules and only wires pages together.

## Structure

```
src/app
├─ layout.tsx
├─ page.tsx
├─ planner/
│  ├─ page.tsx
│  ├─ PlannerClient.tsx
│  ├─ PlannerBoard.tsx
│  ├─ MapView.tsx
│  ├─ BudgetPanel.tsx
│  ├─ actions/
│  │  ├─ createPlan.ts
│  │  └─ updatePlan.ts
│  └─ [planId]/page.tsx
└─ inspiration/
   ├─ InspirationPlanner.tsx
   └─ [city]/page.tsx
```

### layout.tsx
- **Responsibility:** Defines the base HTML structure, global providers, and metadata.
- **Notes:** Wraps children with Supabase and React Query providers.

### page.tsx
- **Responsibility:** Home page rendering the `Hero` and `PlanForm` from the home feature.
- **Notes:** Imports only from `src/features/home`.

### planner/
- **page.tsx** – Client entry that dynamically loads `PlannerClient` for the planner experience.
- **PlannerClient.tsx**, **PlannerBoard.tsx**, **MapView.tsx**, **BudgetPanel.tsx** – Route-level wrappers that consume modules from `src/features/planner` and `src/features/budget`.
- **actions/** – Server actions `createPlan` and `updatePlan` re-exported from `src/server/actions`.
  `createPlan` calls Supabase RPC `create_full_plan` to set up the plan, destination and days in a single transaction.
- **[planId]/page.tsx** – Loads an existing plan and passes it to `InspirationPlanner`.

### inspiration/
- **InspirationPlanner.tsx** – Wrapper that renders `PlannerClient` with sample data.
- **[city]/page.tsx** – Dynamic route reading inspiration JSON from `src/data`.

## Conventions

- `src/app` should only orchestrate layouts and routing.
- Feature logic lives in `src/features` and server-side logic in `src/server`.
- API routes and server actions inside `src/app` merely re-export implementations from `src/server`.

