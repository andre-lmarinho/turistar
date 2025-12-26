# Knowledge Base - Product & Domain-Specific Information

## Repo note for travel-planner/travel-planner

The whole thing is a monorepo. You need to be working in the src/features folder.

### Linting and Formatting

- Run lint: `npm run lint`
- Run type checking: `npm run typecheck`
- Run code format: `npm run format`

### PR Requirements

- PR title must follow Conventional Commits specification
- For most PRs, you only need to run linting, format and type checking

## Basic Performance Guidelines

- Aim for O(n) or O(n log n) complexity, avoid O(n²)
- Use database-level filtering instead of JavaScript filtering
- Consider pagination for large datasets
- Use database transactions for related operations

## File Naming Conventions

### Repository Files

- **Must** include `Repository` suffix, PascalCase matching class: `PlannerRepository.ts`

### Service Files

- **Must** include `Service` suffix, PascalCase matching class, avoid generic names: `MembershipService.ts`

### General Files

- **Components**: PascalCase (e.g., `ContactForm.tsx`)
- **Utilities**: kebab-case (e.g., `date-utils.ts`)
- **Types**: PascalCase with `.types.ts` suffix (e.g., `Contact.types.ts`)
- **Tests**: Same as source file + `.test.ts` or `.spec.ts`
- **Avoid**: Dot-suffixes like `.service.ts`, `.repository.ts` (except for tests, types, specs)

## Avoid barrel imports

```typescript
// ❌ Bad - Avoid importing from index.ts barrel files
import { BookingService, UserService } from './services';

// ✅ Good - Import directly from source files
import { BookingService } from './services/BookingService';
import { UserService } from './services/UserService';

// ❌ Bad
import { Button } from '@src/ui';

// ✅ Good - Import directly from source files
import { Button } from '@src/ui/components/button';
```

## When creating pull requests

Create pull requests in draft mode by default, so that actual human can mark it as ready for review only when it is.

When making changes to this codebase, always run type checks locally using before concluding that CI failures are unrelated to your changes. Even if errors appear in files you haven't directly modified, your changes might still be causing type issues through dependencies or type inference. Compare type check results between the main branch and your feature branch to confirm whether you've introduced new type errors.

### Title

- Use conventional commits: `feat:`, `fix:`, `refactor:`
- Be specific: `fix: handle timezone edge case in project creation`
- Not generic: `fix: project bug`

### Size Limits

- **Large PRs** (>500 lines or >10 files) are not recommended.
- Guide the user how to split large PRs into smaller ones.

## When reviewing pull requests

When asked to review a PR, focus on providing a clear summary of what the PR is doing and its core functionality. Avoid getting sidetracked by CI failures, testing issues, or technical implementation details unless specifically requested. The user prefers concise, focused reviews that prioritize understanding the main purpose and changes of the PR.

## When handling errors

### Descriptive Errors

```typescript
// ✅ Good - Provide context for failures
throw new Error(`Failed to render special card for ${project.slug}`);

// ❌ Bad - Too generic
throw new Error('Render failed');
```

### Error Types

```typescript
// ✅ Good - Use domain-specific helpers
function assertProject(project?: ProjectMeta): asserts project is ProjectMeta {
  if (!project) {
    throw new Error('Project configuration is missing');
  }
}
```

## When working on type issues

Type casting with "as any" is strictly forbidden. When encountering Supabase type incompatibilities or other TypeScript type issues, proper type-safe solutions must be used instead, such as Supabase extensions system, type parameter constraints, repository pattern isolation, explicit type definitions, and extension composition patterns that are already established in the codebase.

## When working with branches

When asked to move changes to a different branch, use git commands to commit existing changes to the specified branch rather than redoing the work. This is more efficient and prevents duplication of effort. The user prefers direct branch operations over reimplementing the same changes multiple times.

## When working with CI/CD

When reviewing CI check failures:

1. E2E tests can be flaky and may fail intermittently
2. Focus only on CI failures that are directly related to your code changes
3. Infrastructure-related failures (like dependency installation issues) can be disregarded if all code-specific checks (type checking, linting, unit tests) are passing

## When working with git and CI systems

Always push committed changes to the remote repository before waiting for or checking CI status. Waiting for CI checks on unpushed local commits is backwards - the CI runs on the remote repository state, not local commits. The proper sequence is: commit locally, run local checks, push to remote, then monitor CI status.

## When adding new UI elements or text strings

All UI strings must be properly translated using the i18n system. This includes:

- Labels for new UI elements (like dropdown labels, settings headers)
- Option values that are displayed to users
- Any text that appears in the interface

Even if some related strings are already translated (like "Planning" and "Insights"), new strings must be explicitly added to the translation system.

## When developing Playwright tests

Always ensure Playwright tests pass locally before pushing code. The user requires fast local e2e feedback loops instead of relying on CI, which is too slow for development iteration. Never push test code until those tests are passing locally first.

## When fixing failing tests

When fixing failing tests, take an incremental approach by addressing one file at a time rather than attempting to fix all issues simultaneously. This methodical approach makes it easier to identify and resolve specific issues without getting overwhelmed by the complexity of multiple failing tests across different files. Focus on getting each file's tests passing completely before moving on to the next file.

To identify and fix issues:

1. Run `npm run typecheck` to identify TypeScript type errors and get fresh results always, bypassing any caching issues
2. Run `npm run test` to identify failing unit tests
3. Address both type errors and failing tests before considering the task complete
4. Type errors often need to be fixed first as they may be causing the test failures

## When implementing mocks

When mocking tests, prefer implementing simpler mock designs that directly implement the required interfaces rather than trying to match complex deep mock structures created with mockDeep. This approach is more maintainable and helps resolve type compatibility issues. The user encourages creative solutions and refactoring to better designs when the standard mocking approach causes persistent type errors.
