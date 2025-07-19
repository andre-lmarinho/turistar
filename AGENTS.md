# Project Agents.md Guide

This `Agents.md` file provides comprehensive guidance for any AI agents working with this codebase.

## Project Structure

- `/src`: Source code to be analyzed and maintained by AI agents
  - `/components`: React components that should follow the guidelines in this document
  - `/app`: Next.js app directory with pages and API routes
  - `/constants`: Shared configuration values
  - `/data`: Local JSON used for demo itineraries
  - `/hooks`: Custom React hooks
  - `/lib`: Shared helper functions
  - `/types`: TypeScript types
  - `/utils`: Planner utilities
- `/public`: Static assets served directly

## Coding Conventions

- **Language**: All documentation, inline code comments, commit messages and PR descriptions must be written in English.
- **Formatting**: Run `npm run format` before committing. The project uses Prettier with semicolons, single quotes and `printWidth` 100.
- **Linting**: Ensure `npm run lint` passes.
- **Tests**: Execute `npm run test` and make sure tests succeed.
- **Commit style**: Use short, imperative, English commit messages. Prefix with `feat:`, `fix:`, `chore:`, etc. when applicable.

## General Conventions for AI Agents

- Use TypeScript for all new code.
- Follow the existing code style in each file.
- Write meaningful variable and function names.
- Add comments for complex logic.

## React Components Guidelines

- Use functional components with hooks.
- Keep components small and focused.
- Always define prop types properly.
- Use PascalCase for custom component filenames. The `/src/components/ui` directory intentionally retains the lowercase naming style inherited from shadcn-ui.

### Export Conventions

To keep code clear and maintainable, we recommend:

- **React Components**
  - One component per file.
  - Use `export default` so importers immediately know what the file provides.

- **Hooks / Utilities / Constants / Types**
  - Files that export multiple items should use named exports.
  - Improves tree‑shaking and makes available symbols explicit.

- **Barrel Files (`index.ts`)**
  - Re‑export default component exports as named exports.
  - Re-export named exports from hooks/util modules.

This approach ensures consistent imports, better IDE support, and safer refactoring when renaming files or symbols.```

## CSS/Styling Standards

- Use Tailwind CSS for styling.
- Follow a utility-first approach.
- Write custom CSS only when necessary.
- Use global.css as source code.

## Testing Requirements

Run tests using the following commands:

```bash
# Run all tests
npm test

# Run a specific test file
npm test -- path/to/test-file.test.ts

# Run tests with coverage
npm test -- --coverage
```
