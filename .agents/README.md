# Turistar Development Guide for AI Agents

This directory contains comprehensive documentation for AI agents working on the Turistar travel-planner codebase.

## Quick Navigation

- **[Commands](commands.md)** – Build, test, and utility scripts
- **[Coding Standards](coding-standards.md)** – Formatting, components, and security guidance
- **[Knowledge Base](knowledge-base.md)** – Domain knowledge, environment, and review expectations
- **[Architecture Overview](#architecture-overview)** – System structure and patterns

## Getting Started

Turistar is a single Next.js 15 application using the App Router with React 19 and Tailwind CSS. Node.js 20.x and npm 10.x are required for parity with CI.

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and provide Supabase and Geoapify credentials.
3. Start the development server via `npm run dev`.
4. Before committing, run `npm run format`, `npm run lint`, `npm run typecheck`, and `npm run test`.

### Key Directories

- `src/app/` – Next.js App Router entry points, layouts, routes, and metadata
- `src/features/` – Feature modules (planner, onboarding, home) containing UI, hooks, and services
- `src/shared/` – Shared UI components, hooks, utilities, constants, and Supabase clients
- `src/server/` – Server actions, API route handlers, and Geoapify proxy logic
- `src/data/` – Sample itineraries and seed data bundled with the app
- `config/` – Tooling configuration for ESLint, Vitest, and security headers
- `tests/` – Vitest unit and integration suites mirroring the source structure

## Architecture Overview

### Data Layer

- User-generated itineraries persist to Supabase via helpers in `src/shared/lib/`
- Public demo data lives in `src/data/` and is read-only at runtime
- Supabase types are generated into `src/types/supabase.ts` (see `npm run gen:types`)

### API Layer

- Server actions and API routes re-export logic from `src/server/`
- `/api/search` proxies Geoapify; always validate query params before forwarding requests
- Authentication relies on Supabase session helpers—never expose service role keys to the client

### Frontend

- React 19 functional components with hooks power each feature module
- Drag-and-drop behavior uses `@dnd-kit` sensors encapsulated in planner hooks
- Tailwind CSS provides styling; shadcn-derived components live under `src/shared/ui`
- Metadata, sitemap, and robots handling leverage Next.js metadata APIs and utilities in `src/shared/components/`

## Common Patterns

### Error Handling

- Prefer early returns for null/undefined checks to avoid deep nesting
- Wrap server interactions with user-friendly error messages and log raw errors only on the server
- Use Zod schemas to validate incoming data before passing to Supabase or external APIs

### State Management

- Planner state is provided via `PlannerContext` and derived hooks in `src/features/planner/hooks`
- When sharing values across components, expose typed context hooks instead of prop drilling
- Use TanStack Query for asynchronous fetching and cache invalidation when integrating new APIs

### Accessibility

- Follow the checklist in `docs/ACCESSIBILITY.md` for every UI change
- Provide path banner comments and annotate custom hooks per `docs/COMMENTING.md`
- Use semantic elements first, applying ARIA roles sparingly when semantics are insufficient

### Styling

- Keep styling utility-first with Tailwind; co-locate variants using `class-variance-authority`
- Extend `src/app/globals.css` tokens when adding new theme variables
- Only create ad-hoc CSS modules when Tailwind utilities cannot express the layout

## Testing Strategy

- Unit and integration tests use Vitest with React Testing Library (`npm run test`)
- Tests live under `tests/unit` and `tests/integration` using `*.test.ts(x)` and `*.spec.ts(x)` conventions
- Global mocks are centralized in `config/vitest.setup.tsx`; prefer local mocks only for test-specific behavior
- Accessibility assertions rely on `jest-axe`; keep them updated when modifying markup

## Pull Request Guidelines

- Keep documentation, types, and tests in sync with feature work—update relevant files in `docs/`
- Split large features into reviewable commits and reference related tickets in descriptions
- Write clear, descriptive commit messages (see `docs/CONTRIBUTING.md`)
- Ensure `npm run format`, `npm run lint`, `npm run typecheck`, and `npm run test` all pass before requesting review
- Run `npm run check:vercel` when changes may impact deployment output to confirm preview builds succeed
