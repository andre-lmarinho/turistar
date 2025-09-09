# Developer Guide

This guide condenses environment, routing, style, and accessibility notes for Turistar.

## Environment

Set these variables in `.env.local` and your hosting platform:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GEOAPIFY_KEY`
- `VERCEL_TOKEN` (optional; required only for CI or non-interactive `vercel pull`)

Supabase clients live in `src/shared/lib/supabaseClient.ts` and `src/shared/lib/supabaseServer.ts`.

## Configuration

Centralized project configuration files reside in the `/config` directory. It houses ESLint, Tailwind CSS, PostCSS, commitlint, and Vitest settings. The test environment is initialized via `config/vitest.setup.tsx`.

## Routing

The `src/app` directory wires pages and API routes. It should stay thin:

- Pages import UI logic from `src/features`
- API routes and server actions re-export handlers from `src/server`
- `/api/search` proxies Geoapify for destination lookup

## Style

- Use Tailwind utility classes
- Reference design tokens from `src/app/globals.css` via `var(--token-name)`
- For `class-variance-authority`, export a `<Component>Variants` constant and use `VariantProps` for typing

## Commenting

- Start files with a path banner: `// src/<path>`
- Summarize custom hooks in a block comment at the top
- Explain non-obvious logic with inline comments
- Label large JSX sections with JSX comments
- Note unusual design decisions briefly

## Accessibility

Aim for WCAG 2.1 AA compliance:

- Provide text alternatives and clear labels
- Ensure color contrast and visible focus states
- Keep touch targets at least 44×44 px and support keyboard navigation
- Use semantic HTML and ARIA roles only when necessary
