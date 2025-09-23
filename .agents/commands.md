# Build, Test & Development Commands

## Development Commands

- `npm run dev` – Start the Next.js development server with Turbopack
- `npm run warmup` – Prime the development environment by running setup scripts
- `npm run setup` – Install dependencies and run format, lint, and test in sequence
- `npm run start` – Serve the production build locally

## Build Commands

- `npm run build` – Build the production bundle
- `npm run build:prod` – Alias for the production build (used by hosting providers)
- `npm run serve:prod` – Run the production server on 0.0.0.0:3000
- `npm run check:vercel` – Execute `vercel pull` + `vercel build` to validate deployment output
- `npm run vercel:pull` – Fetch the latest Vercel environment configuration
- `npm run vercel:build` – Run the local Vercel build with debug logs

## Lint & Type Check

- `npm run format` – Format source and test files with Prettier
- `npm run format:check` – Verify formatting without writing changes
- `npm run lint` – Run ESLint with the shared config and auto-fixes
- `npm run typecheck` – Run the TypeScript compiler in strict, no-emit mode

## Testing Commands

### Unit & Integration Tests

- `npm run test` – Execute the Vitest suite once (unit + integration)
- `npm run test -- tests/unit/<file>.test.tsx` – Run a specific unit test file
- `npm run test:watch` – Watch mode for iterative unit/integration testing
- `npm run test:coverage` – Collect coverage with V8 instrumentation

### End-to-End Tests

- Turistar does not yet ship Playwright e2e tests; rely on integration coverage and manual QA flows.

## Supabase Commands

- `npm run gen:types` – Generate Supabase TypeScript types into `src/types/supabase.ts`
- `supabase start` – Optional local Supabase instance for offline development (requires Supabase CLI)
- `supabase db reset` – Reset the local database when testing schema changes

## Useful Development Patterns

### Running Single Tests

```bash
# Run a single integration spec
npm run test -- tests/integration/planner/drag-and-drop.spec.tsx

# Watch a unit test file while developing a component
npm run test -- tests/unit/shared/components/map-card.test.tsx -- --watch

# Generate Supabase types after updating the database schema
npm run gen:types
```

### Environment Setup

- Copy `.env.example` to `.env.local`
- Provide `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_GEOAPIFY_KEY`
- Add optional `SUPABASE_SERVICE_ROLE_KEY` for server-side automation scripts
- Do not commit environment files—`.env.local` is ignored by Git
