# Turistar Development Guide for AI Agents

**📖 Complete documentation is in the [.agents/](.agents/) directory.**

## Quick Reference

### Essential Commands

- `npm run dev` – Start the Next.js development server with Turbopack
- `npm run build` – Build the production bundle
- `npm run lint` – Lint the repository with ESLint (fails on warnings)
- `npm run typecheck` – Run the TypeScript compiler in no-emit mode
- `npm run test` – Execute the Vitest unit and integration suites
- `npm run format` – Format source and test files with Prettier
- `npm run format:check` – Verify repository formatting with Prettier

### CI Expectations

- Execute **all** project validators and CI checks (format, lint, typecheck, and test) before finalizing any implementation to avoid avoidable regressions.

## Tool Preferences

### Search Tools Priority

Use tools in this order of preference:

1. **rg (ripgrep)** – Fast codebase-aware text searches
2. **find** – Directory-aware file discovery when rg is insufficient
3. **grep** – Fallback text search for edge cases

## 📚 Detailed Documentation

- **[.agents/README.md](.agents/README.md)** – Complete development guide
- **[.agents/coding-standards.md](.agents/coding-standards.md)** – Style and implementation conventions
- **[.agents/commands.md](.agents/commands.md)** – Build, test, and utility scripts
- **[.agents/knowledge-base.md](.agents/knowledge-base.md)** – Project knowledge base & best practices
