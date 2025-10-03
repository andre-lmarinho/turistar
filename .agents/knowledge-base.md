# Knowledge Base - Product & Domain-Specific Information

## Repo note for andre-lmarinho/travel-planner

Turistar is a single Next.js 15 application (React 19, TypeScript, Tailwind) that lives entirely in the `src/` directory. There are no workspaces or sub-packages—focus all changes within this app. Use Node.js 20.x and npm 10.x to match CI.

Linting and Formatting

- Run `npm run format` to apply Prettier with semicolons, single quotes, and 100-character width
- Run `npm run lint` to execute ESLint with project rules (auto-fixing is enabled by default)
- Run `npm run typecheck` to confirm the TypeScript program compiles cleanly

Development

- Install dependencies via `npm install`
- Copy `.env.example` to `.env.local`
- Provide Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, optional `SUPABASE_SERVICE_ROLE_KEY`) and Geoapify (`NEXT_PUBLIC_GEOAPIFY_KEY`) credentials
- Start the development server with `npm run dev`

Database Setup

- The hosted Supabase project powers persistence; local development can use Supabase CLI for an offline database if desired
- Generate typed bindings after schema updates using `npm run gen:types`
- Never expose service role keys in client bundles—keep privileged access in server-only utilities inside `src/shared/lib/`

PR Requirements

- Commit messages must be clear, concise, and written in English
- Every PR must pass `npm run format`, `npm run lint`, `npm run typecheck`, and `npm run test`
- Update relevant docs in `docs/` when behavior, APIs, or environment variables change
- Keep Supabase types (`src/types/supabase.ts`) and planner schemas in sync when modifying database tables

Accessibility

- Adhere to the checklist in `docs/ACCESSIBILITY.md` for each UI change
- Provide accessible names for map components using `aria-label="Itinerary map"`
- Ensure drag-and-drop interactions remain keyboard accessible through focus management hooks in `src/features/planner/hooks`

Testing

- Vitest + React Testing Library cover unit and integration scenarios; add tests under `tests/unit` or `tests/integration` mirroring source paths
- Global testing utilities live in `config/vitest.setup.tsx` and stub Next.js modules plus Leaflet CSS imports
- Accessibility assertions leverage `jest-axe`; include or update them when adjusting semantic markup

State & Data Flow

- Planner data is managed via `PlannerContext` with persistence handled by hooks such as `usePlanDaysSupabase`
- The drag-and-drop board relies on `useDnDPlanner` and `useDragState`; extend these hooks rather than reimplementing sensors
- Sample itineraries in `src/data/` should remain read-only; create new fixtures there for demos instead of mutating at runtime

API Integrations

- `/api/search` proxies Geoapify lookups; sanitize all inputs and limit results using helper functions in `src/server/api`
- Server actions in `src/server/` centralize Supabase mutations; reuse them from components to keep business logic off the client

Deployment & Observability

- Use `npm run check:vercel` before shipping changes that influence build output, metadata, or environment configuration
- Security headers are defined in `config/securityHeaders.ts` and applied in `next.config.ts`; update both together when altering policies
- Logging should avoid leaking secrets—surface only user-friendly messages to the client and log details server-side via shared utilities

Documentation Expectations

- Follow `docs/COMMENTING.md` for path banners and hook summaries
- Keep architecture, testing, and deployment docs up to date alongside code changes
- All written communication (docs, comments, commit messages, PR summaries) must be in English
