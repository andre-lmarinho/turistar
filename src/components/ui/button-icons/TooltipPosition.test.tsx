import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditCardButton, RemoveCardButton } from '@/components';

describe('icon tooltip position', () => {
  it('renders top tooltip by default', () => {
    render(<RemoveCardButton title="Delete" />);

    const btn = screen.getByRole('button').firstChild as HTMLElement;
    fireEvent.mouseEnter(btn);
    fireEvent.mouseEnter(btn.firstChild as HTMLElement);
    const tooltip = screen.getByText('Delete');
    expect(tooltip.className).toContain('-translate-y');
  });

  it('renders tooltip below icon when position="bottom"', () => {
    render(<EditCardButton title="Edit" />);
    const btn = screen.getByRole('button').firstChild as HTMLElement;
    fireEvent.mouseEnter(btn);
    fireEvent.mouseEnter(btn.firstChild as HTMLElement);
    const tooltip = screen.getByText('Edit');
    expect(tooltip.className).toContain('translate-y-1');
  });
});
