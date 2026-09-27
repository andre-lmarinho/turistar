---
title: Repository Method Naming Conventions
impact: HIGH
impactDescription: Makes query behavior easier to discover
tags: data, repository, naming, methods
---

# Repository method names

Use concise names that describe the data operation and its result.

| Convention | Example |
| --- | --- |
| Avoid repeating the repository's entity name | `findById`, `create`, `delete` |
| Make included relationships visible | `findByIdWithMembers` |
| Describe selection criteria rather than a screen or report | `findByOwnerId` |
| Keep business actions in Services | A Service coordinates validation and Repository calls |

Names such as `include`, `with`, or `andRelations` should reflect the relationships actually returned. Keep queries reusable without adding abstractions for hypothetical callers.

Existing methods include `fetchPlanIdentityById` and `fetchPlanByIdWithMembers` in [PlanRepository](../../src/features/plan/repositories/PlanRepository.ts). Check existing callers before changing a public method name.

Repositories handle data access. Business validation, membership decisions, and complex domain transformations belong in Services; see [repository boundaries](data-repository-pattern.md).
