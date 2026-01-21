---
title: File Naming Conventions
impact: CRITICAL
impactDescription: Ensures consistency and discoverability across codebase
tags: file-structure, naming, conventions, organization
---

## File Naming Conventions

Consistent file naming makes codebase predictable and easy to navigate.

**Repository Files:**

Repository files must include `Repository` suffix and use PascalCase.

```typescript
// Bad: Generic names, no suffix
export class PlanRepo { }

// Good: Clear naming with Repository suffix
export class PlanRepository { }
```

**Service Files:**

Service files must include `Service` suffix and use PascalCase.

```typescript
// Bad: Generic names
export class Manager { }

// Good: Descriptive names with Service suffix
export class MembershipService { }
```

**Component Files:**

React components must use PascalCase.

```typescript
// Bad: camelCase or kebab-case
export const userProfile = () => { };

// Good: PascalCase for components
export const UserProfile = () => { };
```

**Benefits:**

Predictable file structure with better discoverability and consistency.