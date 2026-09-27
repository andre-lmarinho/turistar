---
title: Composition Over Prop Drilling
impact: MEDIUM
impactDescription: Keeps intermediate components independent of unrelated data
tags: react, patterns, composition, context
---

# Prefer component composition

Use React children, component slots, and shared context to avoid passing data through components that do not use it.

- Compose content through `children` or named slots when an intermediate component only controls layout.
- Use context for state that multiple nested components need.
- Keep state and behavior with the component or provider that owns them.

[AccessShell](../../src/ui/components/layout/AccessShell.tsx) accepts `children` and a `footer` slot so each authentication screen supplies its content. [ClientProviders](../../src/app/providers.tsx) composes shared providers around the application.
