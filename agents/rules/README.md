# Engineering Rules

This directory contains modular, machine-readable engineering rules.

## When to Apply

Reference these guidelines when:
- Writing new React components or Next.js pages
- Implementing data fetching (client or server-side)
- Reviewing code for performance issues
- Refactoring existing React/Next.js code
- Optimizing bundle size or load times

## Structure

Rules are organized by section prefix, as defined in `_sections.md`:

| Prefix | Category | Impact |
|--------|---------|--------|
| `architecture-` | Architecture | CRITICAL |
| `quality-` | Code Quality | CRITICAL |
| `security-` | Security | CRITICAL |
| `data-` | Data Layer | HIGH |
| `api-` | API Design | HIGH |
| `performance-` | Performance | HIGH |
| `uiux-` | UI/UX | HIGH |
| `testing-` | Testing | MEDIUM-HIGH |
| `patterns-` | Design Patterns | MEDIUM |

## Quick Reference

### Configuration Files

- `_sections.md` - Defines all sections, their ordering, and impact levels
- `_template.md` - Template for creating new rules

### 1. Architecture (CRITICAL)

- `architecture-page-level-auth` - Authorization checks in pages, not layouts
- `architecture-vertical-slices` - Organize code by domain, not technical layer

### 2. Code Quality (CRITICAL)

- `quality-file-naming-conventions` - Repository/Service suffixes, PascalCase/camelCase patterns
- `quality-simplicity` - Prioritize clarity over cleverness

### 3. Security (CRITICAL)

- `security-supabase-key-protection` - Never expose service role keys in responses/logs

### 4. Data Layer (HIGH)

- `data-prefer-select-over-include` - Explicit column selection in Supabase queries
- `data-repository-pattern` - Isolate database technology behind repositories
- `data-repository-methods` - Consistent naming conventions for repository methods
- `data-dto-boundaries` - Use DTOs at architectural boundaries

### 5. API Layer (HIGH)

### 6. Performance (HIGH)

*See `performance/rules/` directory for performance rules*

### 7. UI/UX (HIGH)

- `uiux-interface-guidelines` - Comprehensive UI/UX best practices

### 8. Testing (MEDIUM-HIGH)

- `testing-coverage-requirements` - Maintain 80%+ test coverage for new code

### 9. Design Patterns (MEDIUM)

- `patterns-early-returns` - Reduce nesting with early returns
- `patterns-composition-over-prop-drilling` - Use React children/context over prop drilling

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/async-parallel.md
rules/bundle-barrel-imports.md
rules/_sections.md
```

Each rule file contains:
- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Additional context and references

## Rule Format

```markdown
---
title: Rule Title Here
impact: CRITICAL | HIGH | MEDIUM | LOW
impactDescription: Optional description (e.g., "20-50% improvement")
tags: tag1, tag2, tag3
---

## Rule Title Here

**Impact: LEVEL (optional description)**

Brief explanation of the rule and why it matters.

**Incorrect (description):**
\`\`\`typescript
// Bad code example
\`\`\`

**Correct (description):**
\`\`\`typescript
// Good code example
\`\`\`

Reference: [Link](url)
```

## Adding New Rules

1. Copy `_template.md` to a new file with the appropriate section prefix
2. Fill in the frontmatter (title, impact, tags)
3. Write a clear explanation of the rule
4. Provide incorrect and correct code examples
5. Add a reference link if applicable

## Usage

These rules are designed to be:
- **Human-readable**: Engineers can browse and learn from them
- **Machine-readable**: AI agents can parse and apply them
- **Modular**: Individual rules can be updated without affecting others
- **Versionable**: Changes are tracked in git history

## Core Principles

> We are building infrastructure that must almost never fail. To achieve this, we move fast while shipping amazing quality software with no shortcuts or compromises.

The rules in this directory encode the specific practices that enable this philosophy.