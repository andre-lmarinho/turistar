---
title: Type Imports Only
impact: HIGH
impactDescription: Eliminates runtime overhead and enables better tree-shaking
tags: typescript, imports, types, performance
---

## Type Imports Only

Use `import type` for TypeScript type imports to eliminate runtime overhead. Regular imports for types add unnecessary code to bundle.

**Incorrect (regular imports for types):**

```typescript
// Bad: Regular imports for types
import { NextRequest } from 'next/server';
import { User } from '@/types/user';

export async function handler(req: NextRequest) {
  const user: User = await getUser();
  return Response.json({ user });
}
```

**Correct (type imports):**

```typescript
// Good: Type imports for TypeScript types
import type { NextRequest } from 'next/server';
import type { User } from '@/types/user';

export async function handler(req: NextRequest) {
  const user: User = await getUser();
  return Response.json({ user });
}
```

**Mixed Imports:**

```typescript
// Good: Separate type and runtime imports
import type { User } from '@/types/user';
import { getUserService } from '@/services/user';
```

**Benefits:**

Zero runtime cost with optimal bundle size and clearer code.