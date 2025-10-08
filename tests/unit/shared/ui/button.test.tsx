// tests/unit/shared/ui/button.test.tsx

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { Button } from '@/shared/ui/button';

describe('Button', () => {
  it('forwards refs to the underlying button element', () => {
    const ref = React.createRef<HTMLButtonElement>();

    render(
      <Button ref={ref} variant="default">
        Save
      </Button>
    );

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toHaveTextContent('Save');
  });

  it('applies icon-specific behaviours when variant includes icon', () => {
    const { getByRole } = render(<Button variant="icon" size="icon" title="Edit" icon="pencil" />);

    const button = getByRole('button', { name: 'Edit' });
    expect(button).toHaveAttribute('aria-label', 'Edit');
    expect(button.className).toContain('group/icon');
    expect(button.querySelector('svg')).toBeTruthy();
  });

  it('supports the outline variant for neutral buttons', () => {
    const { getByRole } = render(
      <Button variant="outline" size="sm">
        Neutral
      </Button>
    );

    const button = getByRole('button', { name: 'Neutral' });
    expect(button.className).toContain('border');
    expect(button.className).toContain('bg-background');
  });

  it('renders icons provided via props after the label when requested', () => {
    const { getByRole } = render(
      <Button icon="chevron-down" iconPosition="right">
        Toggle
      </Button>
    );

    const button = getByRole('button', { name: 'Toggle' });
    const svg = button.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.previousSibling?.textContent).toContain('Toggle');
  });
});
