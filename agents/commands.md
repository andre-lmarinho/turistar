# Build, Test & Development Commands

## Development Commands

- `pnpm dev` - Start development server for web app
- `pnpm dev:e2e` - Start dev server with E2E flags on port 3100

## Build Commands

- `pnpm build` - Build all packages and apps
- `pnpm build:prod` - Alias for the production build pipeline
- `pnpm start` - Serve the compiled build locally
- `pnpm serve:prod` - Serve build on 0.0.0.0:3000
- `pnpm clean` - Remove build artifacts and dependencies

## Lint & Type Check

- `pnpm lint` - Run Biome Lint on codebase
- `pnpm lint:fix` - Run Biome and apply safe fixes
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm typecheck:ci` - Run TypeScript type checking in CI
- `pnpm format` - Format code with Biome

## Testing Commands

### Unit Tests

- `pnpm test` - Run unit tests (vitest)
- `pnpm test -- <filename>` - Run tests for specific file
- `pnpm test -- <filename> -t "<testName>"` - Run specific test by name
- `pnpm test:watch` - Run tests in watch mode

### Integration Tests

- `pnpm test -- "**/*.integration.test.ts"` - Run integration tests (vitest)
- `pnpm test -- <filename>` - Run integration tests for specific file
- `pnpm test -- <filename> -t "<testName>"` - Run specific integration test by name

### End-to-End Tests

- `pnpm e2e` - Run end-to-end tests (Playwright)
- `pnpm e2e -- <filename>` - Run E2E tests for specific file
- `pnpm e2e -- <filename> --grep "<testName>"` - Run specific E2E test by name
- `pnpm e2e:update` - Update Playwright snapshots

## Database Commands

- `pnpm gen:types` - Generate Supabase types (requires `SUPABASE_PROJECT_ID`)

## Useful Development Patterns

### Running Single Tests

```bash
# Unit test specific file
pnpm test -- tests/some-file.test.ts

# Integration test specific file
pnpm test -- tests/some-file.integration.test.ts

# E2E test specific file
pnpm e2e -- tests/planning-flow.e2e.ts

# Run specific test by name
pnpm e2e -- tests/planning-flow.e2e.ts --grep "should create plan"
```

### Environment Setup

- Copy `.env.example` to `.env` and configure
- Run `pnpm dev` for initial development setup with database

