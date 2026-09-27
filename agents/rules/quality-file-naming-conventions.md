---
title: File Naming Conventions
impact: CRITICAL
impactDescription: Makes file roles and exported classes easier to identify
tags: file-structure, naming, conventions
---

# Name files for their role

| File type | Convention | Example |
| --- | --- | --- |
| Repository class | PascalCase with `Repository` suffix | `PlanRepository.ts` |
| Service class | PascalCase with `Service` suffix | `PlanService.ts` |
| React component | PascalCase | `Button.tsx` |

Use descriptive class and component names that match their files. Avoid generic names such as `Manager` or shortened suffixes such as `Repo`.

Next.js route files retain framework names such as `page.tsx`, `layout.tsx`, and `route.ts`. Existing screen entry files also include names such as `planid-view.tsx`; check imports before renaming an existing file.

Examples: [PlanRepository](../../src/features/plan/repositories/PlanRepository.ts), [PlanService](../../src/features/plan/services/PlanService.ts), and [Button](../../src/ui/components/button/Button.tsx).
