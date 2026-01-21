---
title: Avoid Barrel Imports
impact: MEDIUM
impactDescription: Improves tree-shaking and reduces bundle size
tags: imports, performance, bundling
---

## Avoid Barrel Imports

**Impact: MEDIUM (Improves tree-shaking and reduces bundle size)**

Barrel files (index.ts that re-export from multiple modules) can hurt tree-shaking and increase bundle sizes. Import directly from source files instead.

**Incorrect (importing from barrel files):**

```typescript
// Importing from index.ts barrel files
import { ActivityService, UserService } from "./services";

// Importing from ui barrel
import { Button } from "@/shared/ui";
```

**Correct (importing directly from source):**

```typescript
// Import directly from source files
import { ActivityService } from "./services/ActivityService";
import { UserService } from "./services/UserService";

// Import directly from component path
import { Button } from "@/shared/ui/button";
```
