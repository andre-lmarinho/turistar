# Accessibility Guidelines

This project aims to meet WCAG 2.1 AA requirements. Use the checklist below when reviewing components and pages.

## WCAG Quick Checklist

- Provide text alternatives for all non-text content
- Ensure sufficient color contrast for text and UI elements
- Support full keyboard navigation and visible focus styles
- Avoid content that flashes more than three times per second
- Label form controls and interactive elements clearly
- Use semantic HTML and ARIA roles only when necessary
- Add `aria-label="Itinerary map"` to `<MapContainer>` components so screen
  readers can identify the map

Refer to the official guidelines for details: <https://www.w3.org/WAI/WCAG21/quickref/>

## Testing Accessibility

### Manual Testing

Run the axe DevTools browser extension on each page during development. The extension highlights common WCAG issues and offers suggestions for fixing them.

### Automated Testing

Use `jest-axe` with Vitest to catch accessibility regressions. A basic example:

```ts
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('home page is accessible', async () => {
  const { container } = render(<Home />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

Run `npm test` to execute the suite and include accessibility checks as part of CI.
