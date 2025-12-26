# Coding Standards & Best Practices

## Import Guidelines

### Type Imports

```typescript
// ✅ Good - Use type imports for TypeScript types
import type { NextRequest } from 'next/server';
import type { PostgrestError } from '@supabase/supabase-js';

// ❌ Bad - Regular import for types
import { NextRequest } from 'next/server';
```

## Code Structure

### Early Returns

- Prefer early returns to reduce nesting: `if (!plan) return null;`

### Composition Over Prop Drilling

- Use React children and context instead of passing props through multiple components

### ORM and Types

- Never import Supabase client in features, services, UI, or handlers.
- Use repository DTOs or domain types instead.
- See "Repository + DTO Pattern and Method Conventions" in the knowledge base for details and examples.

### Security Rules

```typescript
// ❌ NEVER expose privileged Supabase keys
return Response.json({
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY, // ❌ NEVER do this
});

// ✅ Good - Never include privileged keys in any response
return Response.json({ ok: true });
```

## Basic Performance Guidelines

- Aim for O(n) or O(n log n) complexity, avoid O(n²)
- Use database-level filtering instead of JavaScript filtering
- Consider pagination for large datasets
- Use database transactions for related operations
