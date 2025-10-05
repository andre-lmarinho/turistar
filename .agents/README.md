# Travel Planner Development Guide for AI Agents

This directory contains comprehensive documentation for AI agents working on the Travel Planner codebase.

## Quick Navigation

- **[Commands](commands.md)** - Build, test, and development commands
- **[Knowledge Base](knowledge-base.md)** - Knowledge base & best practices
- **[Architecture Overview](#architecture-overview)** - System structure and patterns

## Getting Started

Travel Planner is a monorepo using npm workspaces for build orchestration. The main application is in `src/features/` with shared packages in `src/shared/`.

### Key Directories

- `src/app/` – Main Next.js application
- `src/features/` – Feature modules
- `src/shared/` – Shared components
- `src/server/` – Server actions, API route handlers, and Geoapify proxy logic

## Architecture Overview

### Database Layer

- **Supabase** with PostgreSQL
- Schema in `supabase/migrations/`
- Always use `select` instead of `include` for better performance
- Never expose `credential.key` field in API responses

### API Layer

- Server actions and route handlers mediate access to data workflows
- Supabase-authenticated sessions flow through shared server utilities
- Background tasks rely on Next.js server functions and scheduled Supabase jobs

### Frontend

- **Next.js 15** with App Router in some areas
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- Internationalization with `next-i18next`

## Common Patterns

### Error Handling

- Use early returns to reduce nesting
- Throw descriptive errors with proper error codes
- Prefer composition over prop drilling

### Performance

- Avoid O(n²) logic in backend code
- Use `select` queries to only fetch needed data

### Security

- Never commit secrets or API keys
- Always validate input data
- Use proper authentication checks
- Never expose sensitive credential fields

## Testing Strategy

- **Unit tests** with Vitest
- **Integration tests** for complex workflows
- **E2E tests** with Playwright
- Test files use `.test.ts` or `.spec.ts` extensions

## Pull Request Guidelines

For large PRs (>500 lines or >10 files):

- Split by feature boundaries
- Separate database migrations, backend logic, frontend components
- Create dependency chains that can be merged sequentially
- Pattern: Database → Backend → Frontend → Tests
