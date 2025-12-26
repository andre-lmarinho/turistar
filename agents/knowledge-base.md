# Knowledge Base - Product & Domain-Specific Information

## Repo note for andre-lmarinho/travel-planner

This repo is a single Next.js app. Run commands from the repo root.

### Linting and Formatting

- Run lint: `npm run lint`
- Run type checking: `npm run typecheck:ci`
- Run auto-fix: `npm run lint`

### Development

- Install dependencies: `npm install`
- Set up environment:
  - Copy `.env.example` to `.env`
  - Generate secret values with `openssl rand -base64 32` for any non-public secrets you keep in `.env.local`

## When creating PRs

Use these recommendations to write pull requests that are easy to review, easy to test, and easy to maintain over time.

- For most PRs, you only need to run linting and type checking.
- Create pull requests in draft mode by default, so that actual human can mark it as ready for review only when it is.

### Title

- Use conventional commits: `feat:`, `fix:`, `refactor:`
- Be specific: `fix: handle timezone edge case in booking creation`
- Not generic: `fix: booking bug`

### Size Limits

- **Large PRs** (>500 lines or >10 files) are not recommended.
- Guide the user how to split large PRs into smaller ones.

### Description

Every PR description must answer four questions:

- What changed?
- Why it changed?
- How to test it?
- What should reviewers watch for?

Rules:

- Always explain the “why”.
- Assume the reviewer has no context.
- Use bullet points.
- Add screenshots for UI changes.

### PR Description Template

```md
## What does this PR do?

(describe the changes here)

## Related tickets

(link any related issues or past PRs here)

## Screenshots

(if applicable, add screenshots here)

## How to test

(steps for testing the changes)

## Notes

(any other information, optional)
```

## When reviewing PRs in this repository

When asked to review a PR, focus on providing a clear summary of what the PR is doing and its core functionality. Avoid getting sidetracked by CI failures, testing issues, or technical implementation details unless specifically requested. The user prefers concise, focused reviews that prioritize understanding the main purpose and changes of the PR.

## File Naming Conventions

### Repository Files

- **Must** include `Repository` suffix, PascalCase matching class: `SupabaseRepository.ts`

### Service Files

- **Must** include `Service` suffix, PascalCase matching class, avoid generic names: `MembershipService.ts`

### General Files

- **Components**: PascalCase (e.g., `PlannerBoard.tsx`)
- **Utilities**: camelCase (e.g., `dateUtils.ts`)
- **Types**: PascalCase with `.types.ts` suffix (e.g., `supabase.types.ts`)
- **Tests**: Same as source file + `.test.ts` or `.spec.ts`
- **Avoid**: Dot-suffixes like `.service.ts`, `.repository.ts` (except for tests, types, specs)

## Next.js App Directory: Authorisation Checks in Pages

This can include checking session.user exists or session.org etc.

### TL;DR:

Don’t put permission checks in layout.tsx! Always put them directly inside your page.tsx or relevant server components for every restricted route.

### Why Not to Use Layouts for Permission Checks

- Layouts don’t intercept all requests: If a user navigates directly or refreshes a protected route, layout checks might be skipped, exposing sensitive content.
- APIs and server actions bypass layouts: Sensitive operations running on the server can’t be guarded by checks in the layout.
- Risk of data leaks: Only page/server-level checks ensure that unauthorized users never get protected data.

### ✅ How To Secure Routes (The Right Way)

- Check permissions inside page.tsx or the actual server component.
- Perform all session/user/role validation before querying or rendering sensitive content.
- Redirect or return nothing to unauthorized users, before running restricted code.

### 🛠️ Example: Page-Level Permission Check

```tsx
// app/admin/page.tsx

import { redirect } from 'next/navigation';
import { getUserSession } from '@/lib/auth';

export default async function AdminPage() {
  const session = await getUserSession();

  if (!session || session.user.role !== 'admin') {
    redirect('/'); // Or show an error
  }

  // Protected content here
  return <div>Welcome, Admin!</div>;
}
```

### 🧠 Key Reminders

- Put permission guards in every restricted page.tsx.
- Never assume layouts are secure for guarding data.
- Validate users before any sensitive queries or rendering.
