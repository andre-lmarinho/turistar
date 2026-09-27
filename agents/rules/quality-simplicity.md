---
title: Prioritize Clarity Over Cleverness
impact: HIGH
impactDescription: Keeps implementations easy to understand and change
tags: quality, simplicity, readability
---

# Prefer simple implementations

Solve the current problem with code another contributor can follow quickly. Avoid abstractions introduced only for possible future uses. Simplicity should preserve the functionality the task requires.

Before adding complexity, check:

- Does this solve the requested behavior?
- Is the extra abstraction needed by an existing caller?
- Is there a clearer alternative, and what does it change?

For example, grouping items is easy to read as a loop:

```typescript
const groupedById: Record<string, Item[]> = {};

for (const item of data) {
  if (!groupedById[item.id]) groupedById[item.id] = [];
  groupedById[item.id].push(item);
}
```
