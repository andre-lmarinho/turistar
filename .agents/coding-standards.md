## Import Guidelines

### Type Imports

```typescript
// ✅ Good - Use type imports for TypeScript types
import type { SupabaseClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

// ❌ Bad - Regular import for types
import { SupabaseClient } from '@supabase/supabase-js';
```

## Code Structure

### Early Returns

- Prefer early returns to reduce nesting: `if (!session) return redirect("/login");`

### Composition Over Prop Drilling

- Use React children and context instead of passing props through multiple components

### Security Rules

```typescript
// ❌ NEVER log or expose service-role keys
const client = createSupabaseClient(process.env.SUPABASE_SERVICE_ROLE_KEY!); // ❌ avoid leaking secrets

// ✅ Good - Scope keys to secure environments and never send them to the client
const client = createSupabaseClient({
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  anonymousKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
});
```
