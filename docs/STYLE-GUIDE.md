# Style Guide

This document summarizes design patterns, naming conventions and accessibility rules for this project.

## Tailwind Tokens

The design system relies on CSS custom properties defined in `src/app/globals.css`. These tokens are exposed as Tailwind variables and should be referenced through `var(--token-name)`.

Common tokens include:

- `--card` and `--card-foreground` – background and text colors for cards.
- `--border` – default border color.
- `--input` – input background color.
- `--ring` – focus ring color.
- `--muted` and `--muted-foreground` – colors for disabled states.
- `--primary` and `--primary-foreground` – primary accent colors.
- `--secondary` and `--secondary-foreground` – secondary accent colors.
- `--accent` and `--accent-foreground` – highlight colors.

Use these variables with Tailwind's arbitrary values, e.g. `bg-[var(--card)]` or `text-[var(--card-foreground)]`.

## Naming Patterns for `cva` Variants

Component styles built with [`class-variance-authority`](https://github.com/joe-bell/cva) should follow a consistent naming scheme.

- Declare a constant named `<componentName>Variants` next to the component.
- Export the constant alongside the component so other modules can reuse the styles.
- Use `VariantProps<typeof <componentName>Variants>` for prop typing.

Example:

```ts
const buttonVariants = cva('base classes', {
  variants: {
    variant: { default: '...', muted: '...' },
    size: { sm: '...', lg: '...' },
  },
  defaultVariants: { variant: 'default', size: 'sm' },
});

export function Button(props: VariantProps<typeof buttonVariants>) {
  /* ... */
}
export { buttonVariants };
```

## Accessibility Rules

Follow accessible markup practices throughout the codebase.

- Use semantic elements whenever possible. Avoid applying `role="button"` to `<a>` elements – use a `<button>` or a link without the role.
- Provide meaningful labels for interactive controls using `aria-label`, `aria-labelledby` or visible text.
- Ensure keyboard interaction for custom components (e.g. handling `Enter` and `Space` keys when appropriate).
- Hidden content for assistive technology should use the `.sr-only` utility defined in `globals.css`.
- Elements labelled through their visible content must include that text in the accessible name.
- Touch targets for interactive controls should be at least 44×44&nbsp;px with appropriate spacing.
- Assign valid `role` values and prefer native elements over role overrides.
- Avoid repeating alternative text in adjacent visible captions or headings.
- Elements with `aria-hidden="true"` must not contain focusable content and should be removed when used solely for layout.
