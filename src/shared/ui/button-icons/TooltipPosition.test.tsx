// src/components/ui/button-icons/TooltipPosition.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditCardButton, RemoveCardButton } from '@/shared/ui';

describe('icon tooltip position', () => {
  it('renders top tooltip by default', async () => {
    render(<RemoveCardButton title="Delete" />);

    const btn = screen.getByRole('button');
    fireEvent.mouseEnter(btn);
    fireEvent.mouseEnter(btn.firstChild as HTMLElement);
    await new Promise((r) => setTimeout(r, 0));
    const tooltip = await screen.findByText('Delete');
    expect(tooltip.className).toContain('-translate-y');
  });

  it('renders tooltip below icon when position="bottom"', async () => {
    render(<EditCardButton title="Edit" />);

    const btn = screen.getByRole('button');
    fireEvent.mouseEnter(btn);
    fireEvent.mouseEnter(btn.firstChild as HTMLElement);

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Edit');
    expect(tooltip.className).toContain('translate-y-[6px]');
  });
});
