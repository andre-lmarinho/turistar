# Project Agents.md Guide

This `Agents.md` file provides comprehensive guidance for any AI agents working with this codebase.

## Project Structure

- `/docs`: Project notes and guidelines
- `/config`: Centralized tool configs (ESLint, Vitest, etc.)
- `/src`: Source code to be analyzed and maintained by AI agents
  - `/app`: Next.js app directory with pages and API routes
  - `/features`: Feature modules such as planner and onboarding
  - `/shared`: Shared UI components, hooks, utilities and types
  - `/server`: Server actions and API handlers
  - `/data`: Local JSON used for demo itineraries
- `/public`: Static assets served directly

## Coding Conventions

- Language: All documentation, inline code comments, commit messages and PR descriptions must be written in English. Do not use any other language.
- Formatting: Run `npm run format` before committing. The project uses Prettier with semicolons, single quotes and `printWidth` 100.
- Linting: Ensure `npm run lint` passes.
- Type checking: Ensure `npm run typecheck` passes.
- Tests: Execute `npm run test` and make sure tests succeed.
- Warnings: Warnings from linting, type checking, testing or any other tools are undesirable and should be resolved.
- Commit style: Start commits with an appropriate Gitmoji followed by a short, capitalized description in English (e.g., `:sparkles: Add map view`). A commitlint hook enforces this format, and commit suggestions after PR/merge must also use Gitmoji.

Note: Tailwind and Next configs remain at the repository root for compatibility (`tailwind.config.ts`, `next.config.ts`).

## General Conventions for AI Agents

- Use TypeScript for all new code.
- Follow the existing code style in each file.
- Write meaningful variable and function names.
- Add comments for complex logic.
- Follow the commenting conventions in [docs/DEVELOPER_GUIDE.md#commenting](docs/DEVELOPER_GUIDE.md#commenting).
- Keep all documentation up to date after each interaction so changes stay synchronized with the codebase.

## React Components Guidelines

- Use functional components with hooks.
- Keep components small and focused.
- Always define prop types properly.
- Use PascalCase for custom component filenames. The `/src/shared/ui` directory intentionally retains the lowercase naming style inherited from shadcn-ui.

### Export Conventions

To keep code clear and maintainable, we recommend:

- React Components
  - One component per file.
  - Use `export default` so importers immediately know what the file provides.

- Hooks / Utilities / Constants / Types
  - Files that export multiple items should use named exports.
  - Improves tree-shaking and makes available symbols explicit.

- Barrel Files (`index.ts`)
  - Re-export default component exports as named exports.
  - Re-export named exports from hooks/util modules.

This approach ensures consistent imports, better IDE support, and safer refactoring when renaming files or symbols.

## CSS/Styling Standards

- Use Tailwind CSS for styling.
- Follow a utility-first approach.
- Write custom CSS only when necessary.
- Use global.css as source code.

## Testing Requirements

Run tests using the following commands:

```bash
# Run all tests
npm run test

# Run a specific test file
npm run test -- path/to/test-file.test.ts

# Run tests with coverage
npm run test -- --coverage
```

## Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Testing](docs/TESTING.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Developer Guide](docs/DEVELOPER_GUIDE.md)
- [Contributing](docs/CONTRIBUTING.md)
