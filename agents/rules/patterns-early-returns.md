---
title: Early Returns Pattern
impact: MEDIUM
impactDescription: Reduces nesting and improves code readability
tags: patterns, readability, structure, early-return
---

## Early Returns Pattern

Use early returns to reduce nesting. Handle edge cases at function start, then focus on happy path.

**Incorrect (deep nesting):**

```typescript
// Bad: Deep nesting with multiple if statements
export async function getUserPlan(userId, planId) {
  const user = await getUserById(userId);
  if (user) {
    const plan = await getPlanById(planId);
    if (plan) {
      if (plan.ownerId === userId) {
        return { user, plan };
      } else {
        throw new Error('Not plan owner');
      }
    } else {
      throw new Error('Plan not found');
    }
  } else {
    throw new Error('User not found');
  }
}
```

**Correct (early returns):**

```typescript
// Good: Early returns for validation, then happy path
export async function getUserPlan(userId, planId) {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const plan = await getPlanById(planId);
  if (!plan) {
    throw new Error('Plan not found');
  }

  if (plan.ownerId !== userId) {
    throw new Error('Not plan owner');
  }

  // Happy path - all validation passed
  return { user, plan };
}
```

**Benefits:**

Cleaner code flow with better readability and maintainability.