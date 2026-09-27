---
title: Use Explicit Column Selection in Supabase Queries
impact: HIGH
impactDescription: Limits query payloads and accidental field exposure
tags: supabase, database, performance, security
---

# Use explicit column selection

Select the columns a caller needs, including columns in nested relationships. Avoid `select('*')` and nested wildcards. Explicit selection limits payloads and keeps returned fields reviewable; authorization still belongs in Services and database policies.

For example, the plan repository fetches a plan and its members with:

```typescript
const { data, error } = await this.client
  .from("plans")
  .select(
    "id, title, user_id, budget, start_date, end_date, destination_name, plan_members!left(user_id, tier)"
  )
  .eq("id", planId)
  .maybeSingle();
```

Handle the query error and map the result before returning it. See [PlanRepository](../../src/features/plan/repositories/PlanRepository.ts) for the complete method and [repository boundaries](data-repository-pattern.md) for error and DTO handling.
