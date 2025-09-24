// tests/unit/shared/ui/IconButton.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import IconButton from '@/shared/ui/IconButton';
import { X, Trash2, Palette, Pencil } from 'lucide-react';

describe('IconButton', () => {
  it('applies aria-label from ariaLabel prop', () => {
    render(
      <div>
        <IconButton icon={<X aria-hidden="true" />} ariaLabel="Close" data-testid="close" />
        <IconButton icon={<Trash2 aria-hidden="true" />} ariaLabel="Delete" data-testid="delete" />
        <IconButton
          icon={<Palette aria-hidden="true" />}
          ariaLabel="Card Color"
          data-testid="color"
        />
      </div>
    );

    expect(screen.getByTestId('close')).toHaveAttribute('aria-label', 'Close');
    expect(screen.getByTestId('delete')).toHaveAttribute('aria-label', 'Delete');
    expect(screen.getByTestId('color')).toHaveAttribute('aria-label', 'Card Color');
  });

  it('shows tooltip on hover', () => {
    render(<IconButton icon={<X aria-hidden="true" />} ariaLabel="Close" data-testid="close" />);

    const btn = screen.getByTestId('close');
    fireEvent.mouseEnter(btn);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Close');
  });

  it('renders top tooltip by default', async () => {
    render(<IconButton ariaLabel="Delete" icon={<Trash2 aria-hidden="true" />} />);

    const btn = screen.getByRole('button');
    fireEvent.mouseEnter(btn);
    fireEvent.mouseEnter(btn.firstChild as HTMLElement);
    await new Promise((r) => setTimeout(r, 0));
    const tooltip = await screen.findByText('Delete');
    expect(tooltip.className).toContain('-translate-y');
  });

  it('renders tooltip below icon when position="bottom"', async () => {
    render(<IconButton ariaLabel="Edit" icon={<Pencil aria-hidden="true" />} position="bottom" />);

    const btn = screen.getByRole('button');
    fireEvent.mouseEnter(btn);
    fireEvent.mouseEnter(btn.firstChild as HTMLElement);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Edit');
    expect(tooltip.className).toContain('translate-y-[6px]');
  });
});
