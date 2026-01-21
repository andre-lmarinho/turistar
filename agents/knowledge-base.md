# Knowledge Base - Product & Domain-Specific Information

## Repo note for andre-lmarinho/travel-planner

This repo is a single Next.js app. Run commands from the repo root.

### Linting and Formatting

- Run lint: `npm run lint`
- Run type checking: `npm run typecheck:ci`
- Run auto-fix: `npm run lint:fix`

### Development

- Install dependencies: `npm install`
- Set up environment:
  - Copy `.env.example` to `.env`
  - Generate secret values with `openssl rand -base64 32` for any non-public secrets you keep in `.env.local`

## When creating PRs

Use these recommendations to write pull requests that are easy to review, easy to test, and easy to maintain over time.

- For most PRs, you only need to run linting and type checking.
- Create pull requests in draft mode by default, so that actual human can mark it as ready for review only when it is.

### Title

- Use conventional commits: `feat:`, `fix:`, `refactor:`
- Be specific: `fix: handle timezone edge case in planning creation`
- Not generic: `fix: planning bug`

### Size Limits

- **Large PRs** (>500 lines or >10 files) are not recommended.
- Guide the user how to split large PRs into smaller ones.

## When reviewing PRs in this repository

When asked to review a PR, focus on providing a clear summary of what the PR is doing and its core functionality. Avoid getting sidetracked by CI failures, testing issues, or technical implementation details unless specifically requested. The user prefers concise, focused reviews that prioritize understanding the main purpose and changes of the PR.

## File Naming Conventions

### Repository Files

- **Must** include `Repository` suffix, PascalCase matching class: `SupabaseRepository.ts`

### Service Files

- **Must** include `Service` suffix, PascalCase matching class, avoid generic names: `MembershipService.ts`

### General Files

- **Components**: PascalCase (e.g., `PlannerBoard.tsx`)
- **Utilities**: camelCase (e.g., `dateUtils.ts`)
- **Types**: PascalCase with `.types.ts` suffix (e.g., `supabase.types.ts`)
- **Tests**: Same as source file + `.test.ts` or `.spec.ts`
- **Avoid**: Dot-suffixes like `.service.ts`, `.repository.ts` (except for tests, types, specs)

## Next.js App Directory: Authorisation Checks in Pages

This can include checking session.user exists or session.org etc.

### TL;DR:

Don’t put permission checks in layout.tsx! Always put them directly inside your page.tsx or relevant server components for every restricted route.

### Why Not to Use Layouts for Permission Checks

- Layouts don’t intercept all requests: If a user navigates directly or refreshes a protected route, layout checks might be skipped, exposing sensitive content.
- APIs and server actions bypass layouts: Sensitive operations running on the server can’t be guarded by checks in the layout.
- Risk of data leaks: Only page/server-level checks ensure that unauthorized users never get protected data.

### ✅ How To Secure Routes (The Right Way)

- Check permissions inside page.tsx or the actual server component.
- Perform all session/user/role validation before querying or rendering sensitive content.
- Redirect or return nothing to unauthorized users, before running restricted code.

### 🛠️ Example: Page-Level Permission Check

```tsx
// app/admin/page.tsx

import { redirect } from 'next/navigation';
import { getUserSession } from '@/lib/auth';

export default async function AdminPage() {
  const session = await getUserSession();

  if (!session || session.user.role !== 'admin') {
    redirect('/'); // Or show an error
  }

  // Protected content here
  return <div>Welcome, Admin!</div>;
}
```

### 🧠 Key Reminders

- Put permission guards in every restricted page.tsx.
- Never assume layouts are secure for guarding data.
- Validate users before any sensitive queries or rendering.

## Repository + DTO Pattern and Method Conventions

We use a Repository + DTO pattern to isolate Supabase and the database from business logic. Repositories are the only layer that talks to the Supabase client and database tables. All services, tRPC handlers, API controllers, workflows, and UI should depend on DTOs or domain types, not Supabase row types.

DTOs (Data Transfer Objects) are simple TypeScript types or interfaces that represent our domain data in an ORM-agnostic way and are returned from repositories.

### Why this pattern?

- **Prevent type leaks**: Supabase row shape changes stay inside repositories instead of breaking services, handlers, and UI across dozens of files.
- **Enable safe refactors**: Business logic works against stable DTOs, so you can change storage details without touching higher layers.
- **Keep data access swappable**: If we ever change our data access layer, only repository implementations change; services and handlers stay the same.

### What not to do: tight Supabase coupling in business logic

Do not import Supabase row types in business logic. Supabase row types belong only in the data access layer.

```typescript
// ❌ Bad – business logic depends on Supabase row types
import type { Database } from '@/shared/types/supabase';
type PlanRow = Database['public']['Tables']['plans']['Row'];
export function publishPlan(plan: PlanRow) {
  /* ... */
}

// ✅ Good – business logic depends on DTO + repository
export interface PlanDTO {
  id: string;
  title: string | null;
  destinationName: string | null;
}
export interface IPlanRepository {
  findById(id: string): Promise<PlanDTO | null>;
}
export async function publishPlan(repo: IPlanRepository, id: string) {
  const plan = await repo.findById(id);
  // ...
}
```

### DTOs in repositories

Repositories should expose DTOs from their public methods and keep Supabase row types internal. Inside the repository, use `Database['public']['Tables']['...']['Row']` and map rows to DTOs. The public methods should only return DTOs, never Supabase rows.
Supabase row types may only exist in internal mappers or internal (non-exported) repository types. The exported contract is always a DTO. Never export `Database` types from a feature module.
Repositories never return raw Supabase payloads. Always check `error`, map `data` into DTOs, and return DTOs (or `null`). Throw a typed error only for unexpected infrastructure failures (e.g., database down), not for missing rows.
Repository mapping is allowed, business logic is not. Allowed: column selection, renaming fields, flattening relations, simple type conversions. Not allowed: domain authorization, workflow validation, status rules, or any side effects.

```typescript
// DTO – ORM-agnostic type exported from the repository module
export interface PlanDTO {
  id: string;
  ownerId: string;
  title: string | null;
  startDate: string | null;
  endDate: string | null;
}
```

### Supabase boundaries

- **Allowed**: server-only data access layers (repositories + adapters).
- **Not allowed**: UI, services, or handlers consuming the Supabase client directly.

Server-only is a rule, not a detail. Repositories never import the browser Supabase client (`src/shared/lib/supabaseClient`). Repositories live and run on the server (server actions, route handlers, edge functions). UI calls services or server actions; UI does not call repositories directly.
For relational selects, standardize query strings per repository to avoid copy/paste drift. Define named select constants and have methods choose one.

```typescript
const SELECT_BASE = 'id, user_id, title';
const SELECT_WITH_DESTINATIONS = 'id, user_id, title, plan_destinations(destinations(name))';
const SELECT_WITH_MEMBERS_AND_DESTINATIONS =
  'id, user_id, title, plan_members(user_id, tier), plan_destinations(destinations(name))';
```

Supabase RLS can return `null` for both “not found” and “blocked by policy”. Public APIs should return “not found” to avoid leaking permission. For internal logs, record when a `null` result could be RLS‑related (e.g., authenticated user, expected row, and no data). Only return “forbidden” if you have an explicit permission check outside the query.

### Method Naming Rules

**1. Don't include the repository's entity name in method names**

Method names should be concise and avoid redundancy since the repository class name already indicates the entity type.

```typescript
// ✅ Good - Concise method names
class PlanRepository {
  findById(id: string) { ... }
  findByOwnerId(ownerId: string) { ... }
  create(data: PlanCreateInput) { ... }
  delete(id: string) { ... }
}

// ❌ Bad - Redundant entity name in methods
class PlanRepository {
  findPlanById(id: string) { ... }
  findPlanByOwnerId(ownerId: string) { ... }
  createPlan(data: PlanCreateInput) { ... }
  deletePlan(id: string) { ... }
}
```

**2. Use `include` or similar keywords for methods that fetch relational data**

When a method retrieves additional related entities, make this explicit in the method name using keywords like `include`, `with`, or `andRelations`.

```typescript
// ✅ Good - Clear indication of included relations
class PlanRepository {
  findById(id: string) {
    return this.client.from('plans').select('id, title').eq('id', id).single();
  }

  findByIdIncludeDestinations(id: string) {
    return this.client
      .from('plans')
      .select('id, title, plan_destinations(destinations(name))')
      .eq('id', id)
      .single();
  }

  findByIdIncludeMembersAndDestinations(id: string) {
    return this.client
      .from('plans')
      .select('id, title, plan_members(user_id, tier), plan_destinations(destinations(name))')
      .eq('id', id)
      .single();
  }
}

// ❌ Bad - Unclear what data is included
class PlanRepository {
  findById(id: string) {
    return this.client
      .from('plans')
      .select('id, title, plan_members(user_id, tier), plan_destinations(destinations(name))')
      .eq('id', id)
      .single();
  }

  findByIdForSharing(id: string) {
    return this.client
      .from('plans')
      .select('id, title, plan_members(user_id, tier)')
      .eq('id', id)
      .single();
  }
}
```

**3. Keep methods generic and reusable - avoid use-case-specific names**

Repository methods should be general-purpose and describe what data they return, not how or where it's used. This promotes code reuse across different features.

```typescript
// ✅ Good - Generic, reusable methods
class PlanRepository {
  findByOwnerIdIncludeMembers(ownerId: string) {
    return this.client
      .from('plans')
      .select('id, user_id, title, plan_members(user_id, tier)')
      .eq('user_id', ownerId);
  }

  findByDateRangeIncludeDestinations(startDateIso: string, endDateIso: string) {
    return this.client
      .from('plans')
      .select('id, user_id, title, start_date, end_date, plan_destinations(destinations(name))')
      .gte('start_date', startDateIso)
      .lte('end_date', endDateIso);
  }
}

// ❌ Bad - Use-case-specific method names
class PlanRepository {
  findPlansForReporting(ownerId: string) {
    return this.client
      .from('plans')
      .select('id, user_id, title, plan_members(user_id, tier)')
      .eq('user_id', ownerId);
  }

  findPlansForDashboard(startDateIso: string, endDateIso: string) {
    return this.client
      .from('plans')
      .select('id, user_id, title, start_date, end_date, plan_destinations(destinations(name))')
      .gte('start_date', startDateIso)
      .lte('end_date', endDateIso);
  }
}
```

**4. No business logic in repositories**

Repositories should only handle data access. Business logic, validations, and complex transformations belong in the Service layer.

```typescript
// ✅ Good - Repository only handles data access
class PlanRepository {
  findByIdIncludeDestinations(id: string) {
    return this.client
      .from('plans')
      .select('id, user_id, title, plan_destinations(destinations(name))')
      .eq('id', id)
      .single();
  }

  updateVisibility(id: string, isPublic: boolean) {
    return this.client
      .from('plans')
      .update({ is_public: isPublic })
      .eq('id', id)
      .select('id, is_public')
      .single();
  }
}

class PlanService {
  async publishPlan(planId: string) {
    const plan = await this.planRepository.findByIdIncludeDestinations(planId);

    if (!plan) {
      throw new Error('Plan not found');
    }

    if (!plan.plan_destinations?.length) {
      throw new Error('Add at least one destination before publishing');
    }

    // Business logic: announce the plan
    await this.notificationService.notifyPlanPublished(plan);

    // Update visibility through repository
    return this.planRepository.updateVisibility(planId, true);
  }
}

// ❌ Bad - Business logic in repository
class PlanRepository {
  async publishPlan(planId: string) {
    const plan = await this.client
      .from('plans')
      .select('id, user_id, title, plan_destinations(destinations(name))')
      .eq('id', planId)
      .single();

    if (!plan) {
      throw new Error('Plan not found');
    }

    if (!plan.plan_destinations?.length) {
      throw new Error('Add at least one destination before publishing');
    }

    // ❌ Business logic shouldn't be here
    await this.notificationService.notifyPlanPublished(plan);

    return this.client
      .from('plans')
      .update({ is_public: true })
      .eq('id', planId)
      .select('id, is_public')
      .single();
  }
}
```

### Summary

- Method names should be concise: `findById` not `findBookingById`
- Use `include`/`with` keywords when fetching relations: `findByIdIncludeHosts`
- Keep methods generic and reusable: `findByUserIdIncludeAttendees` not `findBookingsForReporting`
- No business logic in repositories - that belongs in Services
