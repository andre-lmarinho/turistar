# Coding Standards & Best Practices

## Import Guidelines

### Type Imports

```typescript
// ✅ Good – Use type-only imports for TypeScript definitions
import type { Metadata } from 'next';
import type { Database } from '@/types/supabase';

// ❌ Bad – Value imports for types trigger unnecessary runtime code
import { Metadata } from 'next';
import { Database } from '@/types/supabase';
```

### Module Aliases

- Prefer the `@/` alias instead of long relative paths: `import { PlannerControls } from '@/features/planner';`
- Keep absolute imports grouped before relative imports; maintain alphabetical ordering within each group.

## Code Structure

### Early Returns

- Guard against missing data (`if (!plan) return null;`) to keep components shallow and readable.
- When fetching data, validate with Zod and exit early on parsing failures to prevent cascading errors.

### Composition Over Prop Drilling

- Share state through context providers (e.g., `PlannerContext`) and custom hooks.
- Break complex UI into small components that compose shared primitives from `src/shared/ui`.

### Security Rules

```typescript
// ❌ NEVER expose service-role secrets or unrestricted Supabase queries to the client
const supabase = createClient(process.env.SUPABASE_SERVICE_ROLE_KEY!); // ❌ do not instantiate on the client

// ✅ Good – Use the shared server client and select explicit columns
import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';

const supabase = await createSupabaseServerClient();
const { data } = await supabase
  .from('plans')
  .select('id, title, trip_start, trip_end')
  .eq('user_id', userId);
```

## Component Patterns

- Implement new UI with React function components and TypeScript typings for props.
- Follow `docs/COMMENTING.md`: add path banner comments and document custom hooks with summary blocks.
- Keep planner-specific logic under `src/features/planner/` and export a single default component per file when possible.

## Styling

- Favor Tailwind utility classes; extend variants with `class-variance-authority` when components need style permutations.
- Update `src/app/globals.css` tokens if introducing new theme colors or spacing values.
- Avoid inline styles except for dynamic CSS variables.

## Tooling Requirements

- All documentation, code comments, commit messages, and PR descriptions must be written in English.
- Run `npm run format`, `npm run lint`, `npm run typecheck`, and `npm run test` before pushing changes.
- Commit messages must be written in clear, descriptive English.
