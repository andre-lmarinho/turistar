# Build, Test & Development Commands

## Development Commands

- `npm run dev` - Start development server for web app

## Build Commands

- `npm run build` - Build all packages and apps
- `npm run build:prod` - Alias for the production build pipeline
- `npm run start` - Serve the compiled build locally
- `npm run clean` - Remove build artifacts and dependencies

## Lint & Type Check

- `npm run lint` - Run ESLint on codebase
- `npm run typecheck` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Run format check with Prettier

## Testing Commands

### Unit & Integration Tests

- `npm run test` - Run the Vitest suite once
- `npm run test:watch` - Run Vitest in watch mode during development
- `npm run test:coverage` - Generate coverage reports with Vitest

### End-to-End Tests

- Travel Planner does not include automated end-to-end scripts.

## Database Commands

- `npm run gen:types` - Regenerate Supabase public schema

## Useful Development Patterns

### Running Single Tests

```bash
# Run a single test file
npm run test -- <relative-test-path>

# Focus on an integration test suite
npm run test -- <relative-integration-test-path>

# Watch a specific test suite during refactors
npm run test:watch -- <relative-test-path>

# E2E test specific file
e2e is not implemented

# Run specific test by name
e2e is not implemented
```
