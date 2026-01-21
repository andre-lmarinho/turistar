# Build, Test & Development Commands

## Development Commands

- `npm run dev` - Start development server for web app
- `npm run dev:e2e` - Start dev server with E2E flags on port 3100

## Build Commands

- `npm run build` - Build all packages and apps
- `npm run build:prod` - Alias for the production build pipeline
- `npm run start` - Serve the compiled build locally
- `npm run serve:prod` - Serve build on 0.0.0.0:3000
- `npm run clean` - Remove build artifacts and dependencies

## Lint & Type Check

- `npm run lint` - Run Biome Lint on codebase
- `npm run lint:fix` - Run Biome and apply safe fixes
- `npm run typecheck` - Run TypeScript type checking
- `npm run typecheck:ci` - Run TypeScript type checking in CI
- `npm run format` - Format code with Biome

## Testing Commands

### Unit Tests

- `npm run test` - Run unit tests (vitest)
- `npm run test -- <filename>` - Run tests for specific file
- `npm run test -- <filename> -t "<testName>"` - Run specific test by name
- `npm run test:watch` - Run tests in watch mode

### Integration Tests

- `npm run test -- "**/*.integration.test.ts"` - Run integration tests (vitest)
- `npm run test -- <filename>` - Run integration tests for specific file
- `npm run test -- <filename> -t "<testName>"` - Run specific integration test by name

### End-to-End Tests

- `npm run e2e` - Run end-to-end tests (Playwright)
- `npm run e2e -- <filename>` - Run E2E tests for specific file
- `npm run e2e -- <filename> --grep "<testName>"` - Run specific E2E test by name
- `npm run e2e:update` - Update Playwright snapshots

## Database Commands

- `npm run gen:types` - Generate Supabase types (requires `SUPABASE_PROJECT_ID`)

## Useful Development Patterns

### Running Single Tests

```bash
# Unit test specific file
npm run test -- tests/some-file.test.ts

# Integration test specific file
npm run test -- tests/some-file.integration.test.ts

# E2E test specific file
npm run e2e -- tests/planning-flow.e2e.ts

# Run specific test by name
npm run e2e -- tests/planning-flow.e2e.ts --grep "should create plan"
```

### Environment Setup

- Copy `.env.example` to `.env` and configure
- Run `npm run dev` for initial development setup with database

