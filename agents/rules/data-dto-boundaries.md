---
title: Use DTOs at Every Architectural Boundary
impact: CRITICAL
impactDescription: Prevents technology coupling and security risks
tags: data, dto, boundaries, security, types
---

## Use DTOs at Every Architectural Boundary

**Impact: CRITICAL**

Database types should not leak to the frontend. This has become a popular shortcut in our tech stack, but it's a code smell that creates multiple problems.

**Problems with leaking database types:**
- Technology coupling (Supabase row types end up in React components)
- Security risks (accidental leakage of sensitive fields)
- Fragile contracts between server and client
- Inability to evolve the database schema independently

**Incorrect (database types leaking):**

```typescript
// API route returning Supabase row types directly
import type { Database } from '@/shared/types/supabase';
type UserRow = Database['public']['Tables']['users']['Row'];

export async function GET(): Promise<UserRow> {
  const { data } = await supabase.from('users').select('*').single();
  return data; // Leaks all database fields including sensitive ones
}

// Frontend using Supabase row types
import type { Database } from '@/shared/types/supabase';
type UserRow = Database['public']['Tables']['users']['Row'];

function UserProfile({ user }: { user: UserRow }) {
  // Component now coupled to database schema
}
```

**Correct (explicit DTOs):**

```typescript
// Define explicit DTOs
interface UserDTO {
  id: number;
  name: string;
  email: string;
  // Only fields needed by the client
}

// API route transforms to DTO
export async function GET(): Promise<UserDTO> {
  const user = await userRepository.findById(id);
  return UserResponseSchema.parse(user); // Validate with Zod
}

// Frontend uses DTO
function UserProfile({ user }: { user: UserDTO }) {
  // Component decoupled from database
}
```

**The standard:**
1. **Data layer → Application layer → API**: Transform database models into application-layer DTOs, then transform application DTOs into API-specific DTOs
2. **API → Application layer → Data layer**: Transform API DTOs through application layer and into data-specific DTOs
3. All DTO conversions through Zod to ensure all data is validated before sending to user

### DTO Location and Naming

**Location**: All DTOs go in `packages/lib/dto/`

**Naming conventions**:
- Base entity: `{Entity}Dto` (e.g., `ActivityDto`)
- With relations: `{Entity}With{Relations}Dto` (e.g., `ActivityWithAttendeesDto`)
- For specific projections: `{Entity}For{Purpose}Dto` (e.g., `ActivityForConfirmationDto`)
- Avoid: `{Entity}Dto2`, `{Entity}DtoForHandler`, or other use-case-specific names

**Enum/union pattern** - use string literal unions to stay ORM-agnostic:

```typescript
// Good - ORM-agnostic string literal union
export type PlanStatusDto = "DRAFT" | "PUBLISHED" | "ARCHIVED";

// Bad - importing Supabase enum types
import type { Database } from '@/shared/types/supabase';
type PlanStatus = Database['public']['Enums']['plan_status'];
```

**Type safety** - never use `as any` in DTO mapping functions. If types don't align, fix the mapping explicitly.

### Supabase Boundaries

- **Allowed**: server-only data access layers (repositories + adapters).
- **Not allowed**: UI, services, or handlers consuming the Supabase client directly.

Server-only is a rule, not a detail. Repositories never import the browser Supabase client. Repositories live and run on the server (server actions, route handlers, edge functions). UI calls services or server actions; UI does not call repositories directly.

Yes, this requires more code. Yes, it's worth it. Explicit boundaries prevent the architectural erosion that creates long-term maintenance nightmares.