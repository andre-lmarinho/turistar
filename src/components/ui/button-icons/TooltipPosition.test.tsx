import React from 'react';
import { render, screen } from '@testing-library/react';
import { EditCardButton, RemoveCardButton } from '@/components';

describe('icon tooltip position', () => {
  it('renders top tooltip by default', () => {
    render(<RemoveCardButton title="Delete" />);
    const tooltip = screen.getByText('Delete');
    expect(tooltip.className).toContain('-top-7');
  });

  it('renders tooltip below icon when position="bottom"', () => {
    render(<EditCardButton title="Edit" />);
    const tooltip = screen.getByText('Edit');
    expect(tooltip.className).toContain('top-full');
    expect(tooltip.className).toContain('mt-1');
  });
});
