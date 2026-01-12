# Inspirations related code will live here

## Data Flow
```text
List UI (InspirationLink, InspirationsView)
  └─> data.ts (summary only, client-safe)

Inspiration Planner Page
  └─> getInspirationExperienceProps.ts
        ├─> inspirationLoader.ts (load + validate JSON)
        │     └─> schemas.ts (Zod validation)
        └─> buildDaysFromInspirationData.ts (mapper)
              └─> PlannerClient
```